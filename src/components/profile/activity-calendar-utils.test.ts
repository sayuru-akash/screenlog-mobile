import { describe, expect, it } from "vitest";
import {
  activityDayLabel,
  buildGithubActivityCalendar,
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
    ).toBe("May 27, 2026: 1 episode, 1 review");
    expect(activityDayLabel({ date: "2026-05-28", total: 0 })).toBe(
      "May 28, 2026: no activity",
    );
  });

  it("builds a fixed GitHub-style last-year grid ending on the current day", () => {
    const calendar = buildGithubActivityCalendar(
      [
        { date: "2026-05-28", total: 3, parts: ["2 episodes", "1 review"] },
        { date: "2026-01-01", total: 1, parts: ["1 movie"] },
      ],
      new Date("2026-05-28T10:00:00"),
    );

    expect(calendar.days).toHaveLength(365);
    expect(calendar.days[0]?.date).toBe("2025-05-29");
    expect(calendar.days.at(-1)?.date).toBe("2026-05-28");
    expect(calendar.days.at(-1)?.total).toBe(3);
    expect(calendar.weeks.every((week) => week.days.length === 7)).toBe(true);
    expect(calendar.monthLabels.map((month) => month.label)).toContain("Jan");
  });
});
