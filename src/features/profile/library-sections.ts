import type { TitleSummary, WatchlistPayload } from "@/types/domain";

export type ProfileLibrarySection =
  | "favorites"
  | "completed-shows"
  | "watched-movies";

export const profileLibrarySectionCopy: Record<
  ProfileLibrarySection,
  {
    title: string;
    subtitle: string;
    empty: string;
    icon: "favorites" | "shows" | "movies";
  }
> = {
  favorites: {
    title: "Favorites",
    subtitle: "Shows and films you have marked as favourites.",
    empty: "Favourite titles will appear here.",
    icon: "favorites",
  },
  "completed-shows": {
    title: "Completed Shows",
    subtitle: "Series you have finished tracking.",
    empty: "Completed shows will appear here.",
    icon: "shows",
  },
  "watched-movies": {
    title: "Watched Films",
    subtitle: "Films marked watched on your profile.",
    empty: "Watched films will appear here.",
    icon: "movies",
  },
};

export function selectProfileLibraryItems(
  section: ProfileLibrarySection,
  library?: WatchlistPayload,
): TitleSummary[] {
  const shows = library?.shows ?? [];
  const movies = library?.movies ?? [];

  if (section === "favorites") {
    return [...shows, ...movies].filter((item) => item.isFavourite);
  }

  if (section === "completed-shows") {
    return shows.filter((item) => item.status === "COMPLETED");
  }

  return movies.filter((item) => item.status === "WATCHED");
}

export function isProfileLibrarySection(
  value: string | undefined,
): value is ProfileLibrarySection {
  return (
    value === "favorites" ||
    value === "completed-shows" ||
    value === "watched-movies"
  );
}
