import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { CustomListDetail, CustomListSummary, SearchResult } from "@/types/domain";
import { buildListCreatePayload, buildListItemPayload, type ListDraft } from "./list-actions";

export function useListsQuery(username?: string) {
  return useQuery({
    queryKey: queryKeys.lists(username),
    queryFn: () => authedApiRequest<{ lists?: CustomListSummary[] }>("/lists", { query: { username } }),
  });
}

export function useListQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.list(id),
    queryFn: () => authedApiRequest<CustomListDetail>(`/lists/${id}`),
  });
}

export function useAddListItemMutation(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: SearchResult) =>
      authedApiRequest(`/lists/${listId}/items`, {
        method: "POST",
        body: buildListItemPayload(item),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.list(listId) });
    },
  });
}

export function useCreateListMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ListDraft) =>
      authedApiRequest<{ list?: CustomListSummary }>("/lists", {
        method: "POST",
        body: buildListCreatePayload(draft),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
