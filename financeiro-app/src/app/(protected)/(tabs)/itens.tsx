import { useCallback, useMemo, useState } from "react";

import { ItemListScreen } from "@/features/list/components/item-list-screen";
import type { InitialListFilters } from "@/features/list/constants/home.constants";
import { useProducts, type UseProductsParams } from "@/hooks/use-products";

function defaultQueryFilters(): UseProductsParams {
  const now = new Date();
  return {
    limit: 100,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    status: "todos",
  };
}

function queryToInitialFilters(query: UseProductsParams): InitialListFilters {
  return {
    category: query.category,
    month: query.month !== undefined ? query.month - 1 : null,
    year: query.year ?? null,
    userId: query.userId,
    status: query.status ?? "todos",
  };
}

export default function HomeScreen() {
  const [queryFilters, setQueryFilters] = useState<UseProductsParams>(defaultQueryFilters);

  const { data: products = [], isLoading, error, refetch } = useProducts(queryFilters);

  const initialFilters = useMemo(
    () => queryToInitialFilters(queryFilters),
    [queryFilters]
  );

  const handleQueryFiltersChange = useCallback((next: InitialListFilters) => {
    setQueryFilters({
      limit: 100,
      category: next.category || undefined,
      month: next.month !== undefined && next.month !== null ? next.month + 1 : undefined,
      year: next.year !== undefined && next.year !== null ? next.year : undefined,
      userId: next.userId,
      status: next.status ?? "todos",
    });
  }, []);

  return (
    <ItemListScreen
      title="Meus Itens"
      subtitle="Controle seus itens por prioridade"
      products={products}
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={refetch}
      showDashboard
      initialFilters={initialFilters}
      onQueryFiltersChange={handleQueryFiltersChange}
      serverFiltered
    />
  );
}
