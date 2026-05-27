import { describe, expect, it } from "vitest";
import {
  buildListCreatePayload,
  buildListItemPayload,
  buildListRemoveItemPayload,
} from "./list-actions";

describe("buildListCreatePayload", () => {
  it("trims optional fields and lowercases unique tags", () => {
    expect(
      buildListCreatePayload({
        title: "  Rainy night thrillers ",
        description: "  Focused picks ",
        visibility: "PUBLIC",
        ranked: true,
        tags: "Thriller, noir, thriller",
      }),
    ).toEqual({
      title: "Rainy night thrillers",
      description: "Focused picks",
      visibility: "PUBLIC",
      ranked: true,
      tags: ["thriller", "noir"],
    });
  });
});

describe("buildListItemPayload", () => {
  it("sends tmdb fallback metadata without forcing a new rank", () => {
    expect(
      buildListItemPayload({
        id: "tmdb-1",
        type: "show",
        title: "One Piece",
        tmdbId: 37854,
        overview: "Pirates.",
        posterUrl: "/poster.jpg",
        posterPath: "/raw-poster.jpg",
      }),
    ).toEqual({
      type: "show",
      tmdbId: 37854,
      title: "One Piece",
      overview: "Pirates.",
      posterPath: "/raw-poster.jpg",
    });
  });
});

describe("buildListRemoveItemPayload", () => {
  it("sends the canonical title id for delete requests", () => {
    expect(
      buildListRemoveItemPayload({
        id: "item-1",
        title: "Dark",
        type: "show",
        showId: "show-1",
      }),
    ).toEqual({
      type: "show",
      showId: "show-1",
    });
    expect(
      buildListRemoveItemPayload({
        id: "item-2",
        title: "Heat",
        type: "movie",
        movieId: "movie-1",
      }),
    ).toEqual({
      type: "movie",
      movieId: "movie-1",
    });
  });
});
