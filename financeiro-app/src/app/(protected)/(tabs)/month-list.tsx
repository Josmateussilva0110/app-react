import { useMemo } from "react";
import { ItemListScreen } from "@/features/list/components/item-list-screen";
import { useProducts } from "@/hooks/use-products";
import { isMonthList, isFinished } from "@/lib/product.utils";

export default function MonthListScreen() {
  const { data: products = [], isLoading, error, refetch } = useProducts();

  const monthProducts = useMemo(
    () =>
      products.filter((p) => isMonthList(p.month_list) && !isFinished(p.finished)),
    [products]
  );

  return (
    <ItemListScreen
      title="Lista do Mês"
      subtitle="Compras planejadas para este mês"
      products={monthProducts}
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={refetch}
      showSummary
      showFab={false}
    />
  );
}
