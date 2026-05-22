import {
  createContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  getAuth,
  removeAuth,
  saveAuth,
} from "@/storage/auth.storage";

import { loginUser } from "@/services/auth.service";

import {
  AuthData,
} from "@/types/auth.types";

interface LoginDTO {
  email: string;
  password: string;
}

interface AuthContextData {
  user: AuthData["user"] | null;
  accessToken: string | null;

  loading: boolean;
  signed: boolean;

  login: (data: LoginDTO) => Promise<{
    success: boolean;
    message: string;
  }>;

  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext =
  createContext<AuthContextData>(
    {} as AuthContextData
  );

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [authData, setAuthData] =
    useState<AuthData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const data = await getAuth();

      if (data) {
        setAuthData(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function login(data: LoginDTO) {
    const result = await loginUser(data);

    if (!result.success || !result.data) {
        return {
        success: false,
        message: result.message,
        };
    }

    await saveAuth(result.data);

    setAuthData(result.data);

    return {
        success: true,
        message: result.message,
    };
}

  async function logout() {
    await removeAuth();
    setAuthData(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user: authData?.user ?? null,
        accessToken:
          authData?.accessToken ?? null,

        loading,

        signed: !!authData,

        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
