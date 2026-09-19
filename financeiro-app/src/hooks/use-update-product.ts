import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import { ProductFormData } from "@/schemas/product.schema";
import { PRODUCT_STATS_KEY } from "./use-product-stats";
import { PRODUCT_PERIODS_KEY } from "./use-product-periods";
import { PRODUCTS_KEY } from "./use-products";

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const res = await requestData({
        endpoint: `/products/${productId}`,
        method: "PUT",
        data,
        withAuth: true,
      });

      if (!res.success) throw new Error(res.message);
      return res.message;
    },
    // Editar produto pode mudar data e valor: lista, totais e anos saem velhos.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCT_STATS_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCT_PERIODS_KEY });
    },
  });
}
