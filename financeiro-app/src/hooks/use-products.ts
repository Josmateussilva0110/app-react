import { useQuery } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import type { ProductResponse, PaginatedResult} from "@app/shared";

export const PRODUCTS_KEY = ["products"] as const;

type UseProductsParams = {
  page?: number;
  limit?: number;
  enabled?: boolean;
};

export function useProducts({
  page = 1,
  limit = 100,
  enabled = true,
}: UseProductsParams = {}) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, page, limit],
    queryFn: async () => {
      const res = await requestData<PaginatedResult<ProductResponse>>({
        endpoint: "/products",
        method: "GET",
        data: { page, limit },
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled,
    retry: (failureCount) => failureCount < 6,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    select: (data): ProductResponse[] => data?.items ?? [],
  });
}
