-- Permite embed users:user_id em group_members via PostgREST (mesmo padrão de products).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'group_members_user_id_public_users_fkey'
      AND conrelid = 'public.group_members'::regclass
  ) THEN
    ALTER TABLE public.group_members
      ADD CONSTRAINT group_members_user_id_public_users_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;
