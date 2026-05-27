import { useQuery } from "@tanstack/react-query";
import { mapHomePayload, mapUpNextPayload } from "@/lib/api-mappers";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { HomePayload } from "@/types/domain";

export function useHomeQuery() {
  return useQuery({
    queryKey: queryKeys.home(),
    queryFn: async (): Promise<HomePayload> => {
      const [watchlist, progress] = await Promise.all([
        authedApiRequest("/watchlist"),
        authedApiRequest("/progress"),
      ]);

      return mapHomePayload({
        watchlist,
        progress:
          progress && typeof progress === "object" && "progress" in progress
            ? progress.progress
            : progress,
      });
    },
  });
}

export function useUpNextQuery(filter = "all") {
  return useQuery({
    queryKey: queryKeys.upNext(filter),
    queryFn: async (): Promise<HomePayload> =>
      mapUpNextPayload(
        await authedApiRequest("/up-next", { query: { filter } }),
      ),
  });
}
