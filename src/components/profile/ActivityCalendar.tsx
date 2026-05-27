import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { AppText } from "@/components/primitives/Text";
import { useTheme } from "@/lib/theme";
import type { ProfileCalendarDay } from "@/types/domain";
import {
  activityDayLabel,
  visibleActivityDays,
} from "./activity-calendar-utils";

export function ActivityCalendar({
  days = [],
}: {
  days?: ProfileCalendarDay[];
}) {
  const theme = useTheme();
  const latest = useMemo(() => visibleActivityDays(days), [days]);
  const weeks = useMemo(() => buildWeeks(latest), [latest]);
  const [selected, setSelected] = useState<ProfileCalendarDay | null>(
    latest.at(-1) ?? null,
  );
  const max = Math.max(1, ...latest.map((day) => day.total));
  const activeDays = latest.filter((day) => day.total > 0).length;
  const totalActivity = latest.reduce((sum, day) => sum + day.total, 0);
  const selectedLabel = selected
    ? activityDayLabel(selected)
    : "No activity yet.";
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="heading">Activity</AppText>
        <AppText muted>
          {activeDays} active days · {totalActivity} total actions
        </AppText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ gap: theme.spacing.xs, paddingRight: theme.spacing.lg }}>
          <View
            style={{
              height: 18,
              flexDirection: "row",
              gap: 4,
              alignItems: "flex-end",
            }}
          >
            {weeks.map((week) => (
              <AppText
                key={`label-${week.key}`}
                variant="caption"
                muted
                style={{ width: 13 }}
                numberOfLines={1}
              >
                {week.monthLabel}
              </AppText>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {weeks.map((week) => (
              <View key={week.key} style={{ gap: 4 }}>
                {week.days.map((day, index) =>
                  day ? (
                    <Pressable
                      key={day.date}
                      accessibilityRole="button"
                      accessibilityLabel={activityDayLabel(day)}
                      onPress={() => setSelected(day)}
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: 3,
                        borderWidth: selected?.date === day.date ? 1 : 0,
                        borderColor: theme.colors.text,
                        backgroundColor: activityColor(
                          theme,
                          day.total / max,
                          day.total,
                        ),
                      }}
                    />
                  ) : (
                    <View
                      key={`empty-${week.key}-${index}`}
                      style={{ width: 13, height: 13 }}
                    />
                  ),
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: theme.spacing.md,
          alignItems: "center",
        }}
      >
        <AppText variant="caption" muted style={{ flex: 1 }}>
          {selectedLabel}
        </AppText>
        <View
          accessibilityLabel="Activity intensity legend"
          style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
        >
          {[0, 0.2, 0.45, 0.75].map((intensity) => (
            <View
              key={intensity}
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                backgroundColor: activityColor(theme, intensity, intensity),
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function buildWeeks(days: ProfileCalendarDay[]) {
  const weeks: Array<{
    key: string;
    monthLabel: string;
    days: Array<ProfileCalendarDay | null>;
  }> = [];
  let current: Array<ProfileCalendarDay | null> = [];

  days.forEach((day, index) => {
    const date = new Date(`${day.date}T00:00:00`);
    const weekday = Number.isNaN(date.getTime())
      ? current.length
      : date.getDay();
    if (index === 0) {
      current = Array.from({ length: weekday }, () => null);
    }
    current.push(day);
    if (current.length === 7) {
      weeks.push(toWeek(current, weeks.length));
      current = [];
    }
  });

  if (current.length) {
    while (current.length < 7) current.push(null);
    weeks.push(toWeek(current, weeks.length));
  }

  return weeks;
}

function toWeek(days: Array<ProfileCalendarDay | null>, index: number) {
  const firstDay = days.find(Boolean);
  const date = firstDay ? new Date(`${firstDay.date}T00:00:00`) : null;
  const previousDate =
    index > 0 && firstDay
      ? new Date(
          new Date(`${firstDay.date}T00:00:00`).setDate(date!.getDate() - 7),
        )
      : null;
  const monthLabel =
    date && (!previousDate || date.getMonth() !== previousDate.getMonth())
      ? date.toLocaleDateString(undefined, { month: "short" }).slice(0, 1)
      : "";
  return {
    key: firstDay?.date ?? `week-${index}`,
    monthLabel,
    days,
  };
}

function activityColor(
  theme: ReturnType<typeof useTheme>,
  intensity: number,
  total: number,
) {
  if (!total) return theme.colors.surfaceMuted;
  if (intensity > 0.66) return theme.colors.accent;
  if (intensity > 0.33) return theme.colors.success;
  return theme.mode === "dark" ? "#2F2F35" : "#DAD7E8";
}
