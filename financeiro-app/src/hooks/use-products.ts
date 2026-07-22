import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import type { ProductResponse, PaginatedResult } from "@app/shared";
import type { StatusFilter } from "@/features/list/constants/home.constants";
import { getProductMonthYear } from "@/lib/product.utils";

export const PRODUCTS_KEY = ["products"] as const;
export const PRODUCTS_PAGE_SIZE = 20;

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

export type ProductsFilterParams = Omit<
  UseProductsParams,
  "page" | "limit" | "enabled"
>;

function enrichProduct(item: ProductResponse): EnrichedProduct {
  const parsed = getProductMonthYear(item.date);
  return {
    ...item,
    _month: parsed?.month ?? null,
    _year: parsed?.year ?? null,
  };
}

function productsFilterKey(params: ProductsFilterParams): (string | number)[] {
  return [
    params.category ?? "",
    params.month ?? "",
    params.year ?? "",
    params.userId ?? "",
    params.status ?? "todos",
    params.monthList === undefined ? "" : params.monthList ? "true" : "false",
  ];
}

async function fetchProductsPage(
  page: number,
  limit: number,
  params: ProductsFilterParams
): Promise<PaginatedResult<ProductResponse>> {
  const { category, month, year, userId, status = "todos", monthList } = params;

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
  return res.data as PaginatedResult<ProductResponse>;
}

const listRetryOptions = {
  retry: (failureCount: number) => failureCount < 6,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 5000),
} as const;

/** Busca uma única página — útil para telas que precisam de snapshot (detalhe, overlay). */
export function useProducts({
  page = 1,
  limit = 100,
  category,
  month,
  year,
  userId,
  status = "todos",
  monthList,
  enabled = true,
}: UseProductsParams = {}) {
  const filters: ProductsFilterParams = {
    category,
    month,
    year,
    userId,
    status,
    monthList,
  };

  return useQuery({
    queryKey: [...PRODUCTS_KEY, page, limit, ...productsFilterKey(filters)],
    queryFn: () => fetchProductsPage(page, limit, filters),
    enabled,
    ...listRetryOptions,
    select: (data): EnrichedProduct[] =>
      (data?.items ?? []).map(enrichProduct),
  });
}

/** Paginação infinita para listagens longas. */
export function useInfiniteProducts({
  limit = PRODUCTS_PAGE_SIZE,
  category,
  month,
  year,
  userId,
  status = "todos",
  monthList,
  enabled = true,
}: Omit<UseProductsParams, "page"> = {}) {
  const filters: ProductsFilterParams = {
    category,
    month,
    year,
    userId,
    status,
    monthList,
  };

  const query = useInfiniteQuery({
    queryKey: [...PRODUCTS_KEY, "infinite", limit, ...productsFilterKey(filters)],
    queryFn: ({ pageParam }) => fetchProductsPage(pageParam, limit, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) return undefined;
      return lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined;
    },
    enabled,
    ...listRetryOptions,
  });

  const products = useMemo(
    () =>
      query.data?.pages.flatMap((page) =>
        (page?.items ?? []).map(enrichProduct)
      ) ?? [],
    [query.data]
  );

  return {
    ...query,
    products,
  };
}
