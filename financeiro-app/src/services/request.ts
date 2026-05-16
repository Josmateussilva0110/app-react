import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type Method,
} from "axios";

import { api } from "@/services/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface RequestProps<TRequest = unknown> {
  endpoint: string;
  method?: Method;
  data?: TRequest;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  withAuth?: boolean;
}

export async function requestData<
  TResponse,
  TRequest = unknown
>({
  endpoint,
  method = "GET",
  data,
  params,
  headers,
  withAuth = true,
}: RequestProps<TRequest>): Promise<ApiResponse<TResponse>> {
  try {
    const config: AxiosRequestConfig = {
      url: endpoint,
      method,

      headers: {
        ...headers,
      },

      params,
    };


    if (method.toUpperCase() === "GET") {
      config.params = data;
    } else {
      config.data = data;
    }

    if (data instanceof FormData) {
      config.headers = {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      };
    }


    if (withAuth) {
      // exemplo futuro
      // const token = await getToken();

      // if (token) {
      //   config.headers = {
      //     ...config.headers,
      //     Authorization: `Bearer ${token}`,
      //   };
      // }
    }

    const response = await api<ApiResponse<TResponse>>(config);

    return response.data;

  } catch (error) {
    const err = error as AxiosError<ApiResponse>;

    if (err.response?.status === 401) {
      // React Native não possui window
      // futuramente pode usar logout global
      console.log("Sessão expirada");
    }

    return {
      success: false,

      message:
        err.response?.data?.message ??
        "Erro inesperado. Tente novamente.",
    };
  }
}
