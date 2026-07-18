-- ================================================================
-- Group lifecycle RPCs (atomic transactions)
-- create_group_with_owner / join_group_with_products / leave_group
-- ================================================================

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
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'GROUP_CREATE_FAILED',
      'message', SQLERRM
    );
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
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'GROUP_JOIN_FAILED',
      'message', SQLERRM
    );
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
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'GROUP_LEAVE_FAILED',
      'message', SQLERRM
    );
END;
$$;

REVOKE ALL ON FUNCTION public.link_user_personal_products_to_group(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_group_with_owner(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_group_with_products(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_group(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.link_user_personal_products_to_group(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_group_with_owner(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.join_group_with_products(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.leave_group(UUID) TO service_role;
