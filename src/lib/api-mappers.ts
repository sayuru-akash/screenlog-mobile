import type {
  ActivityItem,
  CalendarItem,
  CustomListDetail,
  CustomListSummary,
  HomePayload,
  MediaType,
  NotificationItem,
  ProviderSummary,
  ProfileCalendarDay,
  ProfilePayload,
  ReviewSummary,
  SearchResult,
  SettingsPayload,
  ThemePreference,
  TitleSummary,
  Visibility,
  WatchlistPayload,
} from "@/types/domain";

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
  const continueWatching = asArray(raw.items)
    .map(normalizeUpNextItem)
    .filter(Boolean) as TitleSummary[];
  return {
    upNext,
    continueWatching,
    favourites: [],
    activity: [],
  };
}

export function mapHomePayload(payload: unknown): HomePayload {
  const raw = asRecord(payload);
  const upNext = mapUpNextPayload(raw.upNext ?? raw);
  const watchlist = mapWatchlistPayload(raw.watchlist);
  const favourites = [
    ...(watchlist.shows ?? []),
    ...(watchlist.movies ?? []),
  ].filter((item) => item.isFavourite);

  return {
    ...upNext,
    favourites,
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

  return {
    ...title,
    provider: primaryProvider(raw.availability) ?? title.provider,
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
        url: nullableString(raw.url),
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
  const stats = normalizeStats(raw.stats);
  const followerCount = numberOrUndefined(
    user.followerCount ?? stats.followerCount,
  );
  const followingCount = numberOrUndefined(
    user.followingCount ?? stats.followingCount,
  );

  return {
    user: {
      id: nullableString(user.id) ?? undefined,
      name: nullableString(user.name),
      username: nullableString(user.username),
      bio: nullableString(user.bio),
      avatarUrl: tmdbImageUrl(user.avatarUrl ?? user.image),
      followerCount,
      followingCount,
    },
    calendar: asArray(raw.calendar)
      .map(normalizeProfileCalendarDay)
      .filter(Boolean) as ProfileCalendarDay[],
    stats,
    lists: asArray(raw.lists)
      .map(normalizeListSummary)
      .filter(Boolean) as ProfilePayload["lists"],
    reviews: asArray(raw.reviews)
      .map(normalizeLog)
      .filter(Boolean) as ProfilePayload["reviews"],
    pinned: asArray(raw.pinned ?? raw.pins)
      .map(normalizeProfilePin)
      .filter(Boolean) as ProfilePayload["pinned"],
    isFollowing: Boolean(raw.isFollowing ?? raw.following),
  };
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
    availabilityLabel: availabilityLabel(source.availability),
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
    backdropUrl: tmdbImageUrl(
      raw.backdropPath ?? raw.backdropUrl ?? raw.stillPath,
      "w780",
    ),
    nextLabel: nullableString(raw.subtitle),
    progressLabel:
      watched !== undefined && total !== undefined
        ? `${watched}/${total} watched`
        : null,
    nextEpisodeId: nullableString(progress.nextEpisodeId),
    runtimeLabel:
      numberOrUndefined(raw.runtime) !== undefined
        ? `${numberOrUndefined(raw.runtime)} min`
        : null,
    provider: primaryProvider(raw.availability),
  };
}

function normalizeTitleLike(
  source: AnyRecord,
  type: MediaType,
  userState: AnyRecord = {},
): TitleSummary {
  const status = nullableString(userState.status ?? source.status);
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
    provider: primaryProvider(source.availability ?? userState.availability),
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
      };
    }),
  };
}

function normalizeListSummary(item: unknown): CustomListSummary | null {
  const raw = asRecord(item);
  if (!raw.id) return null;
  return {
    id: stringValue(raw.id),
    title: stringValue(raw.title, "Untitled list"),
    description: nullableString(raw.description),
    visibility: normalizeVisibility(raw.visibility),
    count: numberOrUndefined(raw.count ?? asRecord(raw._count).items),
    covers: asArray(raw.covers).map(String),
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
  const type =
    mediaType(raw.type ?? raw.mediaType) ?? (raw.showId ? "show" : "movie");
  const source = asRecord(type === "show" ? raw.show : raw.movie);
  const id =
    type === "show" ? (raw.showId ?? source.id) : (raw.movieId ?? source.id);
  if (!id) return null;
  return {
    id: stringValue(raw.id ?? id),
    title: stringValue(raw.title ?? source.title, "Untitled"),
    type,
    showId: type === "show" ? stringValue(id) : undefined,
    movieId: type === "movie" ? stringValue(id) : undefined,
    rank: numberOrNull(raw.rank),
    posterUrl: tmdbImageUrl(
      raw.posterUrl ?? raw.posterPath ?? source.posterPath,
    ),
    note: nullableString(raw.note),
  };
}

function normalizeProfilePin(item: unknown): TitleSummary | null {
  const raw = asRecord(item);
  const log = asRecord(raw.log);
  const typeText = nullableString(raw.type)?.toUpperCase();
  const showSource = asRecord(raw.show ?? log.show);
  const movieSource = asRecord(raw.movie ?? log.movie);

  if (typeText === "SHOW" || raw.showId || showSource.id) {
    const id = raw.showId ?? showSource.id;
    if (!id) return null;
    return normalizeTitleLike({ ...showSource, id }, "show");
  }

  if (typeText === "MOVIE" || raw.movieId || movieSource.id) {
    const id = raw.movieId ?? movieSource.id;
    if (!id) return null;
    return normalizeTitleLike({ ...movieSource, id }, "movie");
  }

  return null;
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
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number"
    ) {
      stats[key] = value;
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
      if (labels.length) stats[key] = labels.join(", ");
    }
  }

  return stats;
}

function normalizeLog(item: unknown): ReviewSummary | null {
  const raw = asRecord(item);
  if (!raw.id) return null;
  const show = asRecord(raw.show);
  const movie = asRecord(raw.movie);
  const episode = asRecord(raw.episode);
  const title = raw.title ?? show.title ?? movie.title ?? episode.name;
  return {
    id: stringValue(raw.id),
    title: nullableString(title),
    body: nullableString(raw.body ?? raw.review),
    rating: numberOrNull(raw.rating),
    spoiler: Boolean(raw.spoiler),
    visibility: normalizeVisibility(raw.visibility),
    createdAt: nullableString(raw.createdAt ?? raw.watchedAt),
    reactionScore: numberOrUndefined(raw.reactionScore),
    userReaction: numberOrUndefined(raw.userReaction),
    canEdit: Boolean(raw.canEdit),
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
  const availability = asRecord(input);
  const provider =
    asArray(availability.providers).find((item) => {
      const record = asRecord(item);
      return record.selected;
    }) ?? asArray(availability.providers)[0];
  const raw = asRecord(provider);
  if (!raw.id && !raw.name) return null;
  return {
    id: raw.id ? stringValue(raw.id) : undefined,
    name: stringValue(raw.name, "Provider"),
    logoUrl: tmdbImageUrl(raw.logoUrl ?? raw.logoPath),
    type: nullableString(raw.type ?? raw.monetizationType),
  };
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
