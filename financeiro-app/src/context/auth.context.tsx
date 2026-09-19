import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getAuth, removeAuth, saveAuth } from "@/storage/auth.storage";
import { registerUser, loginUser, logoutUser } from "@/services/auth.service";
import { refreshService } from "@/services/refresh.service";
import { tokenManager } from "@/services/token.manager";
import { queryClient } from "@/lib/query-client";
import { clearPersistedQueryCache } from "@/lib/query-persister";
import { prefetchCurrentProductStats } from "@/hooks/use-product-stats";
import { prefetchGoal } from "@/hooks/use-goal";
import { prefetchGroup } from "@/hooks/use-group";
import { AuthUser, type AuthData } from "@/types/auth.types";

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

function prefetchAppData() {
  void prefetchCurrentProductStats(queryClient);
  void prefetchGoal(queryClient);
  void prefetchGroup(queryClient);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubRefreshed = tokenManager.onRefreshed(
      async (accessToken, refreshToken, expiresAt) => {
        const current = await getAuth();
        if (!current) return;

        await saveAuth({
          ...current,
          accessToken,
          refreshToken,
          expiresAt,
        });
      }
    );

    const unsubExpired = tokenManager.onExpired(async () => {
      tokenManager.clearTokens();
      await removeAuth();
      await clearPersistedQueryCache();
      setUser(null);
      setSigned(false);
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

      tokenManager.setTokens(data.accessToken, data.refreshToken);

      const expired = Date.now() >= data.expiresAt;

      if (!expired) {
        setUser(data.user);
        setSigned(true);
        prefetchAppData();
        return;
      }

      const refreshed = await tryRefreshSession(data);

      if (!refreshed) {
        tokenManager.clearTokens();
        await removeAuth();
        await clearPersistedQueryCache();
        setUser(null);
        setSigned(false);
      }
    } catch (err) {
      if (__DEV__) {
        console.error("[AUTH]", err);
      }

      tokenManager.clearTokens();
      await removeAuth();
      await clearPersistedQueryCache();
      setUser(null);
      setSigned(false);
    } finally {
      setLoading(false);
    }
  }

  const tryRefreshSession = useCallback(async (stored: AuthData): Promise<boolean> => {
    if (!stored) return false;

    try {
      const refreshed = await refreshService.refresh(stored.refreshToken);
      setUser(refreshed.user);
      setSigned(true);
      prefetchAppData();
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (dto: RegisterDTO) => {
    const result = await registerUser(dto);

    return {
      success: result.success,
      message: result.message,
    };
  }, []);

  const login = useCallback(async (dto: LoginDTO) => {
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

    setUser(result.data.user);
    setSigned(true);
    prefetchAppData();

    return {
      success: true,
      message: result.message,
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Revoga sessão no servidor quando possível; logout local segue mesmo se falhar.
    }

    tokenManager.clearTokens();
    await removeAuth();
    await clearPersistedQueryCache();
    setUser(null);
    setSigned(false);
  }, []);

  const value = useMemo(
    () => ({ user, signed, loading, login, logout, register }),
    [user, signed, loading, login, logout, register]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
