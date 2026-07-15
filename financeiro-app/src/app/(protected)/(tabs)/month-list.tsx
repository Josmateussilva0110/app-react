import { ItemListScreen } from "@/features/list/components/item-list-screen";
import { useProducts } from "@/hooks/use-products";

export default function MonthListScreen() {
  // Filtro principal no servidor; demais filtros (mês/ano/categoria) ficam no client.
  const { data: products = [], isLoading, error, refetch } = useProducts({
    limit: 100,
    monthList: true,
    status: "pendente",
  });

  return (
    <ItemListScreen
      title="Lista do Mês"
      subtitle="Compras planejadas para este mês"
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
