import { View } from "react-native";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import { EmptyState, ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { useCalendarQuery } from "@/features/calendar/queries";
import { compactDate } from "@/lib/format";
import { useTheme } from "@/lib/theme";

export default function CalendarScreen() {
  const theme = useTheme();
  const calendar = useCalendarQuery();
  const items = calendar.data?.items ?? [];
  return (
    <Screen title="Calendar" subtitle="Upcoming unwatched episodes.">
      {calendar.isLoading ? <LoadingState label="Loading episodes" /> : null}
      {calendar.isError ? <ErrorState message={calendar.error.message} onRetry={() => void calendar.refetch()} /> : null}
      {!calendar.isLoading && !calendar.isError && !items.length ? <EmptyState title="No upcoming episodes" /> : null}
      <Section title="This Week">
        <View style={{ gap: theme.spacing.md }}>
          {items.map((item) => (
            <View key={item.id} style={{ gap: 3 }}>
              <AppText variant="label">{item.title}</AppText>
              <AppText muted>
                {item.episodeLabel}
                {item.airDate ? ` · ${compactDate(item.airDate)}` : ""}
              </AppText>
            </View>
          ))}
        </View>
      </Section>
    </Screen>
  );
}
