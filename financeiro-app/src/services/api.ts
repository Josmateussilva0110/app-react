import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

import { API_URL } from "@/config/env";
import { AUTH_ROUTES } from "@/config/api-routes";

import { tokenManager } from "./token.manager";
import { refreshService } from "./refresh.service";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _skipAuth?: boolean;
    _retry?: boolean;
  }
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 */
api.interceptors.request.use(async (config) => {
  if (config._skipAuth) {
    return config;
  }

  /**
   * 🔴 CRÍTICO: espera refresh global terminar
   * (evita requests com token expirado no boot do app)
   */
  await tokenManager.waitRefresh();

  const token = tokenManager.getAccessToken();

  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

/**
 * RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;

    if (!original) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isRefreshEndpoint =
      original.url?.includes(AUTH_ROUTES.refresh);

    /**
     * Refresh falhou de verdade (token inválido)
     */
    if (isRefreshEndpoint && (status === 401 || status === 403)) {
      await refreshService.logout();
      return Promise.reject(error);
    }

    /**
     * Timeout / Render dormindo no refresh
     */
    if (isRefreshEndpoint && !error.response) {
      return Promise.reject(error);
    }

    /**
     * Não é erro de autenticação
     */
    if (status !== 401 || original._skipAuth || original._retry) {
      return Promise.reject(error);
    }

    /**
     * 🔴 PONTO PRINCIPAL: usa refreshService único
     */
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      await refreshService.logout();
      return Promise.reject(error);
    }

    try {
      original._retry = true;

      const session = await refreshService.refresh(refreshToken);

      const newToken = session.accessToken;

      if (!original.headers) {
        original.headers = new AxiosHeaders();
      }

      original.headers.set(
        "Authorization",
        `Bearer ${newToken}`
      );

      return api(original);
    } catch (refreshError) {
      if (tokenManager.getRefreshToken()) {
        return Promise.reject(error);
      }

      await refreshService.logout();
      return Promise.reject(refreshError);
    }
  }
);