import { describe, expect, it } from "vitest";
import { routeForListItem, toDisplayListItems } from "./list-display";

describe("toDisplayListItems", () => {
  it("uses visible order for display positions instead of stale stored rank values", () => {
    expect(
      toDisplayListItems([
        { id: "a", title: "Arrival", rank: 2 },
        { id: "b", title: "Inception", rank: 2 },
        { id: "c", title: "Heat", rank: 9 },
      ]),
    ).toEqual([
      { id: "a", title: "Arrival", rank: 2, displayPosition: 1 },
      { id: "b", title: "Inception", rank: 2, displayPosition: 2 },
      { id: "c", title: "Heat", rank: 9, displayPosition: 3 },
    ]);
  });
});

describe("routeForListItem", () => {
  it("opens movie items through the movie detail route", () => {
    expect(
      routeForListItem({
        id: "list-item-1",
        title: "Heat",
        type: "movie",
        movieId: "movie-1",
      }),
    ).toBe("/movie/movie-1");
  });

  it("opens show items through the show detail route", () => {
    expect(
      routeForListItem({
        id: "list-item-2",
        title: "Silo",
        type: "show",
        showId: "show-1",
      }),
    ).toBe("/show/show-1");
  });

  it("does not fall back from a broken movie item into a show route", () => {
    expect(
      routeForListItem({
        id: "list-item-3",
        title: "Broken movie",
        type: "movie",
      }),
    ).toBeNull();
  });
});
