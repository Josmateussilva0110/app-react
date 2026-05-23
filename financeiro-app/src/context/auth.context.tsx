import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import { getAuth, removeAuth, saveAuth } from "@/storage/auth.storage";
import { registerUser ,loginUser } from "@/services/auth.service";
import { tokenManager } from "@/services/token.manager";
import { AuthData, AuthUser } from "@/types/auth.types";

interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface AuthContextData {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  signed: boolean;
  register: (data: RegisterDTO) => Promise<{ success: boolean; message: string }>;
  login: (data: LoginDTO) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh bem-sucedido pelo interceptor → atualiza state e SecureStore
    tokenManager.onRefreshed((accessToken, refreshToken, expiresAt) => {
      setAuthData((prev) => {
        if (!prev) return null;
        const updated = { ...prev, accessToken, refreshToken, expiresAt };
        saveAuth(updated); // fire-and-forget: persistência assíncrona
        return updated;
      });
    });

    // Token definitivamente expirado → logout silencioso
    tokenManager.onExpired(() => {
      removeAuth();
      setAuthData(null);
    });

    loadUser();
  }, []);

  async function loadUser() {
    try {
      const data = await getAuth();

      if (!data) return;

      const isExpired = Date.now() >= data.expiresAt;

      if (isExpired) {
        // Deixa o refreshToken disponível para o tryRefreshToken
        tokenManager.setTokens("", data.refreshToken);
        const refreshed = await tryRefreshToken(data);

        if (!refreshed) {
          tokenManager.clearTokens();
          await removeAuth();
        }

        return;
      }

      tokenManager.setTokens(data.accessToken, data.refreshToken);
      setAuthData(data);
    } catch (error) {
      if (__DEV__) console.error("[Auth] Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  }

  const tryRefreshToken = useCallback(
    async (data: AuthData): Promise<boolean> => {
      try {
        // Importação dinâmica para evitar dependência circular
        const { refreshAccessToken } = await import("@/services/auth.service");
        const result = await refreshAccessToken(data.refreshToken);

        if (!result.success || !result.data) return false;

        tokenManager.setTokens(
          result.data.accessToken,
          result.data.refreshToken
        );

        await saveAuth(result.data);
        setAuthData(result.data);

        return true;
      } catch {
        return false;
      }
    },
    []
  );

  async function register(
    dto: RegisterDTO
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await registerUser(dto);

      if (!result.success) {
        return { success: false, message: result.message };
      }

      return { success: true, message: result.message };
    } catch (error) {
      if (__DEV__) console.error("[Auth] Erro no registro:", error);
      return { success: false, message: "Erro inesperado. Tente novamente." };
    }
  }

  async function login(
    dto: LoginDTO
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await loginUser(dto);

      if (!result.success || !result.data) {
        return { success: false, message: result.message };
      }

      tokenManager.setTokens(
        result.data.accessToken,
        result.data.refreshToken
      );

      await saveAuth(result.data);
      setAuthData(result.data);

      return { success: true, message: result.message };
    } catch (error) {
      if (__DEV__) console.error("[Auth] Erro no login:", error);
      return { success: false, message: "Erro inesperado. Tente novamente." };
    }
  }

  async function logout(): Promise<void> {
    try {
      await removeAuth();
    } finally {
      tokenManager.clearTokens();
      setAuthData(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: authData?.user ?? null,
        accessToken: authData?.accessToken ?? null,
        loading,
        signed: !!authData,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
