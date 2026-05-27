import type {
  MediaType,
  SearchResult,
  TitleSummary,
  Visibility,
  WatchStatus,
} from "@/types/domain";

export type WatchlistUpdateInput = {
  type: MediaType;
  id?: string;
  tmdbId?: number;
  title?: string;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  firstAirDate?: string | null;
  releaseDate?: string | null;
  genres?: string[];
  runtime?: number | null;
  userStatus?: WatchStatus;
  isFavourite?: boolean;
};

export type ProgressInput =
  | { action: "watch" | "unwatch"; episodeId: string }
  | { action: "markSeason"; seasonId: string }
  | { action: "markCaughtUp" | "resetShow"; showId: string };

export type ReviewDraft = {
  type: MediaType;
  showId?: string;
  movieId?: string;
  episodeId?: string | null;
  rating: string;
  review: string;
  spoiler: boolean;
  rewatch?: boolean;
  visibility: Visibility;
  tags: string;
  privateNotes?: string | null;
};

export function buildWatchlistUpdatePayload(input: WatchlistUpdateInput) {
  return compactObject(input);
}

export function buildProgressPayload(input: ProgressInput) {
  return input;
}

export function normalizeRating(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed)) return null;
  return Math.min(10, Math.max(1, parsed));
}

export function buildReviewPayload(draft: ReviewDraft) {
  return compactObject({
    type: draft.type,
    showId: draft.showId,
    movieId: draft.movieId,
    episodeId: draft.episodeId || undefined,
    watchedAt: new Date().toISOString(),
    rating: normalizeRating(draft.rating),
    review: draft.review.trim() || null,
    spoiler: draft.spoiler,
    rewatch: draft.rewatch ?? false,
    tags: parseTags(draft.tags),
    privateNotes: draft.privateNotes?.trim() || null,
    visibility: draft.visibility,
  });
}

export function titleToWatchlistInput(
  item: TitleSummary | SearchResult,
): WatchlistUpdateInput {
  return compactObject({
    type: item.type,
    id: item.id,
    tmdbId: "tmdbId" in item ? item.tmdbId : undefined,
    title: item.title,
    overview: item.overview,
    posterPath: item.posterUrl,
    backdropPath: item.backdropUrl,
  }) as WatchlistUpdateInput;
}

function parseTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 12);
}

function compactObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entry]) => entry !== undefined && entry !== "",
    ),
  ) as Partial<T>;
}
