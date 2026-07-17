-- ================================================================
-- Grupos opcionais + escopo solo (produtos pessoais vs compartilhados)
-- ================================================================

DO $$ BEGIN
  CREATE TYPE group_role AS ENUM ('owner', 'member');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE group_invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 60),
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       group_role NOT NULL DEFAULT 'member',
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id),
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);

CREATE TABLE IF NOT EXISTS public.group_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  code        TEXT NOT NULL UNIQUE,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      group_invite_status NOT NULL DEFAULT 'pending',
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_invites_code ON public.group_invites(code)
  WHERE status = 'pending';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_group_id ON public.products(group_id);
CREATE INDEX IF NOT EXISTS idx_products_user_solo ON public.products(user_id) WHERE group_id IS NULL;

CREATE TABLE IF NOT EXISTS public.goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope         TEXT NOT NULL,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id      UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  monthly_goal  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

DO $$ BEGIN
  ALTER TABLE public.goals
    ADD CONSTRAINT goals_scope_values_check CHECK (scope IN ('user', 'group'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.goals
    ADD CONSTRAINT goals_monthly_goal_nonneg_check CHECK (monthly_goal >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.goals
    ADD CONSTRAINT goals_scope_target_check CHECK (
      (scope = 'user'  AND user_id IS NOT NULL AND group_id IS NULL) OR
      (scope = 'group' AND group_id IS NOT NULL AND user_id IS NULL)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id) WHERE scope = 'user' AND user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_goals_group ON public.goals(group_id) WHERE scope = 'group' AND group_id IS NOT NULL;

-- Metas pessoais para usuários existentes
INSERT INTO public.goals (scope, user_id, monthly_goal, updated_by)
SELECT 'user', u.id, COALESCE(s.monthly_goal, 0), s.updated_by
FROM public.users u
LEFT JOIN public.app_settings s ON s.id = 'global'
WHERE NOT EXISTS (
  SELECT 1 FROM public.goals g WHERE g.scope = 'user' AND g.user_id = u.id
);

-- Helpers RLS
CREATE OR REPLACE FUNCTION public.current_user_group_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT group_id FROM public.group_members WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_owner(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = auth.uid() AND role = 'owner'
  );
$$;

-- RLS products: escopo solo ou grupo
DROP POLICY IF EXISTS "authenticated_select_products" ON public.products;
DROP POLICY IF EXISTS "users_select_scoped_products" ON public.products;

CREATE POLICY "users_select_scoped_products"
ON public.products FOR SELECT TO authenticated
USING (
  (group_id IS NULL AND user_id = auth.uid())
  OR (group_id IS NOT NULL AND public.is_group_member(group_id))
);

DROP POLICY IF EXISTS "users_insert_own_products" ON public.products;
DROP POLICY IF EXISTS "users_insert_scoped_products" ON public.products;

CREATE POLICY "users_insert_scoped_products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    (group_id IS NULL AND public.current_user_group_id() IS NULL)
    OR (group_id = public.current_user_group_id())
  )
);

-- RLS grupos
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_select_group" ON public.groups;
CREATE POLICY "members_select_group"
ON public.groups FOR SELECT TO authenticated
USING (public.is_group_member(id));

DROP POLICY IF EXISTS "members_select_group_members" ON public.group_members;
CREATE POLICY "members_select_group_members"
ON public.group_members FOR SELECT TO authenticated
USING (public.is_group_member(group_id));

DROP POLICY IF EXISTS "owners_select_group_invites" ON public.group_invites;
CREATE POLICY "owners_select_group_invites"
ON public.group_invites FOR SELECT TO authenticated
USING (public.is_group_owner(group_id));

DROP POLICY IF EXISTS "users_select_goals" ON public.goals;
CREATE POLICY "users_select_goals"
ON public.goals FOR SELECT TO authenticated
USING (
  (scope = 'user' AND user_id = auth.uid())
  OR (scope = 'group' AND public.is_group_member(group_id))
);
