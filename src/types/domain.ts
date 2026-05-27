export type MediaType = "show" | "movie";
export type Visibility = "PRIVATE" | "FOLLOWERS" | "PUBLIC";
export type ThemePreference = "light" | "dark" | "system";
export type WatchStatus =
  | "PLAN_TO_WATCH"
  | "WATCHING"
  | "CAUGHT_UP"
  | "COMPLETED"
  | "PAUSED"
  | "DROPPED"
  | "WATCHED";

export type ProviderSummary = {
  id?: string;
  name: string;
  logoUrl?: string | null;
  type?: string | null;
};

export type TitleSummary = {
  id: string;
  type: MediaType;
  tmdbId?: number;
  title: string;
  year?: string | number | null;
  overview?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  progressLabel?: string | null;
  nextLabel?: string | null;
  nextEpisodeId?: string | null;
  runtimeLabel?: string | null;
  status?: WatchStatus | (string & {}) | null;
  isFavourite?: boolean;
  isWatched?: boolean;
  provider?: ProviderSummary | null;
};

export type ActivityItem = {
  id: string;
  text: string;
  href?: string;
  user?: {
    name?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  };
};

export type HomePayload = {
  upNext?: TitleSummary | null;
  continueWatching?: TitleSummary[];
  favourites?: TitleSummary[];
  activity?: ActivityItem[];
};

export type SearchResult = TitleSummary & {
  tmdbId?: number;
  availabilityLabel?: string | null;
};

export type WatchlistPayload = {
  shows?: TitleSummary[];
  movies?: TitleSummary[];
};

export type CalendarItem = {
  id: string;
  episodeId?: string | null;
  showId?: string | null;
  title: string;
  episodeLabel: string;
  airDate?: string | null;
  posterUrl?: string | null;
  group?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body?: string | null;
  read?: boolean;
  readAt?: string | null;
  href?: string | null;
  createdAt?: string | null;
};

export type ProfileCalendarDay = {
  date: string;
  total: number;
  parts?: string[];
  appOpened?: boolean;
};

export type ProfilePayload = {
  user?: {
    id?: string;
    name?: string | null;
    username?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    followingCount?: number;
    followerCount?: number;
  };
  calendar?: ProfileCalendarDay[];
  stats?: Record<string, string | number | null>;
  lists?: CustomListSummary[];
  reviews?: ReviewSummary[];
  pinned?: TitleSummary[];
  isFollowing?: boolean;
};

export type ReviewSummary = {
  id: string;
  title?: string | null;
  body?: string | null;
  rating?: number | null;
  spoiler?: boolean;
  visibility?: Visibility;
  createdAt?: string | null;
  reactionScore?: number;
  userReaction?: number;
  canEdit?: boolean;
  replies?: ReviewSummary[];
};

export type CustomListSummary = {
  id: string;
  title: string;
  description?: string | null;
  visibility?: Visibility;
  count?: number;
  covers?: string[];
  canEdit?: boolean;
  tags?: string[];
};

export type CustomListDetail = CustomListSummary & {
  ranked?: boolean;
  items?: Array<{
    id: string;
    title: string;
    type: MediaType;
    showId?: string;
    movieId?: string;
    rank?: number | null;
    posterUrl?: string | null;
    note?: string | null;
  }>;
};

export type SettingsPayload = {
  theme?: ThemePreference;
  region?: string | null;
  language?: string | null;
  timezone?: string | null;
  profileVisibility?: Visibility;
  defaultLogVisibility?: Visibility;
  defaultListVisibility?: Visibility;
  username?: string | null;
  bio?: string | null;
};

export type NotificationSettingsPayload = {
  inAppEnabled: boolean;
  newEpisodeAlerts: boolean;
  seasonPremiereAlerts: boolean;
  staleWatchlistReminders: boolean;
  staleWatchlistDays: number;
};

export type ProviderSettingsPayload = {
  region: string;
  providerIds: string[];
  streamingTypes: Array<"FLATRATE" | "FREE" | "ADS" | "RENT" | "BUY">;
};
