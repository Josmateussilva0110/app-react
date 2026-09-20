import {
  keepPreviousData,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { requestData } from "@/services/request";
import type { DashboardStats } from "@app/shared";
import type { StatusFilter } from "@/features/list/constants/home.constants";

export type UseProductStatsParams = {
  /** Mês 1-12; omitir = todos os meses do período. */
  month?: number;
  year?: number;
  userId?: string;
  status?: StatusFilter;
  monthList?: "true" | "false";
  enabled?: boolean;
};

export const PRODUCT_STATS_KEY = ["product-stats"] as const;

export function productStatsQueryOptions({
  month,
  year,
  userId,
  status = "todos",
  monthList,
}: Omit<UseProductStatsParams, "enabled">) {
  return {
    queryKey: [...PRODUCT_STATS_KEY, year ?? "all", month ?? "all", userId ?? "all", status, monthList ?? "all"],
    queryFn: async () => {
      const res = await requestData<DashboardStats>({
        endpoint: "/products/stats",
        method: "GET",
        data: {
          ...(month !== undefined ? { month } : {}),
          ...(year !== undefined ? { year } : {}),
          status,
          ...(userId ? { userId } : {}),
          ...(monthList ? { monthList } : {}),
        },
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
      return res.data as DashboardStats;
    },
    staleTime: 60 * 1000,
  };
}

export function useProductStats({
  month,
  year,
  userId,
  status = "todos",
  monthList,
  enabled = true,
}: UseProductStatsParams) {
  return useQuery({
    ...productStatsQueryOptions({ month, year, userId, status, monthList }),
    enabled,
    placeholderData: keepPreviousData,
    retry: (failureCount) => failureCount < 4,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function prefetchProductStats(
  client: QueryClient,
  params: Omit<UseProductStatsParams, "enabled">
) {
  return client.prefetchQuery(productStatsQueryOptions(params));
}

/**
 * Aquece a chave que a tela de entrada (month-list) realmente pede.
 *
 * A queryKey é o contrato do cache: `monthList` faz parte dela, e sem ele o
 * prefetch aquecia `"all"` enquanto a tela pedia `"true"` — o dado ficava no
 * cache sem ninguém usar e a abertura pagava a chamada assim mesmo.
 */
export function prefetchCurrentProductStats(client: QueryClient) {
  const now = new Date();
  return prefetchProductStats(client, {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    monthList: "true",
  });
}
