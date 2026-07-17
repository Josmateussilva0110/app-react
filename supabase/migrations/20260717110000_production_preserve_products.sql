-- ================================================================
-- PRODUÇÃO: preservar produtos existentes na migração solo/grupo
--
-- Regras:
-- - NENHUM produto é apagado
-- - user_id de cada produto permanece com quem cadastrou
-- - 1 usuário  → produtos ficam pessoais (group_id NULL)
-- - 2+ usuários → grupo legado "Lista compartilhada" mantém visão
--   compartilhada que existia antes (todos os produtos no grupo)
-- ================================================================

-- Garantia: nenhum produto perde o dono
UPDATE public.products
SET group_id = NULL
WHERE group_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.groups g WHERE g.id = products.group_id);

DO $$
DECLARE
  user_count INTEGER;
  legacy_group_id UUID;
  owner_id UUID;
  global_goal NUMERIC(12, 2);
  global_updated_by UUID;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;

  IF user_count < 2 THEN
    RAISE NOTICE 'Produção solo (% usuário(s)): produtos permanecem pessoais.', user_count;
    RETURN;
  END IF;

  SELECT COALESCE(monthly_goal, 0), updated_by
  INTO global_goal, global_updated_by
  FROM public.app_settings
  WHERE id = 'global'
  LIMIT 1;

  IF global_goal IS NULL THEN
    global_goal := 0;
  END IF;

  SELECT g.id INTO legacy_group_id
  FROM public.groups g
  WHERE g.name = 'Lista compartilhada'
  LIMIT 1;

  IF legacy_group_id IS NULL THEN
    SELECT u.id INTO owner_id
    FROM public.users u
    ORDER BY u.created_at ASC NULLS LAST
    LIMIT 1;

    INSERT INTO public.groups (name, created_by)
    VALUES ('Lista compartilhada', owner_id)
    RETURNING id INTO legacy_group_id;

    INSERT INTO public.group_members (group_id, user_id, role)
    SELECT
      legacy_group_id,
      u.id,
      CASE WHEN u.id = owner_id THEN 'owner'::group_role ELSE 'member'::group_role END
    FROM public.users u
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.goals (scope, group_id, user_id, monthly_goal, updated_by)
    SELECT 'group', legacy_group_id, NULL, global_goal, global_updated_by
    WHERE NOT EXISTS (
      SELECT 1 FROM public.goals g WHERE g.scope = 'group' AND g.group_id = legacy_group_id
    );
  END IF;

  UPDATE public.products
  SET group_id = legacy_group_id
  WHERE group_id IS NULL;

  RAISE NOTICE 'Grupo legado %: % produtos associados para % usuários.',
    legacy_group_id,
    (SELECT COUNT(*) FROM public.products WHERE group_id = legacy_group_id),
    user_count;
END $$;

-- Metas pessoais para quem ainda não tem (não remove metas existentes)
INSERT INTO public.goals (scope, user_id, monthly_goal, updated_by)
SELECT 'user', u.id, 0, u.id
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.goals g WHERE g.scope = 'user' AND g.user_id = u.id
);

-- Auditoria (rode manualmente após migration para validar):
-- SELECT COUNT(*) AS total_produtos FROM public.products;
-- SELECT user_id, COUNT(*) FROM public.products GROUP BY user_id;
-- SELECT COUNT(*) AS produtos_sem_dono FROM public.products p
--   LEFT JOIN public.users u ON u.id = p.user_id WHERE u.id IS NULL;
