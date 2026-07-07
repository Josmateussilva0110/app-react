-- =============================================
-- MIGRATION: add_category_types
-- Adiciona novas categorias ao enum category_type.
--
-- Observação: ALTER TYPE ... ADD VALUE não pode ser
-- usado na mesma transação em que o novo valor é
-- referenciado, por isso essa migration só adiciona
-- os valores (uso deles em outras migrations/queries
-- deve ocorrer em uma transação/migration futura).
-- IF NOT EXISTS garante idempotência ao rodar de novo.
-- =============================================

ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'vestuario';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'eletronicos';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'cuidados_pessoais';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'casa';