import { describe, expect, it } from "vitest";
import { filterWatchlistTabItems } from "./filters";
import type { TitleSummary } from "@/types/domain";

const show = (status: TitleSummary["status"]): TitleSummary => ({
  id: `show-${status}`,
  type: "show",
  title: `Show ${status}`,
  status,
});

const movie = (
  status: TitleSummary["status"],
  isWatched = false,
): TitleSummary => ({
  id: `movie-${status}`,
  type: "movie",
  title: `Movie ${status}`,
  status,
  isWatched,
});

describe("filterWatchlistTabItems", () => {
  it("keeps only actively watching shows in the shows tab", () => {
    expect(
      filterWatchlistTabItems(
        [
          show("WATCHING"),
          show("PLAN_TO_WATCH"),
          show("CAUGHT_UP"),
          show("DROPPED"),
        ],
        "shows",
      ).map((item) => item.status),
    ).toEqual(["WATCHING"]);
  });

  it("keeps only movies still waiting to be watched in the movies tab", () => {
    expect(
      filterWatchlistTabItems(
        [
          movie("PLAN_TO_WATCH"),
          movie("WATCHED", true),
          movie("COMPLETED", true),
          movie("PLAN_TO_WATCH", true),
        ],
        "movies",
      ).map((item) => item.id),
    ).toEqual(["movie-PLAN_TO_WATCH"]);
  });
});
