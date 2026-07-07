-- =============================================
-- MIGRATION: products_rls_policies
-- Habilita RLS e define as policies de acesso
-- da tabela products.
--
-- Regra de negócio: a lista de produtos é
-- compartilhada entre os usuários autenticados
-- (SELECT liberado para todos), mas escrita
-- (INSERT/UPDATE/DELETE) é restrita ao dono
-- do registro (user_id = auth.uid()).
-- =============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_insert_own_products" ON products;
DROP POLICY IF EXISTS "authenticated_select_products" ON products;
DROP POLICY IF EXISTS "users_update_own_products" ON products;
DROP POLICY IF EXISTS "users_delete_own_products" ON products;

-- Inserir só com o próprio user_id
CREATE POLICY "users_insert_own_products"
ON products FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ver todos os produtos (app compartilha a lista entre usuários)
CREATE POLICY "authenticated_select_products"
ON products FOR SELECT TO authenticated
USING (true);

-- Atualizar só os próprios
CREATE POLICY "users_update_own_products"
ON products FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Deletar só os próprios
CREATE POLICY "users_delete_own_products"
ON products FOR DELETE TO authenticated
USING (auth.uid() = user_id);