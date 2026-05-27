import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { WatchlistPayload } from "@/types/domain";

export function useWatchlistQuery(kind: "shows" | "movies") {
  return useQuery({
    queryKey: queryKeys.watchlist({ kind }),
    queryFn: () => authedApiRequest<WatchlistPayload>("/watchlist"),
  });
}
