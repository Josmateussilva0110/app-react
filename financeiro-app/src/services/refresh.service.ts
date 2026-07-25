import axios from "axios";
import { API_URL } from "@/config/env";
import { AUTH_ROUTES } from "@/config/api-routes";
import { tokenManager } from "@/services/token.manager";
import { saveAuth, removeAuth } from "@/storage/auth.storage";
import { clearPersistedQueryCache } from "@/lib/query-persister";
import type { AuthData } from "@/types/auth.types";

type RefreshApiResponse = {
  success?: boolean;
  code?: string;
  data?: AuthData;
};

class RefreshService {
  private refreshPromise: Promise<AuthData | null> | null = null;

  /**
   * Limpa tokens, cache persistido e notifica expiração de sessão.
   */
  private async clearLocalSession(): Promise<void> {
    tokenManager.clearTokens();
    tokenManager.notifyExpired();
    await removeAuth();
    await clearPersistedQueryCache();
  }

  /**
   * Evita múltiplos refresh simultâneos
   */
  async refresh(refreshToken: string): Promise<AuthData> {
    if (this.refreshPromise) {
      const result = await this.refreshPromise;
      if (!result) throw new Error("Refresh falhou");
      return result;
    }

    this.refreshPromise = this.execute(refreshToken);

    try {
      const result = await this.refreshPromise;

      if (!result) {
        throw new Error("Refresh inválido");
      }

      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Execução real do refresh
   */
  private async execute(refreshToken: string): Promise<AuthData | null> {
    const refreshWork = this.performRefresh(refreshToken);
    tokenManager.startRefresh(refreshWork.then(() => undefined, () => undefined));

    try {
      return await refreshWork;
    } finally {
      tokenManager.finishRefresh();
    }
  }

  private isAuthFailure(status: number | undefined, code?: string): boolean {
    if (status === 401 || status === 403) return true;
    return code === "SESSION_REVOKED" || code === "INVALID_CREDENTIALS";
  }

  private async performRefresh(refreshToken: string): Promise<AuthData | null> {
    try {
      const { data } = await axios.post<RefreshApiResponse>(
        `${API_URL}${AUTH_ROUTES.refresh}`,
        { refreshToken },
        { timeout: 15000 }
      );

      const auth = data?.data;

      if (!data?.success || !auth?.accessToken || !auth?.refreshToken) {
        if (this.isAuthFailure(undefined, data?.code)) {
          await this.clearLocalSession();
        }
        return null;
      }

      // Rotação: substituir sempre o par access + refresh pelo retornado pelo servidor.
      tokenManager.setTokens(auth.accessToken, auth.refreshToken);
      await saveAuth(auth);
      tokenManager.notifyRefreshed(
        auth.accessToken,
        auth.refreshToken,
        auth.expiresAt
      );

      return auth;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: RefreshApiResponse } };
      const status = error.response?.status;
      const code = error.response?.data?.code;

      if (!error.response || status === 429 || (status !== undefined && status >= 500)) {
        return null;
      }

      if (this.isAuthFailure(status, code)) {
        await this.clearLocalSession();
      }

      return null;
    }
  }

  /**
   * Inicialização no app (boot)
   */
  async initialize(auth: AuthData): Promise<AuthData | null> {
    const isExpired = Date.now() >= auth.expiresAt;

    if (!isExpired) {
      tokenManager.setTokens(auth.accessToken, auth.refreshToken);
      return auth;
    }

    return this.refresh(auth.refreshToken);
  }

  /**
   * Logout centralizado (refresh inválido, rotação/revogação detectada)
   */
  async logout() {
    this.refreshPromise = null;
    await this.clearLocalSession();
  }
}

export const refreshService = new RefreshService();
