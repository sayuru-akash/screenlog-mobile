import type {
  ActivityItem,
  CalendarItem,
  CustomListDetail,
  CustomListSummary,
  HomePayload,
  MediaType,
  NotificationItem,
  ProfilePin,
  ProviderSummary,
  ProfileCalendarDay,
  ProfileLogPage,
  ProfilePayload,
  ReviewSummary,
  SearchResult,
  SettingsPayload,
  ThemePreference,
  TitleSummary,
  UserSearchResult,
  Visibility,
  WatchlistPayload,
} from "@/types/domain";
import { normalizedExternalUrl } from "@/lib/external-links";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const HOME_ROUTE = "/(tabs)";

type AnyRecord = Record<string, unknown>;

export function tmdbImageUrl(path: unknown, size: "w500" | "w780" = "w500") {
  if (typeof path !== "string" || !path.trim()) return null;
  const value = path.trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (!value.startsWith("/")) return value;
  return `${TMDB_IMAGE_BASE}/${size}${value}`;
}

export function mapSearchPayload(payload: unknown): {
  results?: SearchResult[];
} {
  const raw = asRecord(payload);
  return {
    results: asArray(raw.results)
      .map((item) => normalizeSearchResult(item))
      .filter(Boolean) as SearchResult[],
  };
}

export function mapUserSearchPayload(payload: unknown): {
  results?: UserSearchResult[];
} {
  const raw = asRecord(payload);
  return {
    results: asArray(raw.results)
      .map((item) => normalizeUserSearchResult(item))
      .filter(Boolean) as UserSearchResult[],
  };
}

export function mapWatchlistPayload(payload: unknown): WatchlistPayload {
  const raw = asRecord(payload);
  return {
    shows: asArray(raw.shows)
      .map((item) => normalizeWatchlistRow(item, "show"))
      .filter(Boolean) as TitleSummary[],
    movies: asArray(raw.movies)
      .map((item) => normalizeWatchlistRow(item, "movie"))
      .filter(Boolean) as TitleSummary[],
  };
}

export function mapUpNextPayload(payload: unknown): HomePayload {
  const raw = asRecord(payload);
  const upNext = normalizeUpNextItem(raw.primary);
  const upNextItems = asArray(raw.items)
    .map(normalizeUpNextItem)
    .filter(Boolean) as TitleSummary[];
  return {
    upNext,
    upNextItems,
    continueWatching: upNextItems,
    favourites: [],
    activity: [],
  };
}

export function mapHomePayload(payload: unknown): HomePayload {
  const raw = asRecord(payload);
  const upNext = mapUpNextPayload(raw.upNext ?? raw);
  const watchlistRaw = asRecord(raw.watchlist);
  const watchlist = mapWatchlistPayload(watchlistRaw);
  const progressRows = asArray(raw.progress);
  const watchedEpisodeIds = new Set(
    progressRows
      .map((item) => nullableString(asRecord(item).episodeId))
      .filter(Boolean),
  );
  const shows = watchlist.shows ?? [];
  const movies = watchlist.movies ?? [];
  const continueWatching = asArray(watchlistRaw.shows)
    .map((item) => normalizeContinueWatchingRow(item, watchedEpisodeIds))
    .filter(Boolean) as TitleSummary[];
  const favourites = [...shows, ...movies].filter((item) => item.isFavourite);

  return {
    ...upNext,
    shows,
    movies,
    continueWatching: continueWatching.length
      ? continueWatching
      : upNext.continueWatching,
    favourites,
    recentWatches: progressRows
      .map(normalizeRecentWatch)
      .filter(Boolean) as TitleSummary[],
    activity: asArray(raw.activity)
      .map(normalizeActivityItem)
      .filter(Boolean) as HomePayload["activity"],
  };
}

export function mapCalendarPayload(payload: unknown): {
  items?: CalendarItem[];
} {
  const raw = asRecord(payload);
  if (Array.isArray(raw.items)) {
    return {
      items: raw.items
        .map((item) => normalizeCalendarItem(item))
        .filter(Boolean) as CalendarItem[],
    };
  }

  const groups = asRecord(raw.groups);
  const items = Object.entries(groups).flatMap(([group, values]) =>
    asArray(values)
      .map((item) => normalizeCalendarItem(item, group))
      .filter(Boolean),
  ) as CalendarItem[];
  return { items };
}

export function mapDiscoverPayload(payload: unknown): {
  rows?: Array<{ id: string; title: string; items: TitleSummary[] }>;
} {
  const raw = asRecord(payload);
  const buckets: Array<[string, string, MediaType, unknown]> = [
    ["trending-shows", "Trending Shows", "show", raw.trendingShows],
    ["trending-movies", "Trending Movies", "movie", raw.trendingMovies],
    ["popular-shows", "Popular Shows", "show", raw.popularShows],
    ["popular-movies", "Popular Movies", "movie", raw.popularMovies],
    ["top-rated-shows", "Top Rated Shows", "show", raw.topRatedShows],
    ["top-rated-movies", "Top Rated Movies", "movie", raw.topRatedMovies],
  ];

  return {
    rows: buckets
      .map(([id, title, type, values]) => ({
        id,
        title,
        items: asArray(values)
          .map((item) =>
            normalizeSearchResult({
              ...asRecord(item),
              type,
              id: asRecord(item).id ?? asRecord(item).tmdbId,
            }),
          )
          .filter(Boolean) as TitleSummary[],
      }))
      .filter((row) => row.items.length > 0),
  };
}

export function mapTitleDetailPayload(type: MediaType, payload: unknown) {
  const raw = asRecord(payload);
  const source = asRecord(raw[type]);
  const userState = asRecord(type === "show" ? raw.userShow : raw.userMovie);
  const watchedIds = new Set(
    asArray(raw.progress)
      .map((item) => asRecord(item).episodeId)
      .filter(Boolean),
  );
  const title = normalizeTitleLike(source, type, userState);
  const providers = providerList(raw.availability);

  return {
    ...title,
    provider: primaryProvider(raw.availability) ?? title.provider,
    providers,
    providerRegion: nullableString(asRecord(raw.availability).region),
    reviews: asArray(raw.reviews)
      .map(normalizeLog)
      .filter(Boolean) as ReviewSummary[],
    lists: asArray(raw.lists)
      .map(normalizeListSummary)
      .filter(Boolean) as CustomListSummary[],
    seasons:
      type === "show"
        ? asArray(source.seasons).map((season) =>
            normalizeSeason(season, watchedIds),
          )
        : undefined,
  };
}

export function mapTitleExtrasPayload(payload: unknown) {
  const extras = asRecord(asRecord(payload).extras ?? payload);
  return {
    trailers: asArray(extras.trailers).map((item) => {
      const raw = asRecord(item);
      return {
        id: stringValue(raw.id ?? raw.key ?? raw.url, "trailer"),
        title: stringValue(raw.title ?? raw.name, "Trailer"),
        url: trailerUrl(raw),
      };
    }),
    cast: asArray(extras.cast).map((item) => {
      const raw = asRecord(item);
      return {
        id: stringValue(raw.id, "cast"),
        name: stringValue(raw.name, "Cast"),
        role: nullableString(raw.role ?? raw.character),
        imageUrl: tmdbImageUrl(raw.imageUrl ?? raw.profilePath),
      };
    }),
    crew: asArray(extras.crew).map((item) => {
      const raw = asRecord(item);
      return {
        id: stringValue(raw.id, "crew"),
        name: stringValue(raw.name, "Crew"),
        role: nullableString(raw.role ?? raw.job),
      };
    }),
    related: asArray(extras.related)
      .map((item) =>
        normalizeSearchResult({
          ...asRecord(item),
          id: asRecord(item).id ?? asRecord(item).tmdbId,
        }),
      )
      .filter(Boolean) as TitleSummary[],
  };
}

function trailerUrl(raw: AnyRecord) {
  const key = nullableString(raw.key);
  if (key && /^[a-zA-Z0-9_-]{6,32}$/.test(key)) {
    return `https://www.youtube.com/watch?v=${key}`;
  }
  return normalizedExternalUrl(nullableString(raw.url));
}

export function mapListDetailPayload(payload: unknown): CustomListDetail {
  const raw = asRecord(payload);
  return normalizeListDetail(raw.list ?? raw);
}

export function mapListIndexPayload(payload: unknown): {
  lists?: CustomListSummary[];
} {
  const raw = asRecord(payload);
  return {
    lists: asArray(raw.lists)
      .map(normalizeListSummary)
      .filter(Boolean) as CustomListSummary[],
  };
}

export function mapLogPayload(payload: unknown): ReviewSummary {
  const raw = asRecord(payload);
  return normalizeLog(raw.log ?? raw) ?? { id: "" };
}

export function mapLogsPagePayload(payload: unknown): ProfileLogPage {
  const raw = asRecord(payload);
  return {
    logs: asArray(raw.logs)
      .map(normalizeLog)
      .filter(Boolean) as ReviewSummary[],
    nextCursor: nullableString(raw.nextCursor),
  };
}

export function mapCommentsPayload(payload: unknown): {
  comments?: ReviewSummary[];
} {
  const raw = asRecord(payload);
  return {
    comments: asArray(raw.comments)
      .map(normalizeComment)
      .filter(Boolean) as ReviewSummary[],
  };
}

export function mapNotificationsPayload(payload: unknown): {
  items?: NotificationItem[];
  unreadCount?: number;
} {
  const raw = asRecord(payload);
  return {
    unreadCount: numberOrUndefined(raw.unreadCount),
    items: asArray(raw.items)
      .map((item) => {
        const record = asRecord(item);
        const id = stringValue(record.id);
        if (!id) return null;
        return {
          id,
          title: stringValue(record.title, "Notification"),
          body: nullableString(record.body),
          read: Boolean(record.readAt),
          href: nullableString(record.href),
          createdAt: nullableString(record.createdAt),
        };
      })
      .filter(Boolean) as NotificationItem[],
  };
}

export function mapFeedPayload(payload: unknown): { items?: ActivityItem[] } {
  const raw = asRecord(payload);
  return {
    items: asArray(raw.items)
      .map(normalizeFeedItem)
      .filter(Boolean) as ActivityItem[],
  };
}

export function mapProfilePayload(payload: unknown): ProfilePayload {
  const raw = asRecord(payload);
  const user = asRecord(raw.user);
  const profile = asRecord(raw.profile);
  const stats = normalizeStats(raw.stats);
  const followerCount = numberOrUndefined(
    user.followerCount ?? profile.followerCount ?? stats.followerCount,
  );
  const followingCount = numberOrUndefined(
    user.followingCount ?? profile.followingCount ?? stats.followingCount,
  );

  return {
    user: {
      id: nullableString(user.id ?? profile.id ?? raw.userId) ?? undefined,
      name: nullableString(user.name ?? profile.name ?? raw.name),
      username: nullableString(
        user.username ?? profile.username ?? raw.username,
      ),
      bio: nullableString(user.bio ?? profile.bio ?? raw.bio),
      avatarUrl: tmdbImageUrl(
        user.avatarUrl ?? user.image ?? profile.avatarUrl ?? profile.image,
      ),
      followerCount,
      followingCount,
      profileVisibility: normalizeVisibility(
        user.profileVisibility ?? profile.profileVisibility,
      ),
    },
    calendar: asArray(raw.calendar)
      .map(normalizeProfileCalendarDay)
      .filter(Boolean) as ProfileCalendarDay[],
    stats,
    library: normalizeProfileLibrary(raw),
    lists: asArray(raw.lists)
      .map(normalizeListSummary)
      .filter(Boolean) as ProfilePayload["lists"],
    reviews: asArray(raw.reviews)
      .map(normalizeLog)
      .filter(Boolean) as ProfilePayload["reviews"],
    logs: asArray(raw.logs)
      .map(normalizeLog)
      .filter(Boolean) as ProfilePayload["logs"],
    pinned: profilePins(raw)
      .map(normalizeProfilePin)
      .filter(Boolean) as ProfilePayload["pinned"],
    avatarCandidates: asArray(
      raw.avatarCandidates ?? user.avatarCandidates ?? profile.avatarCandidates,
    )
      .map(normalizeAvatarCandidate)
      .filter(Boolean) as ProfilePayload["avatarCandidates"],
    isFollowing:
      raw.isFollowing === undefined && raw.following === undefined
        ? undefined
        : Boolean(raw.isFollowing ?? raw.following),
    following:
      raw.following === undefined && raw.isFollowing === undefined
        ? undefined
        : Boolean(raw.following ?? raw.isFollowing),
    isSelf: raw.isSelf === undefined ? undefined : Boolean(raw.isSelf),
    canViewProfile:
      raw.canViewProfile === undefined
        ? undefined
        : Boolean(raw.canViewProfile),
  };
}

function profilePins(raw: AnyRecord): unknown[] {
  const featuredPin = raw.featuredPin ?? raw.featured ?? raw.primaryPin;
  if (featuredPin) return [featuredPin];

  const pinned = raw.pinned ?? raw.pins;
  if (Array.isArray(pinned)) return asArray(pinned).slice(0, 1);
  if (pinned) return [pinned];
  return [];
}

function normalizeAvatarCandidate(
  item: unknown,
): NonNullable<ProfilePayload["avatarCandidates"]>[number] | null {
  const raw = asRecord(item);
  const image = tmdbImageUrl(
    raw.image ??
      raw.imageUrl ??
      raw.profileUrl ??
      raw.profilePath ??
      raw.profile_path,
    "w500",
  );
  const id =
    stringValue(raw.id ?? raw.castId ?? raw.personId ?? raw.tmdbId) || image;
  const gender = normalizeCandidateGender(raw.gender);
  const name = nullableString(raw.name ?? raw.character);
  const sourceType =
    mediaType(raw.sourceType ?? raw.source_type ?? raw.type) ?? "show";

  if (!id || !gender || !name || !image || !sourceType) return null;

  return {
    id,
    gender,
    name,
    character: nullableString(raw.character),
    image,
    sourceTitle: nullableString(raw.sourceTitle ?? raw.source_title),
    sourceType,
  };
}

function normalizeCandidateGender(value: unknown): "male" | "female" | null {
  if (value === "male" || value === 2 || value === "2") return "male";
  if (value === "female" || value === 1 || value === "1") return "female";
  return null;
}

function normalizeProfileLibrary(raw: AnyRecord): WatchlistPayload | undefined {
  const favoriteTitles = asArray(raw.favoriteTitles)
    .map(normalizeProfileTitle)
    .filter(Boolean) as TitleSummary[];
  const completedShows = asArray(raw.completedShows)
    .map(normalizeProfileTitle)
    .filter(Boolean) as TitleSummary[];
  const watchedMovies = asArray(raw.watchedMovies)
    .map(normalizeProfileTitle)
    .filter(Boolean) as TitleSummary[];

  if (
    !favoriteTitles.length &&
    !completedShows.length &&
    !watchedMovies.length
  ) {
    return undefined;
  }

  const shows = new Map<string, TitleSummary>();
  const movies = new Map<string, TitleSummary>();
  for (const item of [...favoriteTitles, ...completedShows, ...watchedMovies]) {
    const target = item.type === "show" ? shows : movies;
    target.set(item.id, { ...target.get(item.id), ...item });
  }

  return {
    shows: Array.from(shows.values()),
    movies: Array.from(movies.values()),
  };
}

function normalizeProfileTitle(item: unknown): TitleSummary | null {
  const raw = asRecord(item);
  const type = mediaType(raw.type ?? raw.mediaType ?? raw.media_type);
  if (!type) return null;
  return normalizeTitleLike(
    {
      ...raw,
      id: raw.mediaId ?? raw.media_id ?? raw.showId ?? raw.movieId ?? raw.id,
    },
    type,
    raw,
  );
}

export function mapSettingsPayload(payload: unknown): {
  preferences?: SettingsPayload;
} {
  const raw = asRecord(payload);
  const preferences = asRecord(raw.preferences);
  const user = asRecord(raw.user);

  return {
    preferences: {
      username: stringOrEmpty(user.username ?? preferences.username),
      bio: stringOrEmpty(user.bio ?? preferences.bio),
      profileVisibility: normalizeVisibility(
        user.profileVisibility ?? preferences.profileVisibility,
      ),
      theme: normalizeTheme(preferences.theme),
      region: regionCode(preferences.region),
      language: nullableString(preferences.language),
      timezone: stringValue(preferences.timezone, "Asia/Colombo"),
      defaultLogVisibility:
        normalizeVisibility(preferences.defaultLogVisibility) ?? "PRIVATE",
      defaultListVisibility:
        normalizeVisibility(preferences.defaultListVisibility) ?? "PRIVATE",
    },
  };
}

export function mobileRouteFromHref(href: unknown) {
  if (typeof href !== "string") return null;
  const value = href.trim();
  if (!value || value.includes("://") || value.startsWith("//")) return null;
  if (value === "/home" || value === "/") return HOME_ROUTE;
  if (/^\/(show|movie|list|log|user)\/[^/]+$/.test(value)) return value;
  if (
    ["/notifications", "/settings", "/feed", "/lists", "/discover"].includes(
      value,
    )
  )
    return value;
  return null;
}

function normalizeSearchResult(item: unknown): SearchResult | null {
  const source = asRecord(item);
  const type = mediaType(source.type ?? source.kind);
  if (!source.id || !type) return null;
  return {
    ...normalizeTitleLike(source, type),
    tmdbId: numberOrUndefined(source.tmdbId),
    posterPath: nullableString(source.posterPath),
    backdropPath: nullableString(source.backdropPath),
    releaseDate: nullableString(source.releaseDate),
    firstAirDate: nullableString(source.firstAirDate),
    genres: asArray(source.genres).map(String),
    runtime: numberOrUndefined(source.runtime),
    availabilityLabel: availabilityLabel(source.availability),
  };
}

function normalizeUserSearchResult(item: unknown): UserSearchResult | null {
  const raw = asRecord(item);
  const id = stringValue(raw.id);
  const username = stringValue(raw.username);
  if (!id || !username) return null;
  return {
    id,
    username,
    name: nullableString(raw.name),
    image: tmdbImageUrl(raw.image),
    bio: nullableString(raw.bio),
    profileVisibility: normalizeVisibility(raw.profileVisibility),
    canViewProfile: raw.canViewProfile === true,
    following: raw.following === true,
    followerCount: numberOrUndefined(raw.followerCount) ?? 0,
  };
}

function normalizeWatchlistRow(
  item: unknown,
  type: MediaType,
): TitleSummary | null {
  const row = asRecord(item);
  const source = asRecord(type === "show" ? row.show : row.movie);
  const id =
    type === "show" ? (row.showId ?? source.id) : (row.movieId ?? source.id);
  if (!id) return null;
  return normalizeTitleLike({ ...source, id }, type, row);
}

function normalizeActivityItem(item: unknown) {
  const raw = asRecord(item);
  const id = stringValue(raw.id);
  if (!id) return null;
  const user = asRecord(raw.user);
  return {
    id,
    text: stringValue(raw.text ?? raw.summary ?? raw.title, "Activity"),
    href: nullableString(raw.href) ?? undefined,
    user: {
      name: nullableString(user.name),
      username: nullableString(user.username),
      avatarUrl: tmdbImageUrl(user.avatarUrl ?? user.image),
    },
  };
}

function normalizeFeedItem(item: unknown): ActivityItem | null {
  const raw = asRecord(item);
  const type = nullableString(raw.type);

  if (type === "log") {
    const log = asRecord(raw.log);
    const id = stringValue(log.id ?? raw.id);
    if (!id) return null;
    const user = normalizeActivityUser(log.user);
    const title = feedTitle(log);
    return {
      id,
      text: `${user.name ?? user.username ?? "Someone"} reviewed ${title}`,
      href: `/log/${id}`,
      user,
    };
  }

  if (type === "list") {
    const list = asRecord(raw.list);
    const id = stringValue(list.id ?? raw.id);
    if (!id) return null;
    const user = normalizeActivityUser(list.user);
    return {
      id,
      text: `${user.name ?? user.username ?? "Someone"} updated ${stringValue(
        list.title,
        "a list",
      )}`,
      href: `/list/${id}`,
      user,
    };
  }

  return normalizeActivityItem(item);
}

function normalizeActivityUser(
  input: unknown,
): NonNullable<ActivityItem["user"]> {
  const user = asRecord(input);
  return {
    name: nullableString(user.name),
    username: nullableString(user.username),
    avatarUrl: tmdbImageUrl(user.avatarUrl ?? user.image),
  };
}

function normalizeContinueWatchingRow(
  item: unknown,
  watchedEpisodeIds: Set<string | null>,
): TitleSummary | null {
  const row = asRecord(item);
  const base = normalizeWatchlistRow(row, "show");
  if (!base || (base.status !== "WATCHING" && base.status !== "CAUGHT_UP")) {
    return null;
  }

  const show = asRecord(row.show);
  const episodes = sortedEpisodes(show);
  const next = episodes.find(
    (episode) => !watchedEpisodeIds.has(nullableString(episode.id)),
  );
  if (!next) return null;

  const watched = episodes.filter((episode) =>
    watchedEpisodeIds.has(nullableString(episode.id)),
  ).length;
  const total = episodes.length;
  const seasonNumber = numberOrUndefined(next.seasonNumber);
  const episodeNumber = numberOrUndefined(next.episodeNumber);
  const episodeTitle = stringValue(next.name ?? next.title, "Episode");

  return {
    ...base,
    nextLabel: episodeCode(seasonNumber, episodeNumber, episodeTitle),
    episodeLabel: episodeCode(seasonNumber, episodeNumber),
    nextEpisodeId: nullableString(next.id),
    episodeStillUrl: tmdbImageUrl(next.stillPath ?? next.stillUrl, "w780"),
    runtimeLabel:
      numberOrUndefined(next.runtime) !== undefined
        ? `${numberOrUndefined(next.runtime)} min`
        : base.runtimeLabel,
    progress: { watched, total },
    progressLabel: `${watched}/${total} eps`,
  };
}

function normalizeRecentWatch(item: unknown): TitleSummary | null {
  const raw = asRecord(item);
  const episode = asRecord(raw.episode);
  const season = asRecord(episode.season);
  const show = asRecord(season.show);
  const showId = nullableString(show.id);
  if (!showId) return null;

  const seasonNumber = numberOrUndefined(episode.seasonNumber);
  const episodeNumber = numberOrUndefined(episode.episodeNumber);
  return {
    id: showId,
    type: "show",
    activityId: stringValue(
      raw.id ?? raw.episodeId ?? episode.id ?? raw.watchedAt ?? showId,
    ),
    title: stringValue(show.title, "Untitled"),
    posterUrl: tmdbImageUrl(show.posterPath),
    nextLabel: episodeCode(seasonNumber, episodeNumber),
    episodeLabel: episodeCode(seasonNumber, episodeNumber),
    watchedAt: nullableString(raw.watchedAt),
  };
}

function sortedEpisodes(show: AnyRecord) {
  return asArray(show.seasons)
    .flatMap((season) => asArray(asRecord(season).episodes))
    .map(asRecord)
    .sort((left, right) => {
      const leftSeason = numberOrUndefined(left.seasonNumber) ?? 0;
      const rightSeason = numberOrUndefined(right.seasonNumber) ?? 0;
      if (leftSeason !== rightSeason) return leftSeason - rightSeason;
      return (
        (numberOrUndefined(left.episodeNumber) ?? 0) -
        (numberOrUndefined(right.episodeNumber) ?? 0)
      );
    });
}

function episodeCode(
  seasonNumber: number | undefined,
  episodeNumber: number | undefined,
  title?: string,
) {
  const code = `S${seasonNumber ?? "?"}E${episodeNumber ?? "?"}`;
  return title ? `${code} · ${title}` : code;
}

function feedTitle(log: AnyRecord) {
  const show = asRecord(log.show);
  const movie = asRecord(log.movie);
  const episode = asRecord(log.episode);
  return stringValue(
    log.title ?? show.title ?? movie.title ?? episode.name,
    "a title",
  );
}

function normalizeUpNextItem(item: unknown): TitleSummary | null {
  const raw = asRecord(item);
  const type = mediaType(raw.kind ?? raw.type);
  if (!raw.id || !type) return null;
  const progress = asRecord(raw.progress);
  const watched = numberOrUndefined(progress.watched);
  const total = numberOrUndefined(progress.total);
  const availability = availabilitySummary(raw.availability);
  return {
    id: stringValue(raw.id),
    type,
    tmdbId: numberOrUndefined(raw.tmdbId),
    title: stringValue(raw.title, "Untitled"),
    year: yearFrom(
      raw.year ?? raw.releaseDate ?? raw.firstAirDate ?? raw.subtitle,
    ),
    overview: nullableString(raw.overview),
    posterUrl: tmdbImageUrl(raw.posterPath ?? raw.posterUrl),
    backdropUrl: tmdbImageUrl(raw.backdropPath ?? raw.backdropUrl, "w780"),
    episodeStillUrl: tmdbImageUrl(raw.stillPath ?? raw.stillUrl, "w780"),
    reasonLabel: nullableString(raw.reason),
    nextLabel: nullableString(raw.subtitle),
    progressLabel:
      watched !== undefined && total !== undefined
        ? `${watched}/${total} watched`
        : null,
    progress:
      watched !== undefined && total !== undefined ? { watched, total } : null,
    nextEpisodeId: nullableString(progress.nextEpisodeId),
    runtimeLabel:
      numberOrUndefined(raw.runtime) !== undefined
        ? `${numberOrUndefined(raw.runtime)} min`
        : null,
    genres: asArray(raw.genres).map(String),
    provider: availability.provider,
    providers: availability.providers,
    availabilityLabel: availability.label,
    isAvailableOnSelected: availability.isAvailableOnSelected,
    hasAnyProvider: availability.hasAnyProvider,
    providerRegion: availability.region,
  };
}

function normalizeTitleLike(
  source: AnyRecord,
  type: MediaType,
  userState: AnyRecord = {},
): TitleSummary {
  const status = nullableString(userState.status ?? source.status);
  const availability = availabilitySummary(
    source.availability ?? userState.availability,
  );
  return {
    id: stringValue(source.id),
    type,
    tmdbId: numberOrUndefined(source.tmdbId),
    title: stringValue(source.title ?? source.name, "Untitled"),
    year: yearFrom(source.year ?? source.firstAirDate ?? source.releaseDate),
    overview: nullableString(source.overview),
    posterUrl: tmdbImageUrl(source.posterUrl ?? source.posterPath),
    backdropUrl: tmdbImageUrl(
      source.backdropUrl ?? source.backdropPath,
      "w780",
    ),
    runtimeLabel:
      numberOrUndefined(source.runtime) !== undefined
        ? `${numberOrUndefined(source.runtime)} min`
        : nullableString(source.runtimeLabel),
    status,
    isFavourite: Boolean(userState.isFavourite ?? source.isFavourite),
    isWatched: status === "WATCHED" || status === "COMPLETED",
    genres: asArray(source.genres).map(String),
    provider: availability.provider,
    providers: availability.providers,
    availabilityLabel: availability.label,
    isAvailableOnSelected: availability.isAvailableOnSelected,
    hasAnyProvider: availability.hasAnyProvider,
    providerRegion: availability.region,
  };
}

function normalizeCalendarItem(
  item: unknown,
  group?: string,
): CalendarItem | null {
  const raw = asRecord(item);
  const id = raw.id ?? raw.episodeId;
  if (!id) return null;
  const seasonNumber = numberOrUndefined(raw.seasonNumber);
  const episodeNumber = numberOrUndefined(raw.episodeNumber);
  const title = stringValue(raw.showTitle ?? raw.title, "Untitled");
  const episodeTitle = nullableString(raw.episodeTitle);
  const fallbackLabel = nullableString(raw.episodeLabel);
  const episodeLabel =
    fallbackLabel ??
    `${seasonNumber !== undefined ? `S${seasonNumber}` : "S?"}${episodeNumber !== undefined ? `E${episodeNumber}` : "E?"}${
      episodeTitle ? ` · ${episodeTitle}` : ""
    }`;

  return {
    id: stringValue(id),
    episodeId: stringValue(id),
    showId: nullableString(raw.showId),
    title,
    episodeLabel,
    airDate: nullableString(raw.airDate),
    posterUrl: tmdbImageUrl(raw.posterUrl ?? raw.posterPath),
    group,
  };
}

function normalizeSeason(season: unknown, watchedIds: Set<unknown>) {
  const raw = asRecord(season);
  const seasonNumber = numberOrUndefined(raw.seasonNumber);
  return {
    id: stringValue(raw.id),
    name:
      nullableString(raw.name) ??
      (seasonNumber ? `Season ${seasonNumber}` : "Season"),
    episodes: asArray(raw.episodes).map((episode) => {
      const ep = asRecord(episode);
      const epSeason = numberOrUndefined(ep.seasonNumber) ?? seasonNumber;
      const epNumber = numberOrUndefined(ep.episodeNumber);
      return {
        id: stringValue(ep.id),
        title: stringValue(ep.title ?? ep.name, "Episode"),
        episodeLabel:
          epSeason && epNumber
            ? `S${epSeason}E${epNumber}`
            : nullableString(ep.episodeLabel),
        watched: watchedIds.has(ep.id),
        stillUrl: tmdbImageUrl(ep.stillUrl ?? ep.stillPath, "w780"),
        runtimeLabel:
          numberOrUndefined(ep.runtime) !== undefined
            ? `${numberOrUndefined(ep.runtime)} min`
            : nullableString(ep.runtimeLabel),
        airDate: nullableString(ep.airDate),
        overview: nullableString(ep.overview),
      };
    }),
  };
}

function normalizeListSummary(item: unknown): CustomListSummary | null {
  const raw = asRecord(item);
  if (!raw.id) return null;
  const user = asRecord(raw.user);
  const itemCovers = asArray(raw.items)
    .map((listItem) => {
      const record = asRecord(listItem);
      const show = asRecord(record.show);
      const movie = asRecord(record.movie);
      return tmdbImageUrl(
        record.posterUrl ??
          record.posterPath ??
          movie.posterPath ??
          show.posterPath,
      );
    })
    .filter(Boolean) as string[];
  const covers = asArray(raw.covers)
    .map((cover) => tmdbImageUrl(cover))
    .filter(Boolean) as string[];
  return {
    id: stringValue(raw.id),
    title: stringValue(raw.title, "Untitled list"),
    description: nullableString(raw.description),
    visibility: normalizeVisibility(raw.visibility),
    count: numberOrUndefined(raw.count ?? asRecord(raw._count).items),
    covers: covers.length ? covers : itemCovers,
    canEdit: Boolean(raw.canEdit),
    tags: asArray(raw.tags).map(String),
    ranked: Boolean(raw.ranked),
    user: raw.user
      ? {
          id: nullableString(user.id) ?? undefined,
          name: nullableString(user.name),
          username: nullableString(user.username),
          avatarUrl: tmdbImageUrl(user.avatarUrl ?? user.image),
        }
      : undefined,
  };
}

function normalizeListDetail(item: unknown): CustomListDetail {
  const raw = asRecord(item);
  return {
    ...(normalizeListSummary(raw) ?? { id: "", title: "List" }),
    ranked: Boolean(raw.ranked),
    tags: asArray(raw.tags).map(String),
    canEdit: Boolean(raw.canEdit),
    items: asArray(raw.items)
      .map(normalizeListItem)
      .filter(Boolean) as CustomListDetail["items"],
  };
}

function normalizeListItem(item: unknown) {
  const raw = asRecord(item);
  const showSource = asRecord(raw.show);
  const movieSource = asRecord(raw.movie);
  const showId = raw.showId ?? raw.show_id ?? showSource.id;
  const movieId = raw.movieId ?? raw.movie_id ?? movieSource.id;
  const type =
    mediaType(raw.type ?? raw.mediaType ?? raw.media_type) ??
    (showId ? "show" : "movie");
  const source = type === "show" ? showSource : movieSource;
  const id = type === "show" ? showId : movieId;
  if (!id) return null;
  return {
    id: stringValue(raw.id ?? id),
    title: stringValue(raw.title ?? source.title, "Untitled"),
    type,
    tmdbId: numberOrUndefined(
      raw.tmdbId ?? raw.tmdb_id ?? source.tmdbId ?? source.tmdb_id,
    ),
    showId: type === "show" ? stringValue(id) : undefined,
    movieId: type === "movie" ? stringValue(id) : undefined,
    rank: numberOrNull(raw.rank),
    posterUrl: tmdbImageUrl(
      raw.posterUrl ??
        raw.poster_url ??
        raw.posterPath ??
        raw.poster_path ??
        source.posterPath ??
        source.poster_path,
    ),
    note: nullableString(raw.note),
    year: yearFrom(
      source.firstAirDate ??
        source.first_air_date ??
        source.releaseDate ??
        source.release_date ??
        source.year,
    ),
  };
}

function normalizeProfilePin(item: unknown): ProfilePin | null {
  const raw = asRecord(item);
  const log = asRecord(raw.log);
  const list = asRecord(raw.list);
  const typeText = nullableString(raw.type)?.toUpperCase();
  const showSource = asRecord(raw.show ?? log.show);
  const movieSource = asRecord(raw.movie ?? log.movie);

  if (typeText === "SHOW" || raw.showId || showSource.id) {
    const id = raw.showId ?? showSource.id;
    if (!id) return null;
    const title = normalizeTitleLike({ ...showSource, id }, "show");
    return {
      id: title.id,
      type: "show",
      title: title.title,
      subtitle: String(
        title.nextLabel ?? title.progressLabel ?? title.year ?? "",
      ),
      posterUrl: title.posterUrl,
      href: `/show/${title.id}`,
    };
  }

  if (typeText === "MOVIE" || raw.movieId || movieSource.id) {
    const id = raw.movieId ?? movieSource.id;
    if (!id) return null;
    const title = normalizeTitleLike({ ...movieSource, id }, "movie");
    return {
      id: title.id,
      type: "movie",
      title: title.title,
      subtitle: String(title.runtimeLabel ?? title.year ?? ""),
      posterUrl: title.posterUrl,
      href: `/movie/${title.id}`,
    };
  }

  if (typeText === "LIST" || raw.listId || list.id) {
    const id = raw.listId ?? list.id;
    if (!id) return null;
    return {
      id: stringValue(id),
      type: "list",
      title: stringValue(raw.title ?? list.title, "List"),
      subtitle: nullableString(list.description) ?? "Custom list",
      posterUrl: profileListPinPosterUrl(list),
      href: `/list/${stringValue(id)}`,
    };
  }

  if (typeText === "LOG" || raw.logId || log.id) {
    const id = raw.logId ?? log.id;
    if (!id) return null;
    const normalizedLog = normalizeLog(log);
    return {
      id: stringValue(id),
      type: "log",
      title: normalizedLog?.title ?? "Review",
      subtitle:
        normalizedLog?.rating !== null && normalizedLog?.rating !== undefined
          ? `${normalizedLog.rating}/10 review`
          : "Review",
      href: `/log/${stringValue(id)}`,
    };
  }

  return null;
}

function profileListPinPosterUrl(list: AnyRecord) {
  const directCover = tmdbImageUrl(
    list.coverUrl ?? list.coverPath ?? list.posterUrl ?? list.posterPath,
  );
  if (directCover) return directCover;

  const cover = asArray(list.covers)
    .map((item) => {
      const record = asRecord(item);
      return tmdbImageUrl(
        item ??
          record.url ??
          record.posterUrl ??
          record.posterPath ??
          record.coverUrl ??
          record.coverPath,
      );
    })
    .find(Boolean);
  if (cover) return cover;

  return (
    asArray(list.items)
      .map((item) => {
        const record = asRecord(item);
        const show = asRecord(record.show);
        const movie = asRecord(record.movie);
        return tmdbImageUrl(
          record.posterUrl ??
            record.posterPath ??
            movie.posterUrl ??
            movie.posterPath ??
            show.posterUrl ??
            show.posterPath,
        );
      })
      .find(Boolean) ?? null
  );
}

function normalizeProfileCalendarDay(item: unknown): ProfileCalendarDay | null {
  const raw = asRecord(item);
  const date = nullableString(raw.date);
  if (!date) return null;
  return {
    date,
    total: numberOrUndefined(raw.total ?? raw.count) ?? 0,
    parts: asArray(raw.parts).map(String),
    appOpened: Boolean(raw.appOpened),
  };
}

function normalizeStats(input: unknown): NonNullable<ProfilePayload["stats"]> {
  const raw = asRecord(input);
  const stats: NonNullable<ProfilePayload["stats"]> = {};

  for (const [key, value] of Object.entries(raw)) {
    const label = profileStatLabel(key);
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number"
    ) {
      stats[label] = profileStatValue(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      const labels = value
        .map((item) => {
          if (typeof item === "string" || typeof item === "number")
            return String(item);
          return nullableString(asRecord(item).name);
        })
        .filter(Boolean);
      if (labels.length) stats[label] = labels.join(", ");
    }
  }

  return stats;
}

const PROFILE_STAT_LABELS: Record<string, string> = {
  showsTracked: "Shows tracked",
  showsCompleted: "Shows completed",
  episodesWatched: "Episodes watched",
  moviesWatched: "Movies watched",
  totalMovies: "Total movies",
  totalWatchTimeMinutes: "Watch time",
  topGenres: "Top genres",
  followerCount: "Followers",
  followingCount: "Following",
  reviewCount: "Reviews",
  listCount: "Lists",
};

function profileStatLabel(key: string) {
  return (
    PROFILE_STAT_LABELS[key] ??
    key
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/^./, (char) => char.toUpperCase())
  );
}

function profileStatValue(key: string, value: string | number | null) {
  if (key === "totalWatchTimeMinutes" && typeof value === "number") {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    if (hours && minutes) return `${hours}h ${minutes}m`;
    if (hours) return `${hours}h`;
    return `${minutes}m`;
  }
  return value;
}

function normalizeLog(item: unknown): ReviewSummary | null {
  const raw = asRecord(item);
  if (!raw.id) return null;
  const show = asRecord(raw.show);
  const movie = asRecord(raw.movie);
  const episode = asRecord(raw.episode);
  const user = asRecord(raw.user);
  const title = raw.title ?? show.title ?? movie.title ?? episode.name;
  const seasonNumber = numberOrUndefined(episode.seasonNumber);
  const episodeNumber = numberOrUndefined(episode.episodeNumber);
  const episodeLabel =
    seasonNumber && episodeNumber ? `S${seasonNumber}E${episodeNumber}` : null;
  return {
    id: stringValue(raw.id),
    title: nullableString(title),
    subtitle:
      nullableString(raw.subtitle) ??
      (episodeLabel
        ? `${stringValue(show.title, "Untitled")} · ${episodeLabel}`
        : nullableString(movie.title ?? show.title)),
    body: nullableString(raw.body ?? raw.review),
    rating: numberOrNull(raw.rating),
    spoiler: Boolean(raw.spoiler),
    visibility: normalizeVisibility(raw.visibility),
    createdAt: nullableString(raw.createdAt ?? raw.watchedAt),
    watchedAt: nullableString(raw.watchedAt ?? raw.createdAt),
    posterUrl: tmdbImageUrl(
      raw.posterUrl ?? raw.posterPath ?? movie.posterPath ?? show.posterPath,
    ),
    rewatch: Boolean(raw.rewatch),
    commentCount: numberOrUndefined(asRecord(raw._count).comments),
    reactionScore: numberOrUndefined(raw.reactionScore),
    userReaction: numberOrUndefined(raw.userReaction),
    canEdit: Boolean(raw.canEdit),
    user: raw.user
      ? {
          id: nullableString(user.id) ?? undefined,
          name: nullableString(user.name),
          username: nullableString(user.username),
          avatarUrl: tmdbImageUrl(user.avatarUrl ?? user.image),
        }
      : undefined,
  };
}

function normalizeComment(item: unknown): ReviewSummary | null {
  const raw = normalizeLog(item);
  if (!raw) return null;
  const source = asRecord(item);
  const user = asRecord(source.user);
  return {
    ...raw,
    title: nullableString(user.name) ?? nullableString(user.username),
    replies: asArray(source.replies)
      .map(normalizeComment)
      .filter(Boolean) as ReviewSummary[],
  };
}

function primaryProvider(input: unknown): ProviderSummary | null {
  const provider =
    providerList(input).find((item) => {
      const record = asRecord(item);
      return record.selected;
    }) ?? providerList(input)[0];
  return provider ?? null;
}

function availabilitySummary(input: unknown): {
  provider: ProviderSummary | null;
  providers: ProviderSummary[];
  label: string | null;
  isAvailableOnSelected: boolean;
  hasAnyProvider: boolean;
  region: string | null;
} {
  const raw = asRecord(input);
  const providers = providerList(input);
  const selectedProviders = providers.filter((provider) => provider.selected);
  const provider = selectedProviders[0] ?? providers[0] ?? null;
  const isAvailableOnSelected = Boolean(raw.hasSelected);
  const hasAnyProvider = Boolean(raw.hasAny ?? providers.length > 0);

  let label: string | null = null;
  if (isAvailableOnSelected) {
    label = provider ? `On ${provider.name}` : "On selected services";
  } else if (hasAnyProvider) {
    label = "Available outside your services";
  } else if (input && Object.keys(raw).length) {
    label = "No streaming match";
  }

  return {
    provider,
    providers,
    label,
    isAvailableOnSelected,
    hasAnyProvider,
    region: regionCode(raw.region),
  };
}

function providerList(input: unknown): ProviderSummary[] {
  const availability = asRecord(input);
  return asArray(availability.providers)
    .map((provider) => {
      const raw = asRecord(provider);
      if (!raw.id && !raw.name) return null;
      return {
        id: raw.id ? stringValue(raw.id) : undefined,
        tmdbProviderId: numberOrUndefined(raw.tmdbProviderId),
        name: stringValue(raw.name, "Provider"),
        logoUrl: tmdbImageUrl(raw.logoUrl ?? raw.logoPath),
        logoPath: nullableString(raw.logoPath),
        displayPriority: numberOrUndefined(raw.displayPriority),
        type: nullableString(raw.type ?? raw.monetizationType),
        selected: Boolean(raw.selected),
      };
    })
    .filter(Boolean) as ProviderSummary[];
}

function availabilityLabel(input: unknown) {
  const provider = primaryProvider(input);
  return provider?.name ?? null;
}

function mediaType(value: unknown): MediaType | null {
  const text = typeof value === "string" ? value.toLowerCase() : "";
  if (text === "show") return "show";
  if (text === "movie") return "movie";
  return null;
}

function normalizeVisibility(value: unknown): Visibility | undefined {
  return value === "PRIVATE" || value === "FOLLOWERS" || value === "PUBLIC"
    ? value
    : undefined;
}

function normalizeTheme(value: unknown): ThemePreference {
  return value === "light" || value === "dark" || value === "system"
    ? value
    : "system";
}

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null
    ? (value as AnyRecord)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function stringValue(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function stringOrEmpty(value: unknown) {
  return typeof value === "string" ? value : "";
}

function regionCode(value: unknown) {
  return typeof value === "string" && /^[A-Za-z]{2}$/.test(value)
    ? value.toUpperCase()
    : "US";
}

function numberOrUndefined(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

function numberOrNull(value: unknown) {
  return numberOrUndefined(value) ?? null;
}

function yearFrom(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string" || !value.trim()) return null;
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match?.[0] ?? null;
}
