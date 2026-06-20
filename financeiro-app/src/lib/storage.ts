import { useCallback, useEffect, useState } from "react";
import { requestData } from "@/services/request";

export type Priority = "alta" | "media" | "baixa";

export type Status = "pendente" | "finalizado";

export type Product = {
  id: string;
  nome: string;
  preco: number;
  prioridade: Priority;
  status: Status;
  lista_mes: boolean;
  cadastradoPor: string;
  categoria?: string;
  tipoPagamento?: string;
  data?: string;
};

/** Shape of each item returned by the API (snake_case) */
interface ApiProduct {
  id: string;
  name: string;
  price: number;
  priority: "alta" | "média" | "baixa";
  payment_type: string;
  category: string;
  date: string;
  finished: boolean;
  month_list: string;
  created_at: string;
  updated_at: string;
}

/** Pagination metadata returned by the API */
interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Maps an API product (snake_case) to the frontend Product type */
function mapApiProduct(api: ApiProduct): Product {
  return {
    id: api.id,
    nome: api.name,
    preco: api.price,
    prioridade: api.priority === "média" ? "media" : api.priority,
    status: api.finished ? "finalizado" : "pendente",
    lista_mes: api.month_list === "true" || api.month_list === "1",
    cadastradoPor: "",
    categoria: api.category,
    tipoPagamento: api.payment_type,
    data: api.date,
  };
}

type UseProductsReturn = {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await requestData<ApiProduct[], { page: number; limit: number }>({
      endpoint: "/products",
      method: "GET",
      data: { page: 1, limit: 100 },
      withAuth: true,
    });

    if (!response.success || !response.data) {
      setError(response.message ?? "Erro ao buscar produtos.");
      setProducts([]);
    } else {
      const mapped = (response.data as unknown as ApiProduct[]).map(mapApiProduct);
      setProducts(mapped);
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