import { describe, expect, it } from "vitest";
import {
  activityDayLabel,
  visibleActivityDays,
} from "./activity-calendar-utils";

describe("activity calendar helpers", () => {
  it("keeps the full supplied calendar instead of truncating to a short window", () => {
    const days = Array.from({ length: 365 }, (_, index) => ({
      date: `2026-01-${String((index % 28) + 1).padStart(2, "0")}`,
      total: index,
    }));

    expect(visibleActivityDays(days)).toHaveLength(365);
  });

  it("formats day details from backend activity parts", () => {
    expect(
      activityDayLabel({
        date: "2026-05-27",
        total: 2,
        parts: ["1 episode", "1 review"],
      }),
    ).toBe("2026-05-27: 1 episode, 1 review");
    expect(activityDayLabel({ date: "2026-05-28", total: 0 })).toBe(
      "2026-05-28: no activity",
    );
  });
});
