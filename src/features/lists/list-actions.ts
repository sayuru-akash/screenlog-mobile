import type { SearchResult, Visibility } from "@/types/domain";

export type ListDraft = {
  title: string;
  description: string;
  visibility: Visibility;
  ranked: boolean;
  tags: string;
};

export function buildListCreatePayload(draft: ListDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    visibility: draft.visibility,
    ranked: draft.ranked,
    tags: parseTags(draft.tags),
  };
}

export function buildListItemPayload(item: SearchResult) {
  return compactObject({
    type: item.type,
    tmdbId: item.tmdbId,
    title: item.title,
    overview: item.overview,
    posterPath: item.posterUrl,
    backdropPath: item.backdropUrl,
  });
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
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== ""),
  ) as Partial<T>;
}
