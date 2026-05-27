import { describe, expect, it } from "vitest";
import {
  profileLibrarySectionCopy,
  selectProfileLibraryItems,
} from "./library-sections";
import type { WatchlistPayload } from "@/types/domain";

describe("profile library sections", () => {
  const library: WatchlistPayload = {
    shows: [
      {
        id: "show-1",
        type: "show",
        title: "Favourite Show",
        status: "WATCHING",
        isFavourite: true,
      },
      {
        id: "show-2",
        type: "show",
        title: "Completed Show",
        status: "COMPLETED",
        isFavourite: false,
      },
    ],
    movies: [
      {
        id: "movie-1",
        type: "movie",
        title: "Favourite Movie",
        status: "WATCHED",
        isFavourite: true,
      },
      {
        id: "movie-2",
        type: "movie",
        title: "Plain Movie",
        status: "WATCHED",
        isFavourite: false,
      },
    ],
  };

  it("selects favourites before completed shows and watched films", () => {
    expect(profileLibrarySectionCopy.favorites.title).toBe("Favorites");
    expect(
      selectProfileLibraryItems("favorites", library).map((item) => item.id),
    ).toEqual(["show-1", "movie-1"]);
    expect(
      selectProfileLibraryItems("completed-shows", library).map(
        (item) => item.id,
      ),
    ).toEqual(["show-2"]);
    expect(
      selectProfileLibraryItems("watched-movies", library).map(
        (item) => item.id,
      ),
    ).toEqual(["movie-1", "movie-2"]);
  });
});
