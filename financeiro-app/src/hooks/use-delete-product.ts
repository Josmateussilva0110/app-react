import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import { PRODUCT_STATS_KEY } from "./use-product-stats";
import { PRODUCT_PERIODS_KEY } from "./use-product-periods";
import { PRODUCTS_KEY } from "./use-products";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await requestData({
        endpoint: `/products/${productId}`,
        method: "DELETE",
        withAuth: true,
      });

      if (!res.success) throw new Error(res.message);
      return res.message;
    },
    // Remover produto muda a lista, os totais e os anos com compra.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCT_STATS_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCT_PERIODS_KEY });
    },
  });
}
