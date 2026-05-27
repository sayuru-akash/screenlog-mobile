import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { MediaType } from "@/types/domain";
import {
  buildProgressPayload,
  buildReviewPayload,
  buildWatchlistUpdatePayload,
  type ProgressInput,
  type ReviewDraft,
  type WatchlistUpdateInput,
} from "./action-payloads";

export {
  buildProgressPayload,
  buildReviewPayload,
  buildWatchlistUpdatePayload,
  normalizeRating,
  titleToWatchlistInput,
  type ProgressInput,
  type ReviewDraft,
  type WatchlistUpdateInput,
} from "./action-payloads";

export function useWatchlistUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WatchlistUpdateInput) =>
      authedApiRequest("/watchlist", {
        method: "POST",
        body: buildWatchlistUpdatePayload(input),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
        queryClient.invalidateQueries({ queryKey: ["title"] }),
      ]);
    },
  });
}

export function useWatchlistRemoveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: MediaType; id: string }) =>
      authedApiRequest("/watchlist", {
        method: "DELETE",
        body: { type, id },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
      ]);
    },
  });
}

export function useProgressMutation(showId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProgressInput) =>
      authedApiRequest("/progress", {
        method: "POST",
        body: buildProgressPayload(input),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.progress(showId) }),
        queryClient.invalidateQueries({ queryKey: ["title"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
        queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
      ]);
    },
  });
}

export function useCreateReviewMutation(type: MediaType, titleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ReviewDraft) =>
      authedApiRequest("/logs", {
        method: "POST",
        body: buildReviewPayload(draft),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.title(type, titleId),
        }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["feed"] }),
      ]);
    },
  });
}
