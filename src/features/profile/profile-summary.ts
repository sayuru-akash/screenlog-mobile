import type { ProfilePayload } from "@/types/domain";

export type ProfileSummaryStat = {
  label: "Watch time" | "Movies" | "Shows" | "Reviews";
  value: string | number;
  displayValue: string;
  accessibilityLabel: string;
};

export function profileStatsForSummary(
  profile: ProfilePayload,
): ProfileSummaryStat[] {
  const stats = profile.stats ?? {};
  const items = [
    {
      label: "Watch time",
      value: stats["Watch time"] ?? "0m",
      displayValue: compactStatValue(stats["Watch time"] ?? "0m"),
    },
    {
      label: "Movies",
      value: stats["Movies watched"] ?? stats.Movies ?? 0,
      displayValue: compactStatValue(
        stats["Movies watched"] ?? stats.Movies ?? 0,
      ),
    },
    {
      label: "Shows",
      value: stats["Shows tracked"] ?? stats.Shows ?? 0,
      displayValue: compactStatValue(
        stats["Shows tracked"] ?? stats.Shows ?? 0,
      ),
    },
    {
      label: "Reviews",
      value: stats.Reviews ?? stats["Visible Review Count"] ?? 0,
      displayValue: compactStatValue(
        stats.Reviews ?? stats["Visible Review Count"] ?? 0,
      ),
    },
  ] satisfies Array<Omit<ProfileSummaryStat, "accessibilityLabel">>;

  return items.map((item) => ({
    ...item,
    accessibilityLabel: `${item.label}: ${item.displayValue}`,
  }));
}

function compactStatValue(value: string | number) {
  return String(value).trim() || "0";
}
