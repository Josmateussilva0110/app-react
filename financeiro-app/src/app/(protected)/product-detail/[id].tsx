import { useLocalSearchParams } from "expo-router";
import { useProduct } from "@/hooks/use-products";
import { ProductDetailScreen } from "@/features/product/components/detail";
import { LoadingState } from "@/components/ui/loading-state";
import { AppShell } from "@/components/appShell";
import { ErrorState } from "@/components/ui/error-state";


export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isLoading, error, refetch } = useProduct(id);

  if (isLoading && !product) {
    return (
      <AppShell title="Detalhes do Produto" subtitle="Carregando dados do item">
        <LoadingState message="Carregando dados do item..." />
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell title="Detalhes do Produto" subtitle="Produto não encontrado">
        <ErrorState
          error={error?.message ?? "Produto não encontrado"}
          onRetry={() => void refetch()}
        />
      </AppShell>
    );
  }

  return <ProductDetailScreen product={product} />;
}
