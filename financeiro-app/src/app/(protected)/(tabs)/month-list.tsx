import { useCallback, useMemo, useState } from "react";
import { ItemListScreen } from "@/features/list/components/item-list-screen";
import type { InitialListFilters } from "@/features/list/constants/home.constants";
import { useProductListLabels } from "@/hooks/use-product-list-labels";
import {
  useInfiniteProducts,
  type ProductsFilterParams,
} from "@/hooks/use-products";

function defaultQueryFilters(): ProductsFilterParams {
  const now = new Date();
  return {
    monthList: true,
    status: "pendente",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

function queryToInitialFilters(query: ProductsFilterParams): InitialListFilters {
  return {
    month: query.month !== undefined ? query.month - 1 : null,
    year: query.year ?? null,
    userId: query.userId,
    status: query.status ?? "pendente",
  };
}

export default function MonthListScreen() {
  const { subtitle: groupSubtitle } = useProductListLabels();
  const [queryFilters, setQueryFilters] = useState<ProductsFilterParams>(
    defaultQueryFilters
  );

  const {
    products,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useInfiniteProducts(queryFilters);

  const initialFilters = useMemo(
    () => queryToInitialFilters(queryFilters),
    [queryFilters]
  );

  const summaryFilters = useMemo(
    () =>
      queryFilters.month !== undefined && queryFilters.year !== undefined
        ? {
            month: queryFilters.month,
            year: queryFilters.year,
            userId: queryFilters.userId,
            status: queryFilters.status ?? "pendente",
            monthList: "true" as const,
          }
        : undefined,
    [queryFilters]
  );

  const handleQueryFiltersChange = useCallback((next: InitialListFilters) => {
    setQueryFilters({
      monthList: true,
      month:
        next.month !== undefined && next.month !== null
          ? next.month + 1
          : undefined,
      year: next.year !== undefined && next.year !== null ? next.year : undefined,
      userId: next.userId,
      status: next.status ?? "pendente",
    });
  }, []);

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
      initialFilters={initialFilters}
      onQueryFiltersChange={handleQueryFiltersChange}
      serverFiltered
      summaryFilters={summaryFilters}
    />
  );
}
