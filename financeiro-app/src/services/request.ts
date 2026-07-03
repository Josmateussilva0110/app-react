import { AxiosError, type AxiosRequestConfig, type Method } from "axios";
import { api } from "@/services/api";

export type ApiErrorReason = "network_error" | "server_error";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    reason: ApiErrorReason;
    status?: number;
  };
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
      headers: {
        ...headers,
      },
      _skipAuth: !withAuth,
    } as AxiosRequestConfig;

    if (method.toUpperCase() === "GET") {
      config.params = {
        ...params,
        ...(data as Record<string, unknown>),
      };
    } else {
      config.data = data;
      config.params = params;
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

    // O servidor respondeu (4xx / 5xx)
    if (err.response) {
      return {
        success: false,
        message:
          err.response.data?.message ??
          "Erro ao processar solicitação.",
        error: {
          reason: "server_error",
          status: err.response.status,
        },
      };
    }

    // Timeout / internet / Render dormindo
    return {
      success: false,
      message:
        "Não foi possível conectar ao servidor. Tente novamente em alguns instantes.",
      error: {
        reason: "network_error",
      },
    };
  }
}