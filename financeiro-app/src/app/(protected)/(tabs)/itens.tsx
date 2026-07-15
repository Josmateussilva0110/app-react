import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ItemListScreen } from "@/features/list/components/item-list-screen";
import type { InitialListFilters, StatusFilter } from "@/features/list/constants/home.constants";
import { useProducts, type UseProductsParams } from "@/hooks/use-products";

const STATUS_VALUES = new Set<StatusFilter>(["todos", "pendente", "finalizado"]);

function paramString(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function routeToQueryFilters(params: {
  category?: string;
  month?: number;
  year?: number;
  userId?: string;
  status?: StatusFilter;
}): UseProductsParams {
  const now = new Date();
  return {
    limit: 100,
    category: params.category,
    month: params.month !== undefined ? params.month + 1 : now.getMonth() + 1,
    year: params.year !== undefined ? params.year : now.getFullYear(),
    userId: params.userId,
    status: params.status ?? "todos",
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
  const router = useRouter();
  const params = useLocalSearchParams();

  const category = paramString(params.category);
  const monthParam = paramString(params.month);
  const yearParam = paramString(params.year);
  const userId = paramString(params.userId);
  const statusRaw = paramString(params.status);
  const status =
    statusRaw && STATUS_VALUES.has(statusRaw as StatusFilter)
      ? (statusRaw as StatusFilter)
      : undefined;

  const monthNum = monthParam !== undefined ? Number(monthParam) : NaN;
  const yearNum = yearParam !== undefined ? Number(yearParam) : NaN;
  const month = !isNaN(monthNum) ? monthNum - 1 : undefined;
  const year = !isNaN(yearNum) ? yearNum : undefined;

  const listKey = [category ?? "", monthParam ?? "", yearParam ?? "", status ?? "", userId ?? ""].join(
    "|"
  );

  const routeFilters = useMemo(
    () => ({ category, month, year, userId, status }),
    [category, month, year, userId, status]
  );

  const [queryFilters, setQueryFilters] = useState<UseProductsParams>(() =>
    routeToQueryFilters(routeFilters)
  );

  useEffect(() => {
    setQueryFilters(routeToQueryFilters(routeFilters));
  }, [listKey, routeFilters]);

  const { data: products = [], isLoading, error, refetch } = useProducts(queryFilters);

  const initialFilters = useMemo(
    () => queryToInitialFilters(queryFilters),
    [queryFilters]
  );

  const clearCategoryParam = useCallback(() => {
    router.setParams({ category: "" });
  }, [router]);

  const handleQueryFiltersChange = useCallback(
    (next: InitialListFilters) => {
      setQueryFilters({
        limit: 100,
        category: next.category || undefined,
        month: next.month !== undefined && next.month !== null ? next.month + 1 : undefined,
        year: next.year !== undefined && next.year !== null ? next.year : undefined,
        userId: next.userId,
        status: next.status ?? "todos",
      });
    },
    []
  );

  return (
    <ItemListScreen
      key={listKey}
      title="Meus Itens"
      subtitle="Controle seus itens por prioridade"
      products={products}
      loading={isLoading}
      error={error?.message ?? null}
      onRefresh={refetch}
      showDashboard
      initialFilters={initialFilters}
      onClearCategory={clearCategoryParam}
      onQueryFiltersChange={handleQueryFiltersChange}
      serverFiltered
    />
  );
}
