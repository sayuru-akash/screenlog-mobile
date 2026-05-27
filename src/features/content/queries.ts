import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { MediaType, ReviewSummary, TitleSummary } from "@/types/domain";

export type TitleDetailPayload = TitleSummary & {
  seasons?: Array<{
    id: string;
    name: string;
    episodes?: Array<{
      id: string;
      title: string;
      episodeLabel?: string | null;
      watched?: boolean;
      stillUrl?: string | null;
    }>;
  }>;
  reviews?: ReviewSummary[];
  lists?: Array<{ id: string; title: string }>;
};

export type TitleExtrasPayload = {
  trailers?: Array<{ id: string; title: string; url?: string | null }>;
  cast?: Array<{ id: string; name: string; role?: string | null; imageUrl?: string | null }>;
  crew?: Array<{ id: string; name: string; role?: string | null }>;
  related?: TitleSummary[];
};

export function useTitleQuery(type: MediaType, id: string) {
  return useQuery({
    queryKey: queryKeys.title(type, id),
    queryFn: () => authedApiRequest<TitleDetailPayload>(`/${type === "show" ? "shows" : "movies"}/${id}`),
  });
}

export function useTitleExtrasQuery(type: MediaType, id: string) {
  return useQuery({
    queryKey: queryKeys.titleExtras(type, id),
    queryFn: () =>
      authedApiRequest<TitleExtrasPayload>(`/${type === "show" ? "shows" : "movies"}/${id}/extras`),
  });
}
