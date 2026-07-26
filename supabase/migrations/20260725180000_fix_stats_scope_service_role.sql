-- Corrige stats_scope_predicate: is_group_member() usa auth.uid(), que é NULL
-- quando o backend chama a RPC com service_role — zerava totais/gráficos em modo grupo.

CREATE OR REPLACE FUNCTION public.stats_scope_predicate(
  p_product_user_id uuid,
  p_product_id uuid,
  p_viewer_user_id uuid,
  p_group_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT (
    (p_group_id IS NULL
      AND p_product_user_id = p_viewer_user_id
      AND NOT EXISTS (
        SELECT 1 FROM public.group_products gp WHERE gp.product_id = p_product_id
      ))
    OR (
      p_group_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = p_group_id AND gm.user_id = p_viewer_user_id
      )
      AND EXISTS (
        SELECT 1 FROM public.group_products gp
        WHERE gp.product_id = p_product_id AND gp.group_id = p_group_id
      )
    )
  );
$$;
