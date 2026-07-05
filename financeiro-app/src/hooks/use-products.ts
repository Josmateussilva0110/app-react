import { useQuery } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import type { ProductResponse, PaginatedResult} from "@app/shared";

export const PRODUCTS_KEY = ["products"] as const;

type UseProductsParams = {
  page?: number;
  limit?: number;
};

export function useProducts({ page = 1, limit = 100 }: UseProductsParams = {}) {
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
    select: (data): ProductResponse[] => data?.items ?? [],
  });
}
