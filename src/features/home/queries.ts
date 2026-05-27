import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { HomePayload } from "@/types/domain";

export function useHomeQuery(filter = "all") {
  return useQuery({
    queryKey: queryKeys.home(filter),
    queryFn: () => authedApiRequest<HomePayload>("/up-next", { query: { filter } }),
  });
}
