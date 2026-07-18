import axios from "axios";
import { API_URL } from "@/config/env";
import { AUTH_ROUTES } from "@/config/api-routes";
import { tokenManager } from "@/services/token.manager";
import { saveAuth, removeAuth } from "@/storage/auth.storage";
import type { AuthData } from "@/types/auth.types";

class RefreshService {
  private refreshPromise: Promise<AuthData | null> | null = null;

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

  private async performRefresh(refreshToken: string): Promise<AuthData | null> {
    try {
      const { data } = await axios.post(
        `${API_URL}${AUTH_ROUTES.refresh}`,
        { refreshToken },
        { timeout: 15000 }
      );

      const payload = data as { success?: boolean; data?: AuthData };
      const auth = payload?.data;

      if (!payload?.success || !auth?.accessToken || !auth?.refreshToken) {
        return null;
      }

      tokenManager.setTokens(auth.accessToken, auth.refreshToken);
      await saveAuth(auth);
      tokenManager.notifyRefreshed(
        auth.accessToken,
        auth.refreshToken,
        auth.expiresAt
      );

      return auth;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      const status = error.response?.status;

      if (!error.response || status === 429 || (status !== undefined && status >= 500)) {
        return null;
      }

      tokenManager.clearTokens();
      tokenManager.notifyExpired();
      await removeAuth();

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
   * Logout centralizado
   */
  async logout() {
    this.refreshPromise = null;

    tokenManager.clearTokens();
    tokenManager.notifyExpired();

    await removeAuth();
  }
}

export const refreshService = new RefreshService();
