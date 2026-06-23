import { useQuery } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import { ProductResponse } from "@app/shared";

export const PRODUCTS_KEY = ["products"] as const;

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: async () => {
      const res = await requestData<ProductResponse[]>({
        endpoint: "/products",
        method: "GET",
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
      return res.data ?? [];
    },
  });
}
