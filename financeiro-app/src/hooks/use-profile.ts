import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
  changePassword,
  type ChangePasswordData,
  type UpdateProfileData,
  type UserProfile,
} from "@/services/profile.service";
import { useAuth } from "./useAuth";

export const PROFILE_KEY = ["profile"] as const;

interface QueryError extends Error {
  status?: number;
  reason?: string;
}

/**
 * Extraído do hook porque o login precisa aquecer o perfil antes de a primeira
 * tela protegida montar: o portão de `(protected)` decide por
 * `must_change_password`, e sem esse prefetch ele espera um roundtrip inteiro
 * (que no cold start da API passa de 20s) para saber se a senha é provisória.
 */
export const profileQueryOptions = queryOptions<UserProfile, QueryError>({
    queryKey: PROFILE_KEY,

    queryFn: async () => {
      const res = await getProfile();

      if (!res.success) {
        const error = new Error(res.message) as QueryError;

        error.status = res.error?.status;
        error.reason = res.error?.reason;

        throw error;
      }

      return res.data as UserProfile;
    },

    retry: (failureCount, error) => {
      // Usuário realmente perdeu a sessão
      if (error.status === 401 || error.status === 403) {
        return false;
      }

      // Erro de rede/cold start do Render
      if (error.reason === "network_error") {
        return failureCount < 3;
      }

      return failureCount < 2;
    },

    retryDelay: (attempt) =>
      Math.min(1000 * Math.pow(2, attempt), 5000),

    staleTime: 60 * 1000,
});

export function useProfile() {
  const { signed, loading } = useAuth();

  return useQuery({
    ...profileQueryOptions,
    enabled: signed && !loading,
  });
}

export function prefetchProfile(client: QueryClient) {
  return client.prefetchQuery(profileQueryOptions);
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, QueryError, UpdateProfileData>({
    mutationFn: async (data) => {
      const res = await updateProfile(data);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;

        error.status = res.error?.status;
        error.reason = res.error?.reason;

        throw error;
      }

      return res.data as UserProfile;
    },

    onSuccess(updatedProfile) {
      queryClient.setQueryData(PROFILE_KEY, updatedProfile);
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, QueryError, ChangePasswordData>({
    mutationFn: async (data) => {
      const res = await changePassword(data);

      if (!res.success) {
        const error = new Error(res.message) as QueryError;

        error.status = res.error?.status;
        error.reason = res.error?.reason;

        throw error;
      }

      return res.data as UserProfile;
    },

    onSuccess(updatedProfile) {
      queryClient.setQueryData(PROFILE_KEY, updatedProfile);
    },
  });
}