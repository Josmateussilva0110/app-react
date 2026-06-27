import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useProducts } from "../../../hooks/use-products";
import { ProductDetailScreen } from "@/features/product/components/detail";
import { LoadingState } from "@/components/ui/loading-state";
import { AppShell } from "@/components/appShell";
import { ErrorState } from "@/components/ui/error-state";


export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();


  const { data: products, isLoading, refetch } = useProducts();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const product = products?.find((p) => p.id === id);

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
        <ErrorState error="Produto não encontrado" />
      </AppShell>
    );
  }

  return <ProductDetailScreen product={product} onDeleted={refetch} />;
}
