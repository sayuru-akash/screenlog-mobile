import { describe, expect, it } from "vitest";
import { queryKeys, stableParams } from "./query-keys";

describe("stableParams", () => {
  it("drops empty values and sorts keys for stable cache identities", () => {
    expect(stableParams({ q: "Inception", page: 1, empty: "", none: null })).toEqual({
      page: 1,
      q: "Inception",
    });
  });
});

describe("queryKeys", () => {
  it("keeps feature keys deterministic", () => {
    expect(queryKeys.search({ q: "Inception", type: "movie" })).toEqual([
      "search",
      { q: "Inception", type: "movie" },
    ]);
    expect(queryKeys.title("movie", "abc")).toEqual(["title", "movie", "abc"]);
  });
});
