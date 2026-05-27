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

export function useCreateCommentMutation(logId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: { body: string; spoiler: boolean; parentId?: string | null }) =>
      authedApiRequest(`/logs/${logId}/comments`, {
        method: "POST",
        body: {
          body: comment.body.trim(),
          spoiler: comment.spoiler,
          parentId: comment.parentId ?? null,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.comments(logId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.log(logId) });
    },
  });
}

export function useUpdateLogMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: { rating?: number | null; review?: string | null; spoiler?: boolean }) =>
      authedApiRequest(`/logs/${id}`, {
        method: "PATCH",
        body: patch,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.log(id) });
      await queryClient.invalidateQueries({ queryKey: ["title"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useDeleteLogMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      authedApiRequest(`/logs/${id}`, {
        method: "DELETE",
        body: {},
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["title"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
