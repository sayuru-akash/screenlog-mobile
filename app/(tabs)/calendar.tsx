import { View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { useProgressMutation } from "@/features/content/actions";
import { useCalendarQuery } from "@/features/calendar/queries";
import { compactDate } from "@/lib/format";
import { useTheme } from "@/lib/theme";

export default function CalendarScreen() {
  const theme = useTheme();
  const calendar = useCalendarQuery();
  const progress = useProgressMutation();
  const items = calendar.data?.items ?? [];
  return (
    <Screen title="Calendar" subtitle="Upcoming unwatched episodes.">
      {calendar.isLoading ? <LoadingState label="Loading episodes" /> : null}
      {calendar.isError ? (
        <ErrorState
          message={calendar.error.message}
          onRetry={() => void calendar.refetch()}
        />
      ) : null}
      {progress.isError ? (
        <ErrorState message={progress.error.message} />
      ) : null}
      {!calendar.isLoading && !calendar.isError && !items.length ? (
        <EmptyState title="No upcoming episodes" />
      ) : null}
      <Section title="This Week">
        <View style={{ gap: theme.spacing.md }}>
          {items.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                gap: theme.spacing.md,
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <AppText variant="label">{item.title}</AppText>
                <AppText muted>
                  {item.episodeLabel}
                  {item.airDate ? ` · ${compactDate(item.airDate)}` : ""}
                </AppText>
              </View>
              {item.episodeId ? (
                <Button
                  variant="secondary"
                  loading={progress.isPending}
                  onPress={() =>
                    progress.mutate(
                      { action: "watch", episodeId: item.episodeId as string },
                      { onSuccess: () => void calendar.refetch() },
                    )
                  }
                >
                  Watched
                </Button>
              ) : null}
            </View>
          ))}
        </View>
      </Section>
    </Screen>
  );
}
