import { useQuery } from "@tanstack/react-query";
import { mapHomePayload } from "@/lib/api-mappers";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { HomePayload } from "@/types/domain";

export function useHomeQuery(filter = "all") {
  return useQuery({
    queryKey: queryKeys.home(filter),
    queryFn: async (): Promise<HomePayload> => {
      const [upNext, watchlist] = await Promise.all([
        authedApiRequest("/up-next", { query: { filter } }),
        authedApiRequest("/watchlist"),
      ]);

      return mapHomePayload({ upNext, watchlist });
    },
  });
}
