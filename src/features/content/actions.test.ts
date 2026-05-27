import { describe, expect, it } from "vitest";
import {
  buildProgressPayload,
  buildReviewPayload,
  buildWatchlistUpdatePayload,
  normalizeRating,
} from "./action-payloads";

describe("buildWatchlistUpdatePayload", () => {
  it("keeps favourite independent from status", () => {
    expect(
      buildWatchlistUpdatePayload({
        type: "movie",
        id: "movie_1",
        isFavourite: true,
      }),
    ).toEqual({ type: "movie", id: "movie_1", isFavourite: true });
  });
});

describe("buildProgressPayload", () => {
  it("builds episode, season, caught-up, and reset actions", () => {
    expect(buildProgressPayload({ action: "watch", episodeId: "ep_1" })).toEqual({
      action: "watch",
      episodeId: "ep_1",
    });
    expect(buildProgressPayload({ action: "markCaughtUp", showId: "show_1" })).toEqual({
      action: "markCaughtUp",
      showId: "show_1",
    });
  });
});

describe("normalizeRating", () => {
  it("clamps ratings to backend range and permits empty values", () => {
    expect(normalizeRating("")).toBeNull();
    expect(normalizeRating("0")).toBe(1);
    expect(normalizeRating("11")).toBe(10);
    expect(normalizeRating("8")).toBe(8);
  });
});

describe("buildReviewPayload", () => {
  it("builds a movie review payload with trimmed text and tags", () => {
    expect(
      buildReviewPayload({
        type: "movie",
        movieId: "movie_1",
        rating: "9",
        review: "  Tight.  ",
        spoiler: false,
        visibility: "PUBLIC",
        tags: "rewatch, noir, noir",
      }),
    ).toMatchObject({
      type: "movie",
      movieId: "movie_1",
      rating: 9,
      review: "Tight.",
      spoiler: false,
      visibility: "PUBLIC",
      tags: ["rewatch", "noir"],
    });
  });
});
