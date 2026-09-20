-- ================================================================
-- Fecha as 4 RPCs de ciclo de vida de grupo
--
-- 20260718103000 as criou com "REVOKE ALL ... FROM PUBLIC" apenas.
-- REVOKE de PUBLIC não remove concessão nominal, e o default do
-- Supabase para função em `public` é EXECUTE para `authenticated` —
-- então essas quatro seguiam alcançáveis por qualquer usuário logado
-- pelo PostgREST, sem passar pelo backend. O hotfix 20260920090000
-- aplicou o REVOKE nominal em cinco funções e deixou estas de fora.
--
-- As quatro são SECURITY DEFINER, recebem p_user_id por parâmetro e
-- nunca consultavam auth.uid(). Cenário concreto:
--   rpc/link_user_personal_products_to_group
--     { p_user_id: <vítima>, p_group_id: <grupo do atacante> }
--   → todos os produtos da vítima entram em group_products, e o
--     filtro de escopo (correto) de GET /products passa a devolvê-los
--     ao atacante.
--
-- Duas camadas, na ordem em que importam:
--   1. ACL nominal (o que efetivamente fecha a porta hoje);
--   2. portão auth.uid() dentro de cada função, para o GRANT deixar
--      de ser a única coisa entre o atacante e a conta alheia.
--      auth.uid() é NULL sob service_role, então o backend não muda
--      de comportamento. Mesmo padrão de get_product_stats
--      (20260919120000:39-48).
--
-- De carona, SQLERRM sai dos retornos: ele chegava ao toast do app
-- via resolveGroupRpcError (utils/groupRpc.ts:40), expondo nome de
-- tabela e de constraint. Agora vai para o log do Postgres.
--
-- Só REVOKE/GRANT e CREATE OR REPLACE — nenhum DROP, nenhuma policy,
-- nada tocando service_role. CREATE OR REPLACE preserva oid e ACL,
-- então a ordem entre as duas metades é indiferente.
-- ================================================================


-- ----------------------------------------------------------------
-- 1. ACL nominal
-- ----------------------------------------------------------------
REVOKE ALL ON FUNCTION public.link_user_personal_products_to_group(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.link_user_personal_products_to_group(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.link_user_personal_products_to_group(uuid, uuid) FROM authenticated;

REVOKE ALL ON FUNCTION public.create_group_with_owner(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_group_with_owner(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.create_group_with_owner(uuid, text) FROM authenticated;

REVOKE ALL ON FUNCTION public.join_group_with_products(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_group_with_products(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.join_group_with_products(uuid, text) FROM authenticated;

REVOKE ALL ON FUNCTION public.leave_group(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_group(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.leave_group(uuid) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.link_user_personal_products_to_group(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_group_with_owner(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.join_group_with_products(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.leave_group(uuid) TO service_role;


-- ----------------------------------------------------------------
-- 2. Portão auth.uid() dentro de cada função
--
-- O portão fica num bloco externo, antes do BEGIN que carrega o
-- "EXCEPTION WHEN OTHERS" — senão o próprio handler engoliria o
-- RAISE e devolveria ok:false, escondendo a violação do log.
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.link_user_personal_products_to_group(
  p_user_id UUID,
  p_group_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Sob service_role auth.uid() é NULL: o backend passa direto.
  IF auth.uid() IS NOT NULL THEN
    IF auth.uid() IS DISTINCT FROM p_user_id THEN
      RAISE EXCEPTION 'forbidden: p_user_id must match authenticated user';
    END IF;
    -- Sem isto, o dono ainda poderia despejar os próprios produtos
    -- dentro de um grupo alheio.
    IF NOT public.is_group_member(p_group_id) THEN
      RAISE EXCEPTION 'forbidden: not a member of the requested group';
    END IF;
  END IF;

  INSERT INTO public.group_products (group_id, product_id)
  SELECT p_group_id, p.id
  FROM public.products p
  WHERE p.user_id = p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.group_products gp WHERE gp.product_id = p.id
    )
  ON CONFLICT (product_id) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_group_with_owner(
  p_user_id UUID,
  p_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
  v_group_id UUID;
  v_products_linked INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'forbidden: p_user_id must match authenticated user';
  END IF;

  BEGIN
    IF EXISTS (SELECT 1 FROM public.group_members WHERE user_id = p_user_id) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'GROUP_ALREADY_IN_GROUP');
    END IF;

    v_name := trim(p_name);
    IF char_length(v_name) < 2 OR char_length(v_name) > 60 THEN
      RETURN jsonb_build_object(
        'ok', false,
        'error', 'GROUP_CREATE_FAILED',
        'message', 'Nome do grupo inválido.'
      );
    END IF;

    INSERT INTO public.groups (name, created_by)
    VALUES (v_name, p_user_id)
    RETURNING id INTO v_group_id;

    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (v_group_id, p_user_id, 'owner');

    INSERT INTO public.goals (scope, group_id, user_id, monthly_goal, updated_by)
    VALUES ('group', v_group_id, NULL, 0, p_user_id);

    v_products_linked := public.link_user_personal_products_to_group(p_user_id, v_group_id);

    RETURN jsonb_build_object(
      'ok', true,
      'group_id', v_group_id,
      'group_name', v_name,
      'products_linked', v_products_linked
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Detalhe de banco vai para o log do servidor, nunca para a tela.
      RAISE WARNING '[create_group_with_owner] user=% sqlstate=% %', p_user_id, SQLSTATE, SQLERRM;
      RETURN jsonb_build_object('ok', false, 'error', 'GROUP_CREATE_FAILED');
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_group_with_products(
  p_user_id UUID,
  p_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_invite_id UUID;
  v_group_id UUID;
  v_group_name TEXT;
  v_status public.group_invite_status;
  v_expires_at TIMESTAMPTZ;
  v_products_linked INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'forbidden: p_user_id must match authenticated user';
  END IF;

  BEGIN
    IF EXISTS (SELECT 1 FROM public.group_members WHERE user_id = p_user_id) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'GROUP_ALREADY_IN_GROUP');
    END IF;

    v_code := upper(trim(p_code));

    SELECT i.id, i.group_id, g.name, i.status, i.expires_at
    INTO v_invite_id, v_group_id, v_group_name, v_status, v_expires_at
    FROM public.group_invites i
    INNER JOIN public.groups g ON g.id = i.group_id
    WHERE i.code = v_code;

    IF v_invite_id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'GROUP_INVITE_INVALID');
    END IF;

    IF v_status <> 'pending' OR v_expires_at < now() THEN
      RETURN jsonb_build_object('ok', false, 'error', 'GROUP_INVITE_INVALID');
    END IF;

    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (v_group_id, p_user_id, 'member');

    UPDATE public.group_invites
    SET status = 'accepted'
    WHERE id = v_invite_id;

    v_products_linked := public.link_user_personal_products_to_group(p_user_id, v_group_id);

    RETURN jsonb_build_object(
      'ok', true,
      'group_id', v_group_id,
      'group_name', v_group_name,
      'products_linked', v_products_linked
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING '[join_group_with_products] user=% sqlstate=% %', p_user_id, SQLSTATE, SQLERRM;
      RETURN jsonb_build_object('ok', false, 'error', 'GROUP_JOIN_FAILED');
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_group(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id UUID;
  v_role public.group_role;
  v_member_count INTEGER;
  v_products_unlinked INTEGER;
  v_group_deleted BOOLEAN := false;
  v_next_owner UUID;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'forbidden: p_user_id must match authenticated user';
  END IF;

  BEGIN
    SELECT gm.group_id, gm.role
    INTO v_group_id, v_role
    FROM public.group_members gm
    WHERE gm.user_id = p_user_id;

    IF v_group_id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'GROUP_NOT_IN_GROUP');
    END IF;

    DELETE FROM public.group_products gp
    USING public.products p
    WHERE gp.product_id = p.id
      AND gp.group_id = v_group_id
      AND p.user_id = p_user_id;

    GET DIAGNOSTICS v_products_unlinked = ROW_COUNT;

    SELECT count(*)::INTEGER
    INTO v_member_count
    FROM public.group_members
    WHERE group_id = v_group_id;

    IF v_member_count = 1 THEN
      DELETE FROM public.goals WHERE group_id = v_group_id;
      DELETE FROM public.group_invites WHERE group_id = v_group_id;
      DELETE FROM public.group_members WHERE group_id = v_group_id;
      DELETE FROM public.groups WHERE id = v_group_id;
      v_group_deleted := true;
    ELSE
      IF v_role = 'owner' THEN
        SELECT gm.user_id
        INTO v_next_owner
        FROM public.group_members gm
        WHERE gm.group_id = v_group_id
          AND gm.user_id <> p_user_id
        ORDER BY gm.joined_at ASC
        LIMIT 1;

        IF v_next_owner IS NOT NULL THEN
          UPDATE public.group_members
          SET role = 'owner'
          WHERE group_id = v_group_id
            AND user_id = v_next_owner;
        END IF;
      END IF;

      DELETE FROM public.group_members
      WHERE group_id = v_group_id
        AND user_id = p_user_id;
    END IF;

    RETURN jsonb_build_object(
      'ok', true,
      'group_id', v_group_id,
      'group_deleted', v_group_deleted,
      'products_unlinked', v_products_unlinked
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING '[leave_group] user=% sqlstate=% %', p_user_id, SQLSTATE, SQLERRM;
      RETURN jsonb_build_object('ok', false, 'error', 'GROUP_LEAVE_FAILED');
  END;
END;
$$;
