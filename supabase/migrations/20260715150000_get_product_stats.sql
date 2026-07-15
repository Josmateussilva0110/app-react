-- =============================================
-- MIGRATION: get_product_stats + índices
-- Agrega cards/gráficos do dashboard no Postgres
-- (evita SELECT de até 10k linhas + loop em Node).
-- =============================================

CREATE INDEX IF NOT EXISTS idx_products_date_finished
  ON public.products (date, finished);

CREATE INDEX IF NOT EXISTS idx_products_date_user
  ON public.products (date, user_id);

CREATE OR REPLACE FUNCTION public.get_product_stats(
  p_month integer,
  p_year integer,
  p_user_id uuid DEFAULT NULL,
  p_status text DEFAULT 'todos'
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
  IF p_status IS NULL OR p_status NOT IN ('todos', 'pendente', 'finalizado') THEN
    RAISE EXCEPTION 'p_status must be todos|pendente|finalizado';
  END IF;

  v_month_start := make_date(p_year, p_month, 1);
  v_month_end := (v_month_start + INTERVAL '1 month')::date;
  v_year_start := make_date(p_year, 1, 1);
  v_year_end := make_date(p_year + 1, 1, 1);

  -- Cards do mês (aplica filtro de usuário + status).
  SELECT
    COALESCE(SUM(p.price), 0)::float8 AS total,
    COALESCE(SUM(p.price) FILTER (WHERE p.month_list), 0)::float8 AS month_list_total,
    COUNT(*)::int AS items_count,
    COUNT(*) FILTER (WHERE NOT p.finished)::int AS pending_count
  INTO v_totals
  FROM public.products p
  WHERE p.date >= v_month_start
    AND p.date < v_month_end
    AND (p_user_id IS NULL OR p.user_id = p_user_id)
    AND (
      p_status = 'todos'
      OR (p_status = 'finalizado' AND p.finished)
      OR (p_status = 'pendente' AND NOT p.finished)
    );

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'category', x.category,
        'total', x.total,
        'count', x.count
      )
      ORDER BY x.total DESC
    ),
    '[]'::jsonb
  )
  INTO v_by_category
  FROM (
    SELECT
      p.category::text AS category,
      SUM(p.price)::float8 AS total,
      COUNT(*)::int AS count
    FROM public.products p
    WHERE p.date >= v_month_start
      AND p.date < v_month_end
      AND (p_user_id IS NULL OR p.user_id = p_user_id)
      AND (
        p_status = 'todos'
        OR (p_status = 'finalizado' AND p.finished)
        OR (p_status = 'pendente' AND NOT p.finished)
      )
    GROUP BY p.category
  ) x;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'paymentType', x.payment_type,
        'total', x.total
      )
      ORDER BY x.total DESC
    ),
    '[]'::jsonb
  )
  INTO v_by_payment
  FROM (
    SELECT
      p.payment_type::text AS payment_type,
      SUM(p.price)::float8 AS total
    FROM public.products p
    WHERE p.date >= v_month_start
      AND p.date < v_month_end
      AND (p_user_id IS NULL OR p.user_id = p_user_id)
      AND (
        p_status = 'todos'
        OR (p_status = 'finalizado' AND p.finished)
        OR (p_status = 'pendente' AND NOT p.finished)
      )
    GROUP BY p.payment_type
  ) x;

  -- Evolução do ano por usuário (aplica status; NÃO aplica userId — comparação).
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'userId', s.user_id,
        'userName', s.user_name,
        'data', s.data
      )
      ORDER BY s.user_name
    ),
    '[]'::jsonb
  )
  INTO v_evolution
  FROM (
    WITH year_users AS (
      SELECT DISTINCT p.user_id
      FROM public.products p
      WHERE p.date >= v_year_start
        AND p.date < v_year_end
        AND (
          p_status = 'todos'
          OR (p_status = 'finalizado' AND p.finished)
          OR (p_status = 'pendente' AND NOT p.finished)
        )
    ),
    months AS (
      SELECT generate_series(1, 12) AS month
    ),
    grid AS (
      SELECT
        yu.user_id,
        m.month,
        COALESCE(SUM(p.price), 0)::float8 AS total
      FROM year_users yu
      CROSS JOIN months m
      LEFT JOIN public.products p
        ON p.user_id = yu.user_id
       AND EXTRACT(MONTH FROM p.date)::int = m.month
       AND p.date >= v_year_start
       AND p.date < v_year_end
       AND (
         p_status = 'todos'
         OR (p_status = 'finalizado' AND p.finished)
         OR (p_status = 'pendente' AND NOT p.finished)
       )
      GROUP BY yu.user_id, m.month
    )
    SELECT
      g.user_id::text AS user_id,
      COALESCE(u.username, '') AS user_name,
      jsonb_agg(g.total ORDER BY g.month) AS data
    FROM grid g
    JOIN public.users u ON u.id = g.user_id
    GROUP BY g.user_id, u.username
  ) s;

  -- Usuários com pelo menos um produto (dropdown do dashboard).
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', u.id::text,
        'name', COALESCE(u.username, '')
      )
      ORDER BY COALESCE(u.username, '')
    ),
    '[]'::jsonb
  )
  INTO v_users
  FROM (
    SELECT DISTINCT p.user_id
    FROM public.products p
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

REVOKE ALL ON FUNCTION public.get_product_stats(integer, integer, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_product_stats(integer, integer, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_product_stats(integer, integer, uuid, text) TO authenticated;

COMMENT ON FUNCTION public.get_product_stats(integer, integer, uuid, text) IS
  'Dashboard aggregates: monthly cards/charts + yearly evolution series.';
