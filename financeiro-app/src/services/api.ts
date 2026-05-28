import axios, { AxiosError } from "axios";
import { tokenManager } from "./token.manager";

const IP = "10.180.41.53";

// Extende o tipo do axios para suportar campos customizados
declare module "axios" {
  interface InternalAxiosRequestConfig {
    _skipAuth?: boolean;
    _retry?: boolean;
  }
}

const BASE_URL = `http://${IP}:3001/api`

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});


api.interceptors.request.use((config) => {
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

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config!;
    const status = error.response?.status;
    const isRefreshEndpoint = original.url?.includes("/auth/refresh");

    // 401 no próprio endpoint de refresh → sessão morta, faz logout
    if (status === 401 && isRefreshEndpoint) {
      tokenManager.clearTokens();
      tokenManager.notifyExpired();
      return Promise.reject(error);
    }

    // Ignora erros que não são 401, ou que já foram retentados, ou sem auth
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
      // Usa axios base (não `api`) para evitar loop no interceptor
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefresh, expiresAt } = data.data;

      tokenManager.setTokens(accessToken, newRefresh);
      tokenManager.notifyRefreshed(accessToken, newRefresh, expiresAt);

      flushQueue(null, accessToken);

      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError);
      tokenManager.clearTokens();
      tokenManager.notifyExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
