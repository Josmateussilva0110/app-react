-- =============================================
-- MIGRATION: create_products_table
-- Cria os enums, a tabela products, índice de
-- performance e trigger de updated_at.
-- =============================================

-- =============================================
-- ENUMS
-- (uso de DO block para tornar a criação idempotente,
-- já que o Postgres não suporta CREATE TYPE IF NOT EXISTS)
-- =============================================
DO $$ BEGIN
  CREATE TYPE priority_type AS ENUM ('alta', 'media', 'baixa');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_type AS ENUM ('debito', 'credito', 'pix', 'dinheiro', 'nao_comprado');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE category_type AS ENUM ('alimentacao', 'lazer', 'esporte', 'investimento', 'saude', 'presentes');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- TABELA
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id           UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name         TEXT           NOT NULL CHECK (char_length(name) >= 3),
  price        NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  priority     priority_type  NOT NULL DEFAULT 'media',
  payment_type payment_type   NOT NULL DEFAULT 'nao_comprado',
  category     category_type  NOT NULL DEFAULT 'compras',
  date         DATE           NOT NULL,
  finished     BOOLEAN        NOT NULL DEFAULT FALSE,
  month_list   BOOLEAN        NOT NULL DEFAULT FALSE,

  created_at   TIMESTAMPTZ    DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    DEFAULT NOW()
);

-- =============================================
-- ÍNDICE (performance em queries por usuário)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- =============================================
-- TRIGGER: atualiza updated_at automaticamente
-- (função compartilhável por outras tabelas no futuro)
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();