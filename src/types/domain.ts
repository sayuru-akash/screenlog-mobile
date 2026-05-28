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
  tmdbProviderId?: number;
  name: string;
  logoUrl?: string | null;
  logoPath?: string | null;
  displayPriority?: number;
  type?: string | null;
  selected?: boolean;
};

export type ProgressSummary = {
  watched: number;
  total: number;
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
  episodeStillUrl?: string | null;
  reasonLabel?: string | null;
  progressLabel?: string | null;
  progress?: ProgressSummary | null;
  nextLabel?: string | null;
  nextEpisodeId?: string | null;
  runtimeLabel?: string | null;
  genres?: string[];
  watchedAt?: string | null;
  episodeLabel?: string | null;
  activityId?: string | null;
  status?: WatchStatus | (string & {}) | null;
  isFavourite?: boolean;
  isWatched?: boolean;
  availabilityLabel?: string | null;
  isAvailableOnSelected?: boolean;
  hasAnyProvider?: boolean;
  provider?: ProviderSummary | null;
  providers?: ProviderSummary[];
  providerRegion?: string | null;
};

export type ProfilePin = {
  id: string;
  type: MediaType | "list" | "log";
  title: string;
  subtitle?: string | null;
  posterUrl?: string | null;
  href:
    | `/show/${string}`
    | `/movie/${string}`
    | `/list/${string}`
    | `/log/${string}`;
};

export type ProfileAvatarCandidate = {
  id: string;
  gender: "male" | "female";
  name: string;
  character?: string | null;
  image: string;
  sourceTitle?: string | null;
  sourceType: MediaType;
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
  upNextItems?: TitleSummary[];
  continueWatching?: TitleSummary[];
  shows?: TitleSummary[];
  movies?: TitleSummary[];
  favourites?: TitleSummary[];
  recentWatches?: TitleSummary[];
  activity?: ActivityItem[];
};

export type SearchResult = TitleSummary & {
  tmdbId?: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  firstAirDate?: string | null;
  genres?: string[];
  runtime?: number;
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
    profileVisibility?: Visibility;
  };
  calendar?: ProfileCalendarDay[];
  stats?: Record<string, string | number | null>;
  library?: WatchlistPayload;
  lists?: CustomListSummary[];
  reviews?: ReviewSummary[];
  logs?: ReviewSummary[];
  pinned?: ProfilePin[];
  avatarCandidates?: ProfileAvatarCandidate[];
  isFollowing?: boolean;
  following?: boolean;
  isSelf?: boolean;
};

export type ProfileLogPage = {
  logs: ReviewSummary[];
  nextCursor?: string | null;
};

export type ReviewSummary = {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  rating?: number | null;
  spoiler?: boolean;
  visibility?: Visibility;
  createdAt?: string | null;
  watchedAt?: string | null;
  posterUrl?: string | null;
  rewatch?: boolean;
  commentCount?: number;
  reactionScore?: number;
  userReaction?: number;
  canEdit?: boolean;
  user?: {
    id?: string;
    name?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  };
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
  ranked?: boolean;
  user?: {
    id?: string;
    name?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  };
};

export type CustomListDetail = CustomListSummary & {
  ranked?: boolean;
  items?: Array<{
    id: string;
    title: string;
    type: MediaType;
    tmdbId?: number;
    showId?: string;
    movieId?: string;
    rank?: number | null;
    posterUrl?: string | null;
    note?: string | null;
    year?: string | number | null;
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

export type ProviderCatalogPayload = {
  region?: string;
  catalogRegion?: string;
  isFallbackCatalog?: boolean;
  selectedProviderIds?: string[];
  streamingTypes?: ProviderSettingsPayload["streamingTypes"];
  providers?: ProviderSummary[];
};
