import type { ApiQueryValue } from "./api-client";

export function stableParams<TValue extends ApiQueryValue>(
  params: Record<string, TValue>,
) {
  const entries = Object.entries(params)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    )
    .sort(([left], [right]) => left.localeCompare(right));

  return Object.fromEntries(entries) as Record<
    string,
    Exclude<TValue, null | undefined | "">
  >;
}

export const queryKeys = {
  session: ["session"] as const,
  home: () => ["home"] as const,
  upNext: (filter = "all") => ["up-next", filter] as const,
  watchlist: (params: Record<string, ApiQueryValue> = {}) =>
    ["watchlist", stableParams(params)] as const,
  search: (params: Record<string, ApiQueryValue>) =>
    ["search", stableParams(params)] as const,
  userSearch: (params: Record<string, ApiQueryValue>) =>
    ["user-search", stableParams(params)] as const,
  discover: ["discover"] as const,
  calendar: (timezone: string) => ["calendar", timezone] as const,
  title: (type: "show" | "movie", id: string) => ["title", type, id] as const,
  titleExtras: (type: "show" | "movie", id: string) =>
    ["title-extras", type, id] as const,
  progress: (showId?: string) => ["progress", showId ?? "recent"] as const,
  providers: (region?: string) => ["providers", region ?? "default"] as const,
  notifications: ["notifications"] as const,
  settings: ["settings"] as const,
  profile: ["profile"] as const,
  profileLibrary: ["profile-library"] as const,
  profileHistory: (username?: string) =>
    ["profile-history", username ?? "me"] as const,
  user: (username: string) => ["user", username] as const,
  feed: ["feed"] as const,
  lists: (username?: string) => ["lists", username ?? "me"] as const,
  list: (id: string) => ["list", id] as const,
  log: (id: string) => ["log", id] as const,
  comments: (logId: string) => ["comments", logId] as const,
};
