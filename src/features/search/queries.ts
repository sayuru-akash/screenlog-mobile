import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { MediaType, SearchResult } from "@/types/domain";

export function useSearchQuery(q: string, type: "all" | MediaType) {
  return useQuery({
    queryKey: queryKeys.search({ q, type }),
    enabled: q.trim().length >= 2,
    queryFn: () =>
      authedApiRequest<{ results?: SearchResult[] }>("/search", {
        query: { q: q.trim(), type: type === "all" ? undefined : type },
      }),
  });
}

export function useAddToWatchlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: SearchResult) =>
      authedApiRequest("/watchlist", {
        method: "POST",
        body: {
          type: item.type,
          tmdbId: item.tmdbId,
          title: item.title,
          overview: item.overview,
          posterPath: item.posterUrl,
          backdropPath: item.backdropUrl,
          userStatus: "PLAN_TO_WATCH",
          isFavourite: false,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      await queryClient.invalidateQueries({ queryKey: ["home"] });
    },
  });
}
