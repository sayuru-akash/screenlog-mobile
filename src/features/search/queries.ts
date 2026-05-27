import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mapSearchPayload } from "@/lib/api-mappers";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { MediaType, SearchResult } from "@/types/domain";

export function useSearchQuery(q: string, type: "all" | MediaType) {
  return useQuery({
    queryKey: queryKeys.search({ q, type }),
    enabled: q.trim().length >= 2,
    queryFn: async (): Promise<{ results?: SearchResult[] }> =>
      mapSearchPayload(
        await authedApiRequest("/search", {
          query: { q: q.trim(), type: type === "all" ? undefined : type },
        }),
      ),
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
          posterPath: item.posterPath ?? item.posterUrl,
          backdropPath: item.backdropPath ?? item.backdropUrl,
          releaseDate: item.releaseDate,
          firstAirDate: item.firstAirDate,
          genres: item.genres,
          runtime: item.runtime,
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

export function useLookupTitleMutation() {
  return useMutation({
    mutationFn: (item: SearchResult) =>
      authedApiRequest<{ id: string; type: MediaType }>("/lookup", {
        method: "POST",
        body: {
          type: item.type,
          tmdbId: item.tmdbId,
        },
      }),
  });
}
