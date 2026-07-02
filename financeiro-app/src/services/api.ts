import axios, { AxiosError } from "axios";
import { tokenManager } from "./token.manager";
import { serverStatusManager } from "./server-status.manager";
import { API_URL } from "@/config/env";
import { AUTH_ROUTES } from "@/config/api-routes";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _skipAuth?: boolean;
    _retry?: boolean;
  }
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  serverStatusManager.onRequestStart();

  if (config._skipAuth) return config;

  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  pendingQueue = [];
}

function isRefreshRequest(url?: string): boolean {
  if (!url) return false;
  const path = url.split("?")[0].replace(/\/$/, "");
  return path.endsWith(AUTH_ROUTES.refresh);
}

api.interceptors.response.use(
  (response) => {
    serverStatusManager.onRequestEnd();
    return response;
  },
  async (error: AxiosError) => {
    serverStatusManager.onRequestEnd();
    const original = error.config!;
    const status = error.response?.status;
    const hasServerResponse = Boolean(error.response);
    const isRefreshEndpoint = isRefreshRequest(original.url);

    // 401/403 no próprio endpoint de refresh → sessão morta de fato, faz logout
    if ((status === 401 || status === 403) && isRefreshEndpoint) {
      tokenManager.clearTokens();
      tokenManager.notifyExpired();
      return Promise.reject(error);
    }

    // Refresh falhou por rede (timeout, cold start, sem internet) →
    // NÃO desloga, apenas propaga o erro pra quem chamou tentar de novo depois
    if (!hasServerResponse && isRefreshEndpoint) {
      return Promise.reject(error);
    }

    // Ignora erros que não são 401, já retentados, ou requests sem auth
    if (status !== 401 || original._retry || original._skipAuth) {
      return Promise.reject(error);
    }

    // Já tem um refresh em andamento → enfileira essa request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      });
    }

    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      tokenManager.clearTokens();
      tokenManager.notifyExpired();
      return Promise.reject(error);
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // axios base (não `api`) pra evitar loop no interceptor
      const { data } = await axios.post(
        `${API_URL}${AUTH_ROUTES.refresh}`,
        { refreshToken },
        { timeout: 15_000 } // margem maior aqui: cobre cold start do Render
      );

      const { accessToken, refreshToken: newRefresh, expiresAt } = data.data;

      tokenManager.setTokens(accessToken, newRefresh);
      tokenManager.notifyRefreshed(accessToken, newRefresh, expiresAt);

      flushQueue(null, accessToken);

      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      const refreshAxiosError = refreshError as AxiosError;
      flushQueue(refreshAxiosError);

      // Só desloga se o SERVIDOR respondeu recusando o refresh token.
      // Timeout/erro de rede fica pendurado sem apagar a sessão local.
      if (refreshAxiosError.response) {
        tokenManager.clearTokens();
        tokenManager.notifyExpired();
      }

      return Promise.reject(refreshAxiosError);
    } finally {
      isRefreshing = false;
    }
  }
);