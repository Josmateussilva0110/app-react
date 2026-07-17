import { ItemListScreen } from "@/features/list/components/item-list-screen";
import { useProductListLabels } from "@/hooks/use-product-list-labels";
import { useProducts } from "@/hooks/use-products";

export default function MonthListScreen() {
  const { subtitle: groupSubtitle } = useProductListLabels();
  const { data: products = [], isLoading, error, refetch } = useProducts({
    limit: 100,
    monthList: true,
    status: "pendente",
  });

  return (
    <ItemListScreen
      title="Lista do Mês"
      subtitle={groupSubtitle === "Seus itens pessoais" ? "Compras planejadas para este mês" : groupSubtitle}
      products={products}
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={refetch}
      showSummary
      showFab={false}
      showDashboard
    />
  );
}
