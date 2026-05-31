import { ItemListScreen } from "@/features/list/components/item-list-screen";
import { useProducts } from "@/lib/storage";

export default function MonthListScreen() {
  const products = useProducts();

  return (
    <ItemListScreen
      title="Lista do Mês"
      subtitle="Compras planejadas para este mês"
      products={products}
      showSummary
      showFab={false}
    />
  );
}
