import {
  keepPreviousData,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { requestData } from "@/services/request";
import type { DashboardStats } from "@app/shared";
import type { StatusFilter } from "@/features/list/constants/home.constants";

export type UseProductStatsParams = {
  month: number; // 1-12
  year: number;
  userId?: string;
  status?: StatusFilter;
  enabled?: boolean;
};

export const PRODUCT_STATS_KEY = ["product-stats"] as const;

export function productStatsQueryOptions({
  month,
  year,
  userId,
  status = "todos",
}: Omit<UseProductStatsParams, "enabled">) {
  return {
    queryKey: [...PRODUCT_STATS_KEY, year, month, userId ?? "all", status],
    queryFn: async () => {
      const res = await requestData<DashboardStats>({
        endpoint: "/products/stats",
        method: "GET",
        data: { month, year, status, ...(userId ? { userId } : {}) },
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
  enabled = true,
}: UseProductStatsParams) {
  return useQuery({
    ...productStatsQueryOptions({ month, year, userId, status }),
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

export function prefetchCurrentProductStats(client: QueryClient) {
  const now = new Date();
  return prefetchProductStats(client, {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
}
