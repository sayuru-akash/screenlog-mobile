import { useQuery } from "@tanstack/react-query";
import { mapWatchlistPayload } from "@/lib/api-mappers";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { WatchlistPayload } from "@/types/domain";

export function useWatchlistQuery(kind: "shows" | "movies") {
  return useQuery({
    queryKey: queryKeys.watchlist({ kind }),
    queryFn: async (): Promise<WatchlistPayload> =>
      mapWatchlistPayload(await authedApiRequest("/watchlist")),
  });
}
