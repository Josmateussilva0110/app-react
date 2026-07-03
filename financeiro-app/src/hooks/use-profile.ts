import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
  type UpdateProfileData,
  type UserProfile,
} from "@/services/profile.service";
import { useAuth } from "./useAuth";

export const PROFILE_KEY = ["profile"] as const;

interface QueryError extends Error {
  status?: number;
  reason?: string;
}

export function useProfile() {
  const { signed, loading } = useAuth();

  return useQuery<UserProfile, QueryError>({
    queryKey: PROFILE_KEY,

    enabled: signed && !loading,

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