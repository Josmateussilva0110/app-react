-- =============================================
-- MIGRATION: products_user_fk_public_users
-- Adiciona FK de products.user_id -> public.users.id
-- para permitir embed (JOIN) via PostgREST e eliminar
-- o padrão N+1 de resolver username via
-- supabase.auth.admin.getUserById em loop.
--
-- Seguro: public.users.id já referencia auth.users(id),
-- então os valores de products.user_id sempre baterão
-- com public.users.id. A FK original para auth.users
-- é mantida.
--
-- Também adiciona índice para acelerar o ORDER BY date
-- usado na listagem paginada.
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_user_id_public_users_fkey'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_user_id_public_users_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_date ON public.products(date DESC);
