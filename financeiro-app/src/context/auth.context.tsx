import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import { getAuth, removeAuth, saveAuth } from "@/storage/auth.storage";
import { registerUser, loginUser, refreshAccessToken } from "@/services/auth.service";
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
  register: (
    data: RegisterDTO
  ) => Promise<{ success: boolean; message: string }>;
  login: (
    data: LoginDTO
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubRefreshed = tokenManager.onRefreshed(
      async (accessToken, refreshToken, expiresAt) => {
        setAuthData((prev) => {
          if (!prev) return null;

          const updated = {
            ...prev,
            accessToken,
            refreshToken,
            expiresAt,
          };

          saveAuth(updated);

          return updated;
        });
      }
    );

    const unsubExpired = tokenManager.onExpired(async () => {
      tokenManager.clearTokens();
      await removeAuth();
      setAuthData(null);
    });

    void loadUser();

    return () => {
      unsubRefreshed();
      unsubExpired();
    };
  }, []);

  async function loadUser() {
    try {
      const data = await getAuth();

      if (!data) {
        return;
      }

      // Mantém os tokens imediatamente.
      // NÃO limpa o access token aqui.
      tokenManager.setTokens(
        data.accessToken,
        data.refreshToken
      );

      const expired = Date.now() >= data.expiresAt;

      if (!expired) {
        setAuthData(data);
        return;
      }

      const refreshed = await tryRefreshToken(data);

      if (!refreshed) {
        tokenManager.clearTokens();
        await removeAuth();
        setAuthData(null);
      }
    } catch (err) {
      if (__DEV__) {
        console.error("[AUTH]", err);
      }

      tokenManager.clearTokens();
      await removeAuth();
      setAuthData(null);
    } finally {
      setLoading(false);
    }
  }

  const tryRefreshToken = useCallback(
    async (current: AuthData): Promise<boolean> => {
      try {
        const result = await refreshAccessToken(
          current.refreshToken
        );

        if (result.success && result.data) {
          tokenManager.setTokens(
            result.data.accessToken,
            result.data.refreshToken
          );

          await saveAuth(result.data);

          setAuthData(result.data);

          return true;
        }

        if (result.error?.reason === "network_error") {
          /**
           * Render dormindo.
           *
           * Mantemos a sessão local.
           * O interceptor fará novo refresh
           * quando surgir um 401.
           */

          tokenManager.setTokens(
            current.accessToken,
            current.refreshToken
          );

          setAuthData(current);

          return true;
        }

        return false;
      } catch {
        return false;
      }
    },
    []
  );

  async function register(dto: RegisterDTO) {
    const result = await registerUser(dto);

    return {
      success: result.success,
      message: result.message,
    };
  }

  async function login(dto: LoginDTO) {
    const result = await loginUser(dto);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
      };
    }

    tokenManager.setTokens(
      result.data.accessToken,
      result.data.refreshToken
    );

    await saveAuth(result.data);

    setAuthData(result.data);

    return {
      success: true,
      message: result.message,
    };
  }

  async function logout() {
    tokenManager.clearTokens();
    await removeAuth();
    setAuthData(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user: authData?.user ?? null,
        accessToken: authData?.accessToken ?? null,
        signed: authData !== null,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}