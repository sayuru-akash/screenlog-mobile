import { describe, expect, it } from "vitest";
import {
  dropShowConfirmationCopy,
  markCaughtUpConfirmationCopy,
  markSeasonConfirmationCopy,
  movieLogConfirmationCopy,
  pinConfirmationCopy,
  removeWatchlistConfirmationCopy,
} from "./action-confirmations";

describe("action confirmation copy", () => {
  it("explains profile pinning before changing the public showcase", () => {
    expect(pinConfirmationCopy({ title: "Heat", type: "movie" })).toEqual({
      title: "Pin to profile?",
      message:
        "Heat will appear in your profile showcase and may replace an older pinned item.",
      confirmLabel: "Pin",
    });
  });

  it("uses destructive copy for removing watchlist titles", () => {
    expect(
      removeWatchlistConfirmationCopy({ title: "Silo", type: "show" }),
    ).toMatchObject({
      title: "Remove show?",
      confirmLabel: "Remove",
      destructive: true,
    });
    expect(
      removeWatchlistConfirmationCopy({
        title: "Heat",
        type: "movie",
        watched: true,
      }),
    ).toMatchObject({
      title: "Remove watched status?",
      confirmLabel: "Remove status",
      destructive: true,
    });
  });

  it("separates bulk show actions from reversible status changes", () => {
    expect(dropShowConfirmationCopy("Dark")).toMatchObject({
      title: "Drop this show?",
      destructive: true,
    });
    expect(markSeasonConfirmationCopy("Season 1")).toMatchObject({
      title: "Mark season watched?",
      confirmLabel: "Mark watched",
    });
    expect(markCaughtUpConfirmationCopy("Dark")).toMatchObject({
      title: "Mark aired episodes watched?",
    });
  });

  it("explains movie logs because they add history entries", () => {
    expect(movieLogConfirmationCopy({ title: "Heat" })).toMatchObject({
      title: "Mark movie watched?",
      confirmLabel: "Mark watched",
    });
    expect(
      movieLogConfirmationCopy({ title: "Heat", rewatch: true }),
    ).toMatchObject({
      title: "Log rewatch?",
      confirmLabel: "Log rewatch",
    });
  });
});
