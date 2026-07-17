import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestData } from "@/services/request";
import type { GroupInviteResponse, GroupMeResponse, GroupResponse } from "@app/shared";

export const GROUP_KEY = ["group", "me"] as const;

export const groupQueryOptions = {
  queryKey: GROUP_KEY,
  queryFn: async () => {
    const res = await requestData<GroupMeResponse>({
      endpoint: "/groups/me",
      method: "GET",
      withAuth: true,
    });
    if (!res.success) throw new Error(res.message);
    return res.data as GroupMeResponse;
  },
  staleTime: 60 * 1000,
};

export function useGroup() {
  return useQuery({
    ...groupQueryOptions,
  });
}

export function prefetchGroup(client: ReturnType<typeof useQueryClient>) {
  return client.prefetchQuery(groupQueryOptions);
}

function invalidateGroupData(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: GROUP_KEY });
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["product-stats"] });
  queryClient.invalidateQueries({ queryKey: ["goal"] });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await requestData<GroupResponse>({
        endpoint: "/groups",
        method: "POST",
        data: { name },
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
      return res.data as GroupResponse;
    },
    onSuccess: () => invalidateGroupData(queryClient),
  });
}

export function useCreateGroupInvite() {
  return useMutation({
    mutationFn: async () => {
      const res = await requestData<GroupInviteResponse>({
        endpoint: "/groups/invites",
        method: "POST",
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
      return res.data as GroupInviteResponse;
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await requestData<GroupResponse>({
        endpoint: "/groups/join",
        method: "POST",
        data: { code: code.trim().toUpperCase() },
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
      return res.data as GroupResponse;
    },
    onSuccess: () => invalidateGroupData(queryClient),
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await requestData({
        endpoint: "/groups/leave",
        method: "POST",
        withAuth: true,
      });
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => invalidateGroupData(queryClient),
  });
}
