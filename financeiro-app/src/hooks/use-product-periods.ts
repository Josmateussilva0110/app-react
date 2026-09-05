import { useQuery } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import type { ProductPeriods } from "@app/shared";

export const PRODUCT_PERIODS_KEY = ["product-periods"] as const;

export function useProductPeriods({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: PRODUCT_PERIODS_KEY,
    queryFn: async () => {
      const res = await requestData<ProductPeriods>({
        endpoint: "/products/periods",
        method: "GET",
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
      return res.data as ProductPeriods;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount) => failureCount < 4,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}
