import { describe, expect, it } from "vitest";
import { buildListCreatePayload, buildListItemPayload } from "./list-actions";

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
      }),
    ).toEqual({
      type: "show",
      tmdbId: 37854,
      title: "One Piece",
      overview: "Pirates.",
      posterPath: "/poster.jpg",
    });
  });
});
