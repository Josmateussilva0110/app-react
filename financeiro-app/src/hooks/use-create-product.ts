import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import { ProductFormData } from "@/schemas/product.schema";
import { PRODUCTS_KEY } from "./use-products";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormData) =>
      requestData({
        endpoint: "/products",
        method: "POST",
        data,
        withAuth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}
