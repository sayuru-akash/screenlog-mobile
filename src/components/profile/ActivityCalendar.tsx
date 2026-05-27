import { Pressable, View } from "react-native";
import { AppText } from "@/components/primitives/Text";
import { useTheme } from "@/lib/theme";
import type { ProfileCalendarDay } from "@/types/domain";

export function ActivityCalendar({ days = [] }: { days?: ProfileCalendarDay[] }) {
  const theme = useTheme();
  const latest = days.slice(-84);
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
              accessibilityLabel={`${day.date}: ${day.parts?.join(", ") || "Active on Watchlog"}`}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                backgroundColor,
              }}
            />
          );
        })}
      </View>
      <AppText variant="caption" muted>
        Tap a day for activity details.
      </AppText>
    </View>
  );
}
