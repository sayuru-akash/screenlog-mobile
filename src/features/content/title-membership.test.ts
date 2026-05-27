import { describe, expect, it } from "vitest";
import { getTitleMembershipAction } from "./title-membership";
import type { TitleSummary } from "@/types/domain";

const title = (item: Partial<TitleSummary>): TitleSummary => ({
  id: item.id ?? "title-1",
  type: item.type ?? "movie",
  title: item.title ?? "Heat",
  status: item.status,
  isWatched: item.isWatched,
});

describe("getTitleMembershipAction", () => {
  it("shows add action for unsaved movies and shows", () => {
    expect(getTitleMembershipAction(title({ type: "movie" }))).toMatchObject({
      state: "add",
      label: "Add to watchlist",
    });
    expect(getTitleMembershipAction(title({ type: "show" }))).toMatchObject({
      state: "add",
      label: "Add to watchlist",
    });
  });

  it("does not treat a movie log as watchlist membership by itself", () => {
    expect(
      getTitleMembershipAction(title({ type: "movie", isWatched: true })),
    ).toMatchObject({
      state: "add",
      label: "Add to watchlist",
      selected: false,
    });
  });

  it("shows remove action for saved unwatched movies and active shows", () => {
    expect(
      getTitleMembershipAction(
        title({ type: "movie", status: "PLAN_TO_WATCH" }),
      ),
    ).toMatchObject({
      state: "remove",
      label: "Remove from watchlist",
    });
    expect(
      getTitleMembershipAction(title({ type: "show", status: "WATCHING" })),
    ).toMatchObject({
      state: "remove",
      label: "Remove from watchlist",
    });
  });

  it("uses watched-status copy for watched movies", () => {
    expect(
      getTitleMembershipAction(
        title({ type: "movie", status: "WATCHED", isWatched: true }),
      ),
    ).toMatchObject({
      state: "removeWatched",
      label: "Remove watched status",
    });
  });
});
