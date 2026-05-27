import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import type { NotificationSettingsPayload, ProviderSettingsPayload, SettingsPayload } from "@/types/domain";

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => authedApiRequest<{ preferences?: SettingsPayload }>("/settings"),
  });
}

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: SettingsPayload) =>
      authedApiRequest("/settings", {
        method: "POST",
        body: settings,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useNotificationSettingsQuery() {
  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: () => authedApiRequest<NotificationSettingsPayload>("/notification-settings"),
  });
}

export function useSaveNotificationSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: NotificationSettingsPayload) =>
      authedApiRequest("/notification-settings", {
        method: "POST",
        body: settings,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
    },
  });
}

export function useProvidersQuery(region?: string | null) {
  return useQuery({
    queryKey: queryKeys.providers(region ?? undefined),
    queryFn: () => authedApiRequest<{ providers?: Array<{ id: string; name: string }> }>("/providers", { query: { region } }),
  });
}

export function useSaveProvidersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: ProviderSettingsPayload) =>
      authedApiRequest("/providers", {
        method: "POST",
        body: settings,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["providers"] }),
        queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
        queryClient.invalidateQueries({ queryKey: ["home"] }),
      ]);
    },
  });
}
