import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useMemo } from "react";
import { ItemListScreen } from "@/features/list/components/item-list-screen";
import { useProducts } from "@/lib/storage";
import { isMonthList } from "@/lib/product.utils";

export default function MonthListScreen() {
  const { products, loading, error, refetch } = useProducts();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const monthProducts = useMemo(
    () => products.filter((p) => isMonthList(p.month_list)),
    [products]
  );

  return (
    <ItemListScreen
      title="Lista do Mês"
      subtitle="Compras planejadas para este mês"
      products={monthProducts}
      loading={loading}
      error={error}
      onRefresh={refetch}
      showSummary
      showFab={false}
    />
  );
}
