import { describe, expect, it } from "vitest";
import { toDisplayListItems } from "./list-display";

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
