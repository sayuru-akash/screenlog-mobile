import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mapListDetailPayload, mapListIndexPayload } from "@/lib/api-mappers";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type {
  CustomListDetail,
  CustomListSummary,
  SearchResult,
} from "@/types/domain";
import {
  buildListCreatePayload,
  buildListItemPayload,
  buildListRemoveItemPayload,
  type ListDraft,
} from "./list-actions";

export function useListsQuery(username?: string) {
  return useQuery({
    queryKey: queryKeys.lists(username),
    queryFn: async (): Promise<{ lists?: CustomListSummary[] }> =>
      mapListIndexPayload(
        await authedApiRequest("/lists", { query: { username } }),
      ),
  });
}

export function useListQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.list(id),
    queryFn: async (): Promise<CustomListDetail> =>
      mapListDetailPayload(await authedApiRequest(`/lists/${id}`)),
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

export function useRemoveListItemMutation(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: NonNullable<CustomListDetail["items"]>[number]) =>
      authedApiRequest(`/lists/${listId}/items`, {
        method: "DELETE",
        body: buildListRemoveItemPayload(item),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.list(listId) });
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}

export function useUpdateListMutation(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ListDraft) =>
      authedApiRequest<{ list?: CustomListSummary }>(`/lists/${listId}`, {
        method: "PATCH",
        body: buildListCreatePayload(draft),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.list(listId) });
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useDeleteListMutation(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      authedApiRequest(`/lists/${listId}`, {
        method: "DELETE",
        body: {},
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
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
