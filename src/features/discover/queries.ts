import { useQuery } from "@tanstack/react-query";
import { authedApiRequest } from "@/lib/use-api";
import type { TitleSummary } from "@/types/domain";

export type DiscoverRow = {
  id: string;
  title: string;
  items: TitleSummary[];
};

export function useDiscoverQuery() {
  return useQuery({
    queryKey: ["discover"],
    queryFn: () => authedApiRequest<{ rows?: DiscoverRow[] }>("/discover"),
  });
}
