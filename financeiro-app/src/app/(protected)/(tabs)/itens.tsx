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
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    status: "todos",
  };
}

function queryToInitialFilters(query: ProductsFilterParams): InitialListFilters {
  return {
    month: query.month !== undefined ? query.month - 1 : null,
    year: query.year ?? null,
    userId: query.userId,
    status: query.status ?? "todos",
  };
}

export default function HomeScreen() {
  const [queryFilters, setQueryFilters] = useState<ProductsFilterParams>(
    defaultQueryFilters
  );
  const { title, subtitle } = useProductListLabels();

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

  const handleQueryFiltersChange = useCallback((next: InitialListFilters) => {
    setQueryFilters({
      month: next.month !== undefined && next.month !== null ? next.month + 1 : undefined,
      year: next.year !== undefined && next.year !== null ? next.year : undefined,
      userId: next.userId,
      status: next.status ?? "todos",
    });
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <ItemListScreen
      title={title}
      subtitle={subtitle}
      products={products}
      loading={isLoading}
      isRefreshing={isRefetching}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      onLoadMore={handleLoadMore}
      error={error?.message ?? null}
      onRefresh={() => void refetch()}
      showDashboard
      initialFilters={initialFilters}
      onQueryFiltersChange={handleQueryFiltersChange}
      serverFiltered
    />
  );
}
