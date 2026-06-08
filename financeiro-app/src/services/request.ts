import { AxiosError, type AxiosRequestConfig, type Method } from "axios";
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

export async function requestData<TResponse, TRequest = unknown>({
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
      params,
      headers: { ...headers },
      _skipAuth: !withAuth, // lido pelo interceptor de request
    } as AxiosRequestConfig;

    if (method.toUpperCase() === "GET") {
      config.params = { ...params, ...(data as Record<string, unknown>) };
    } else {
      config.data = data;
    }

    if (data instanceof FormData) {
      config.headers = {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      };
    }

    const response = await api<ApiResponse<TResponse>>(config);
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiResponse>;

    return {
      success: false,
      message:
        err.response?.data?.message ?? "Erro inesperado. Tente novamente.",
    };
  }
}
