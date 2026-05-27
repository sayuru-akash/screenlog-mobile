import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { ActivityItem } from "@/types/domain";

export function useFeedQuery() {
  return useQuery({
    queryKey: queryKeys.feed,
    queryFn: () => authedApiRequest<{ items?: ActivityItem[] }>("/feed"),
  });
}
