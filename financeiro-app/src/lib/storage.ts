import { useCallback, useEffect, useState } from "react";
import { requestData } from "@/services/request";
import type { ProductResponse } from "@app/shared";

export type Priority = "alta" | "media" | "baixa";

export type Status = "pendente" | "finalizado";


type UseProductsReturn = {
  products: ProductResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await requestData<ProductResponse[], { page: number; limit: number }>({
      endpoint: "/products",
      method: "GET",
      data: { page: 1, limit: 20 },
      withAuth: true,
    });


    if (!response.success || !response.data) {
      setError(response.message);
      setProducts([]);
    } else {
      setProducts(response.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}