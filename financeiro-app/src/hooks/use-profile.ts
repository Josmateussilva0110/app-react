import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
  type UpdateProfileData,
  type UserProfile,
} from "@/services/profile.service";

export const PROFILE_KEY = ["profile"] as const;

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const res = await getProfile();
      if (!res.success) throw new Error(res.message);
      return res.data as UserProfile;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await updateProfile(data);
      if (!res.success) throw new Error(res.message);
      return res.data as UserProfile;
    },
    onSuccess: (updatedProfile) => {
      // Update cache immediately with the returned data
      queryClient.setQueryData(PROFILE_KEY, updatedProfile);
    },
  });
}
