import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mapNotificationsPayload } from "@/lib/api-mappers";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { NotificationItem } from "@/types/domain";

export function useNotificationsQuery() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async (): Promise<{
      items?: NotificationItem[];
      unreadCount?: number;
    }> => mapNotificationsPayload(await authedApiRequest("/notifications")),
  });
}

export function useMarkNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) =>
      authedApiRequest("/notifications", {
        method: "PATCH",
        body: ids ? { ids } : {},
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notifications,
      });
    },
  });
}
