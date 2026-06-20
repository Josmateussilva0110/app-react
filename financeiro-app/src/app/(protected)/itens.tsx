import { ItemListScreen } from "@/features/list/components/item-list-screen";
import { useProducts } from "@/lib/storage";

export default function HomeScreen() {
  const { products, loading, error, refetch } = useProducts();

  return (
    <ItemListScreen
      title="Meus Itens"
      subtitle="Controle seus itens por prioridade"
      products={products}
      loading={loading}
      error={error}
      onRefresh={refetch}
    />
  );
}
