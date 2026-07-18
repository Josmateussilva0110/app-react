import { useQuery } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import type { ProductResponse, PaginatedResult } from "@app/shared";
import type { StatusFilter } from "@/features/list/constants/home.constants";
import { getProductMonthYear } from "@/lib/product.utils";

export const PRODUCTS_KEY = ["products"] as const;

export type EnrichedProduct = ProductResponse & {
  _month: number | null;
  _year: number | null;
};

export type UseProductsParams = {
  page?: number;
  limit?: number;
  category?: string;
  /** Mês 1-12 */
  month?: number;
  year?: number;
  userId?: string;
  status?: StatusFilter;
  monthList?: boolean;
  enabled?: boolean;
};

function enrichProduct(item: ProductResponse): EnrichedProduct {
  const parsed = getProductMonthYear(item.date);
  return {
    ...item,
    _month: parsed?.month ?? null,
    _year: parsed?.year ?? null,
  };
}

export function useProducts({
  page = 1,
  limit = 30,
  category,
  month,
  year,
  userId,
  status = "todos",
  monthList,
  enabled = true,
}: UseProductsParams = {}) {
  return useQuery({
    queryKey: [
      ...PRODUCTS_KEY,
      page,
      limit,
      category ?? "",
      month ?? "",
      year ?? "",
      userId ?? "",
      status,
      monthList === undefined ? "" : monthList ? "true" : "false",
    ],
    queryFn: async () => {
      const res = await requestData<PaginatedResult<ProductResponse>>({
        endpoint: "/products",
        method: "GET",
        data: {
          page,
          limit,
          ...(category ? { category } : {}),
          ...(month !== undefined ? { month } : {}),
          ...(year !== undefined ? { year } : {}),
          ...(userId ? { userId } : {}),
          ...(status && status !== "todos" ? { status } : {}),
          ...(monthList !== undefined ? { monthList: monthList ? "true" : "false" } : {}),
        },
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled,
    retry: (failureCount) => failureCount < 6,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    select: (data): EnrichedProduct[] =>
      (data?.items ?? []).map(enrichProduct),
  });
}
