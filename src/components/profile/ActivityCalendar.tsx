import { useState } from "react";
import { Pressable, View } from "react-native";
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
  const latest = visibleActivityDays(days);
  const [selected, setSelected] = useState<ProfileCalendarDay | null>(
    latest.at(-1) ?? null,
  );
  const max = Math.max(1, ...latest.map((day) => day.total));
  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
        {latest.map((day) => {
          const intensity = day.total / max;
          const backgroundColor =
            day.total === 0
              ? theme.colors.surfaceMuted
              : intensity > 0.66
                ? theme.colors.accent
                : intensity > 0.33
                  ? theme.colors.accentSoft
                  : theme.colors.border;
          return (
            <Pressable
              key={day.date}
              accessibilityRole="button"
              accessibilityLabel={activityDayLabel(day)}
              onPress={() => setSelected(day)}
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                backgroundColor,
              }}
            />
          );
        })}
      </View>
      <AppText variant="caption" muted>
        {selected ? activityDayLabel(selected) : "No activity yet."}
      </AppText>
    </View>
  );
}
