import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import type { GoalResponse } from "@app/shared";

export const GOAL_KEY = ["goal"] as const;

export function useGoal() {
  return useQuery({
    queryKey: GOAL_KEY,
    queryFn: async () => {
      const res = await requestData<GoalResponse>({
        endpoint: "/goal",
        method: "GET",
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
      return res.data as GoalResponse;
    },
    retry: (failureCount) => failureCount < 4,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (monthlyGoal: number) => {
      const res = await requestData<GoalResponse>({
        endpoint: "/goal",
        method: "PUT",
        data: { monthlyGoal },
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
      return res.data as GoalResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(GOAL_KEY, data);
    },
  });
}
