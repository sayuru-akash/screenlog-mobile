import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { ReviewSummary } from "@/types/domain";

export function useLogQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.log(id),
    queryFn: () => authedApiRequest<ReviewSummary>(`/logs/${id}`),
  });
}

export function useCommentsQuery(logId: string) {
  return useQuery({
    queryKey: queryKeys.comments(logId),
    queryFn: () => authedApiRequest<{ comments?: ReviewSummary[] }>(`/logs/${logId}/comments`),
  });
}

export function useReactionMutation(kind: "logs" | "comments", id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: -1 | 0 | 1) =>
      authedApiRequest(`/${kind}/${id}/reaction`, {
        method: "POST",
        body: { value },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });
}
