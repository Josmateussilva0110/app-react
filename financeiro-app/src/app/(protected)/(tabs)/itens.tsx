import { ItemListScreen } from "@/features/list/components/item-list-screen";
import { useProducts } from "@/hooks/use-products";

export default function HomeScreen() {
  const { data: products = [], isLoading, error, refetch } = useProducts();

  return (
    <ItemListScreen
      title="Meus Itens"
      subtitle="Controle seus itens por prioridade"
      products={products}
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={refetch}
    />
  );
}
