import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import { mapProfilePayload, mapWatchlistPayload } from "@/lib/api-mappers";
import { queryKeys } from "@/lib/query-keys";
import { authedApiRequest } from "@/lib/use-api";
import { buildProfileAvatarPayload } from "./avatar";
import type {
  ProfileAvatarCandidate,
  ProfilePayload,
  WatchlistPayload,
} from "@/types/domain";

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async (): Promise<ProfilePayload> =>
      mapProfilePayload(await authedApiRequest("/profile")),
  });
}

export function useUserProfileQuery(username: string) {
  return useQuery({
    queryKey: queryKeys.user(username),
    queryFn: async (): Promise<ProfilePayload> =>
      mapProfilePayload(await authedApiRequest(`/users/${username}`)),
  });
}

export function useProfileLibraryQuery() {
  return useQuery({
    queryKey: queryKeys.profileLibrary,
    queryFn: async (): Promise<WatchlistPayload> =>
      mapWatchlistPayload(await authedApiRequest("/watchlist")),
  });
}

export function useSetProfileAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidate: ProfileAvatarCandidate) =>
      authedApiRequest("/profile/avatar", {
        method: "POST",
        body: buildProfileAvatarPayload(candidate),
      }),
    onSuccess: async (_data, candidate) => {
      queryClient.setQueryData<ProfilePayload>(queryKeys.profile, (current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                avatarUrl: candidate.image,
              },
            }
          : current,
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.status === 400) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      }
    },
  });
}

export function useFollowMutation(username: string, following: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      authedApiRequest(`/users/${username}/follow`, {
        method: following ? "DELETE" : "POST",
        body: {},
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.user(username),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

export function useSetProfilePinMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pin: {
      type: "LOG" | "LIST" | "SHOW" | "MOVIE";
      rank?: number;
      logId?: string;
      listId?: string;
      showId?: string;
      movieId?: string;
    }) =>
      authedApiRequest("/profile/pins", {
        method: "POST",
        body: pin,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}
