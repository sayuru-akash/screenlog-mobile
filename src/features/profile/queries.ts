import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { ProfilePayload } from "@/types/domain";

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => authedApiRequest<ProfilePayload>("/profile"),
  });
}

export function useUserProfileQuery(username: string) {
  return useQuery({
    queryKey: queryKeys.user(username),
    queryFn: () => authedApiRequest<ProfilePayload>(`/users/${username}`),
  });
}

export function useFollowMutation(username: string, following: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      authedApiRequest(`/users/${username}/follow`, {
        method: following ? "DELETE" : "POST",
        body: following ? undefined : {},
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user(username) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}
