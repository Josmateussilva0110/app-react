-- ================================================================
-- Produtos no grupo via tabela auxiliar (remove products.group_id)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.group_products (
  group_id    UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  linked_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id)
);

CREATE INDEX IF NOT EXISTS idx_group_products_group
  ON public.group_products(group_id);

-- Backfill a partir de products.group_id (se a coluna ainda existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'group_id'
  ) THEN
    INSERT INTO public.group_products (group_id, product_id)
    SELECT p.group_id, p.id
    FROM public.products p
    WHERE p.group_id IS NOT NULL
    ON CONFLICT (product_id) DO NOTHING;
  END IF;
END $$;

-- Helpers (antes de alterar RLS e dropar coluna)
CREATE OR REPLACE FUNCTION public.is_product_in_group(p_product_id UUID, p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_products
    WHERE product_id = p_product_id AND group_id = p_group_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_product_personal(p_product_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = p_product_id
      AND p.user_id = p_user_id
      AND NOT EXISTS (
        SELECT 1 FROM public.group_products gp WHERE gp.product_id = p.id
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.unlink_user_group_products(p_user_id UUID, p_group_id UUID)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  DELETE FROM public.group_products gp
  USING public.products p
  WHERE gp.product_id = p.id
    AND gp.group_id = p_group_id
    AND p.user_id = p_user_id;
$$;

-- RLS products (junction-based) — remover policies antigas que referenciam group_id
DROP POLICY IF EXISTS "users_select_scoped_products" ON public.products;

CREATE POLICY "users_select_scoped_products"
ON public.products FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.group_products gp
    WHERE gp.product_id = products.id
      AND public.is_group_member(gp.group_id)
  )
);

DROP POLICY IF EXISTS "users_insert_scoped_products" ON public.products;

CREATE POLICY "users_insert_scoped_products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS group_products
ALTER TABLE public.group_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_select_group_products" ON public.group_products;
CREATE POLICY "members_select_group_products"
ON public.group_products FOR SELECT TO authenticated
USING (public.is_group_member(group_id));

-- Stats RPC: escopo via junction (substituir antes de dropar products.group_id)
DROP FUNCTION IF EXISTS public.stats_scope_predicate(uuid, uuid, uuid, uuid);

CREATE OR REPLACE FUNCTION public.stats_scope_predicate(
  p_product_user_id uuid,
  p_product_id uuid,
  p_viewer_user_id uuid,
  p_group_id uuid
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    (p_group_id IS NULL
      AND p_product_user_id = p_viewer_user_id
      AND NOT EXISTS (
        SELECT 1 FROM public.group_products gp WHERE gp.product_id = p_product_id
      ))
    OR (p_group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.group_products gp
      WHERE gp.product_id = p_product_id AND gp.group_id = p_group_id
    ))
  );
$$;

DROP INDEX IF EXISTS public.idx_products_group_id;
DROP INDEX IF EXISTS public.idx_products_user_solo;
DROP INDEX IF EXISTS public.idx_products_scope;

ALTER TABLE public.products DROP COLUMN IF EXISTS group_id;

-- get_product_stats (assinatura com escopo por product_id)
DROP FUNCTION IF EXISTS public.get_product_stats(integer, integer, uuid, uuid, uuid, text, boolean);
DROP FUNCTION IF EXISTS public.get_product_stats(integer, integer, uuid, text, boolean);

CREATE OR REPLACE FUNCTION public.get_product_stats(
  p_month integer,
  p_year integer,
  p_viewer_user_id uuid,
  p_group_id uuid DEFAULT NULL,
  p_filter_user_id uuid DEFAULT NULL,
  p_status text DEFAULT 'todos',
  p_month_list boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month_start date;
  v_month_end date;
  v_year_start date;
  v_year_end date;
  v_totals record;
  v_by_category jsonb;
  v_by_payment jsonb;
  v_evolution jsonb;
  v_users jsonb;
BEGIN
  IF p_month IS NULL OR p_month < 1 OR p_month > 12 THEN
    RAISE EXCEPTION 'p_month must be between 1 and 12';
  END IF;
  IF p_year IS NULL OR p_year < 2000 OR p_year > 2100 THEN
    RAISE EXCEPTION 'p_year must be between 2000 and 2100';
  END IF;
  IF p_viewer_user_id IS NULL THEN
    RAISE EXCEPTION 'p_viewer_user_id is required';
  END IF;
  IF p_status IS NULL OR p_status NOT IN ('todos', 'pendente', 'finalizado') THEN
    RAISE EXCEPTION 'p_status must be todos|pendente|finalizado';
  END IF;

  v_month_start := make_date(p_year, p_month, 1);
  v_month_end := (v_month_start + INTERVAL '1 month')::date;
  v_year_start := make_date(p_year, 1, 1);
  v_year_end := make_date(p_year + 1, 1, 1);

  SELECT
    COALESCE(SUM(p.price), 0)::float8 AS total,
    COALESCE(SUM(p.price) FILTER (WHERE p.month_list), 0)::float8 AS month_list_total,
    COUNT(*)::int AS items_count,
    COUNT(*) FILTER (WHERE NOT p.finished)::int AS pending_count
  INTO v_totals
  FROM public.products p
  WHERE p.date >= v_month_start
    AND p.date < v_month_end
    AND public.stats_scope_predicate(p.user_id, p.id, p_viewer_user_id, p_group_id)
    AND (p_filter_user_id IS NULL OR p.user_id = p_filter_user_id)
    AND (p_month_list IS NULL OR p.month_list = p_month_list)
    AND (
      p_status = 'todos'
      OR (p_status = 'finalizado' AND p.finished)
      OR (p_status = 'pendente' AND NOT p.finished)
    );

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('category', x.category, 'total', x.total, 'count', x.count)
      ORDER BY x.total DESC
    ),
    '[]'::jsonb
  )
  INTO v_by_category
  FROM (
    SELECT p.category::text AS category, SUM(p.price)::float8 AS total, COUNT(*)::int AS count
    FROM public.products p
    WHERE p.date >= v_month_start AND p.date < v_month_end
      AND public.stats_scope_predicate(p.user_id, p.id, p_viewer_user_id, p_group_id)
      AND (p_filter_user_id IS NULL OR p.user_id = p_filter_user_id)
      AND (p_month_list IS NULL OR p.month_list = p_month_list)
      AND (
        p_status = 'todos'
        OR (p_status = 'finalizado' AND p.finished)
        OR (p_status = 'pendente' AND NOT p.finished)
      )
    GROUP BY p.category
  ) x;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('paymentType', x.payment_type, 'total', x.total)
      ORDER BY x.total DESC
    ),
    '[]'::jsonb
  )
  INTO v_by_payment
  FROM (
    SELECT p.payment_type::text AS payment_type, SUM(p.price)::float8 AS total
    FROM public.products p
    WHERE p.date >= v_month_start AND p.date < v_month_end
      AND public.stats_scope_predicate(p.user_id, p.id, p_viewer_user_id, p_group_id)
      AND (p_filter_user_id IS NULL OR p.user_id = p_filter_user_id)
      AND (p_month_list IS NULL OR p.month_list = p_month_list)
      AND (
        p_status = 'todos'
        OR (p_status = 'finalizado' AND p.finished)
        OR (p_status = 'pendente' AND NOT p.finished)
      )
    GROUP BY p.payment_type
  ) x;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('userId', s.user_id, 'userName', s.user_name, 'data', s.data)
      ORDER BY s.user_name
    ),
    '[]'::jsonb
  )
  INTO v_evolution
  FROM (
    WITH year_users AS (
      SELECT DISTINCT p.user_id
      FROM public.products p
      WHERE p.date >= v_year_start AND p.date < v_year_end
        AND public.stats_scope_predicate(p.user_id, p.id, p_viewer_user_id, p_group_id)
        AND (p_month_list IS NULL OR p.month_list = p_month_list)
        AND (
          p_status = 'todos'
          OR (p_status = 'finalizado' AND p.finished)
          OR (p_status = 'pendente' AND NOT p.finished)
        )
    ),
    months AS (SELECT generate_series(1, 12) AS month),
    grid AS (
      SELECT yu.user_id, m.month, COALESCE(SUM(p.price), 0)::float8 AS total
      FROM year_users yu
      CROSS JOIN months m
      LEFT JOIN public.products p
        ON p.user_id = yu.user_id
       AND EXTRACT(MONTH FROM p.date)::int = m.month
       AND p.date >= v_year_start AND p.date < v_year_end
       AND public.stats_scope_predicate(p.user_id, p.id, p_viewer_user_id, p_group_id)
       AND (p_month_list IS NULL OR p.month_list = p_month_list)
       AND (
         p_status = 'todos'
         OR (p_status = 'finalizado' AND p.finished)
         OR (p_status = 'pendente' AND NOT p.finished)
       )
      GROUP BY yu.user_id, m.month
    )
    SELECT g.user_id::text AS user_id, COALESCE(u.username, '') AS user_name,
           jsonb_agg(g.total ORDER BY g.month) AS data
    FROM grid g
    JOIN public.users u ON u.id = g.user_id
    GROUP BY g.user_id, u.username
  ) s;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('id', u.id::text, 'name', COALESCE(u.username, ''))
      ORDER BY COALESCE(u.username, '')
    ),
    '[]'::jsonb
  )
  INTO v_users
  FROM (
    SELECT DISTINCT p.user_id
    FROM public.products p
    WHERE public.stats_scope_predicate(p.user_id, p.id, p_viewer_user_id, p_group_id)
  ) d
  JOIN public.users u ON u.id = d.user_id;

  RETURN jsonb_build_object(
    'total', COALESCE(v_totals.total, 0),
    'monthListTotal', COALESCE(v_totals.month_list_total, 0),
    'itemsCount', COALESCE(v_totals.items_count, 0),
    'pendingCount', COALESCE(v_totals.pending_count, 0),
    'byCategory', COALESCE(v_by_category, '[]'::jsonb),
    'byPayment', COALESCE(v_by_payment, '[]'::jsonb),
    'evolution', jsonb_build_object(
      'months', jsonb_build_array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
      'series', COALESCE(v_evolution, '[]'::jsonb)
    ),
    'users', COALESCE(v_users, '[]'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_product_stats(integer, integer, uuid, uuid, uuid, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_product_stats(integer, integer, uuid, uuid, uuid, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_product_stats(integer, integer, uuid, uuid, uuid, text, boolean) TO authenticated;

GRANT EXECUTE ON FUNCTION public.unlink_user_group_products(uuid, uuid) TO service_role;

COMMENT ON TABLE public.group_products IS
  'Links products shared with a group. Products always belong to user_id on products; leaving a group removes rows here.';
