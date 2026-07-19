import { useCallback } from "react";
import { ItemListScreen } from "@/features/list/components/item-list-screen";
import { useProductListLabels } from "@/hooks/use-product-list-labels";
import { useInfiniteProducts } from "@/hooks/use-products";

export default function MonthListScreen() {
  const { subtitle: groupSubtitle } = useProductListLabels();
  const now = new Date();

  const {
    products,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useInfiniteProducts({
    monthList: true,
    status: "pendente",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <ItemListScreen
      title="Lista do Mês"
      subtitle={
        groupSubtitle === "Seus itens pessoais"
          ? "Compras planejadas para este mês"
          : groupSubtitle
      }
      products={products}
      loading={isLoading}
      isRefreshing={isRefetching}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      onLoadMore={handleLoadMore}
      error={error?.message ?? null}
      onRefresh={() => void refetch()}
      showSummary
      showFab={false}
      showDashboard
      summaryFilters={{
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        status: "pendente",
        monthList: "true",
      }}
    />
  );
}
