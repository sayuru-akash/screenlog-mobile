import { describe, expect, it } from "vitest";
import { profileStatsForSummary } from "./profile-summary";
import type { ProfilePayload } from "@/types/domain";

describe("profile summary", () => {
  it("shows the compact stat row in the requested order", () => {
    const profile: ProfilePayload = {
      stats: {
        "Watch time": "12h",
        "Movies watched": 8,
        "Shows tracked": 5,
        Reviews: 3,
        Followers: 99,
        Lists: 4,
      },
    };

    expect(profileStatsForSummary(profile).map((item) => item.label)).toEqual([
      "Watch time",
      "Movies",
      "Shows",
      "Reviews",
    ]);
    expect(profileStatsForSummary(profile).map((item) => item.value)).toEqual([
      "12h",
      8,
      5,
      3,
    ]);
    expect(
      profileStatsForSummary(profile).map((item) => item.displayValue),
    ).toEqual(["12h", "8", "5", "3"]);
    expect(
      profileStatsForSummary(profile).map((item) => item.accessibilityLabel),
    ).toEqual(["Watch time: 12h", "Movies: 8", "Shows: 5", "Reviews: 3"]);
  });
});
