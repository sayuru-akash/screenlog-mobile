import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { AppText } from "@/components/primitives/Text";
import { useTheme } from "@/lib/theme";
import type { ProfileCalendarDay } from "@/types/domain";
import {
  activityDayLabel,
  buildGithubActivityCalendar,
  type ActivityCalendarDay,
} from "./activity-calendar-utils";

const CELL_SIZE = 11;
const CELL_GAP = 3;
const WEEKDAY_LABEL_WIDTH = 28;
const MONTH_LABEL_HEIGHT = 18;
const GRID_WIDTH = 53 * (CELL_SIZE + CELL_GAP);
const WEEK_STRIDE = CELL_SIZE + CELL_GAP;

export function ActivityCalendar({
  days = [],
}: {
  days?: ProfileCalendarDay[];
}) {
  const theme = useTheme();
  const calendar = useMemo(() => buildGithubActivityCalendar(days), [days]);
  const [selected, setSelected] = useState<ActivityCalendarDay | null>(null);
  const max = Math.max(1, ...calendar.days.map((day) => day.total));
  const activeDays = calendar.days.filter((day) => day.total > 0).length;
  const totalActivity = calendar.days.reduce((sum, day) => sum + day.total, 0);

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
          {totalActivity} activity {totalActivity === 1 ? "entry" : "entries"}{" "}
          in the last year
        </AppText>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ paddingRight: theme.spacing.lg }}>
          <View
            style={{
              height: MONTH_LABEL_HEIGHT,
              marginLeft: WEEKDAY_LABEL_WIDTH,
              width: GRID_WIDTH,
            }}
          >
            {calendar.monthLabels.map((month) => (
              <AppText
                key={month.key}
                variant="caption"
                muted
                numberOfLines={1}
                style={{
                  position: "absolute",
                  left: month.weekIndex * WEEK_STRIDE,
                  top: 0,
                  width: 34,
                  fontSize: 10,
                }}
              >
                {month.label}
              </AppText>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: CELL_GAP }}>
            <View
              style={{
                width: WEEKDAY_LABEL_WIDTH,
                height: 7 * CELL_SIZE + 6 * CELL_GAP,
              }}
            >
              <WeekdayLabel top={CELL_SIZE + CELL_GAP} label="Mon" />
              <WeekdayLabel top={3 * (CELL_SIZE + CELL_GAP)} label="Wed" />
              <WeekdayLabel top={5 * (CELL_SIZE + CELL_GAP)} label="Fri" />
            </View>

            <View style={{ flexDirection: "row", gap: CELL_GAP }}>
              {calendar.weeks.map((week) => (
                <View key={week.key} style={{ gap: CELL_GAP }}>
                  {week.days.map((day, index) =>
                    day ? (
                      <Pressable
                        key={day.date}
                        accessibilityRole="button"
                        accessibilityLabel={activityDayLabel(day)}
                        accessibilityState={{
                          selected: selected?.date === day.date,
                        }}
                        hitSlop={4}
                        onPress={() => setSelected(day)}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: 2,
                          borderWidth: selected?.date === day.date ? 1 : 0,
                          borderColor:
                            theme.mode === "dark" ? "#FFFFFF" : "#111111",
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
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      />
                    ),
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {selected ? (
        <AppText variant="caption" muted>
          {activityDayLabel(selected)}
        </AppText>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        <AppText variant="caption" muted>
          {activeDays} active {activeDays === 1 ? "day" : "days"}
        </AppText>
        <View
          accessibilityLabel="Activity intensity legend"
          style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
        >
          <AppText variant="caption" muted>
            Less
          </AppText>
          {[0, 0.2, 0.45, 0.75, 1].map((intensity) => (
            <View
              key={intensity}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                borderRadius: 2,
                backgroundColor: activityColor(theme, intensity, intensity),
              }}
            />
          ))}
          <AppText variant="caption" muted>
            More
          </AppText>
        </View>
      </View>
    </View>
  );
}

function WeekdayLabel({ top, label }: { top: number; label: string }) {
  return (
    <AppText
      variant="caption"
      muted
      style={{
        position: "absolute",
        top: top - 3,
        left: 0,
        width: WEEKDAY_LABEL_WIDTH - 4,
        fontSize: 10,
      }}
    >
      {label}
    </AppText>
  );
}

function activityColor(
  theme: ReturnType<typeof useTheme>,
  intensity: number,
  total: number,
) {
  if (!total) return theme.mode === "dark" ? "#1F1F1F" : "#EBEDF0";
  if (intensity > 0.75) return theme.mode === "dark" ? "#39D353" : "#216E39";
  if (intensity > 0.5) return theme.mode === "dark" ? "#26A641" : "#30A14E";
  if (intensity > 0.25) return theme.mode === "dark" ? "#006D32" : "#40C463";
  return theme.mode === "dark" ? "#0E4429" : "#9BE9A8";
}
