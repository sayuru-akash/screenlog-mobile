import { router } from "expo-router";
import { Bell, MoreHorizontal } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import { AppText } from "@/components/primitives/Text";
import {
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
} from "@/components/primitives/StateViews";
import { TitleRail } from "@/components/content/TitleRail";
import {
  titleToWatchlistInput,
  useProgressMutation,
  useWatchlistUpdateMutation,
} from "@/features/content/actions";
import { useHomeQuery } from "@/features/home/queries";
import { useTheme } from "@/lib/theme";

export default function HomeScreen() {
  const theme = useTheme();
  const home = useHomeQuery();
  const progress = useProgressMutation(
    home.data?.upNext?.type === "show" ? home.data.upNext.id : undefined,
  );
  const watchlistUpdate = useWatchlistUpdateMutation();
  const data = home.data;
  return (
    <Screen
      title="Watchlog"
      subtitle="What should you continue now?"
      right={
        <IconButton
          label="Notifications"
          onPress={() => router.push("/notifications")}
        >
          <Bell size={20} color={theme.colors.text} />
        </IconButton>
      }
    >
      {home.isLoading ? <LoadingState label="Finding your next title" /> : null}
      {home.isError ? (
        <ErrorState
          message={home.error.message}
          onRetry={() => void home.refetch()}
        />
      ) : null}
      {!home.isLoading && !home.isError ? (
        <>
          {data?.upNext ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${data.upNext.title}`}
              onPress={() =>
                router.push(`/${data.upNext?.type}/${data.upNext?.id}`)
              }
              style={({ pressed }) => ({
                borderRadius: theme.radius.md,
                overflow: "hidden",
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View style={{ minHeight: 260 }}>
                {data.upNext.backdropUrl || data.upNext.posterUrl ? (
                  <Image
                    source={{
                      uri:
                        data.upNext.backdropUrl ||
                        data.upNext.posterUrl ||
                        undefined,
                    }}
                    style={{ position: "absolute", inset: 0 }}
                    contentFit="cover"
                  />
                ) : null}
                <View
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    padding: theme.spacing.lg,
                    backgroundColor:
                      theme.mode === "dark"
                        ? "rgba(0,0,0,0.42)"
                        : "rgba(255,255,255,0.62)",
                    gap: theme.spacing.sm,
                  }}
                >
                  <AppText variant="caption" muted>
                    Up Next
                  </AppText>
                  <AppText variant="heading">{data.upNext.title}</AppText>
                  <AppText muted>
                    {data.upNext.nextLabel ||
                      data.upNext.progressLabel ||
                      "Ready when you are."}
                  </AppText>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: theme.spacing.sm,
                      alignItems: "center",
                    }}
                  >
                    <Button
                      loading={progress.isPending || watchlistUpdate.isPending}
                      disabled={
                        data.upNext.type === "show" &&
                        !data.upNext.nextEpisodeId
                      }
                      onPress={() => {
                        if (
                          data.upNext?.type === "show" &&
                          data.upNext.nextEpisodeId
                        ) {
                          progress.mutate({
                            action: "watch",
                            episodeId: data.upNext.nextEpisodeId,
                          });
                        } else if (data.upNext?.type === "movie") {
                          watchlistUpdate.mutate({
                            ...titleToWatchlistInput(data.upNext),
                            userStatus: "WATCHED",
                          });
                        }
                      }}
                    >
                      Mark Watched
                    </Button>
                    <IconButton label="More actions">
                      <MoreHorizontal size={18} color={theme.colors.text} />
                    </IconButton>
                  </View>
                </View>
              </View>
            </Pressable>
          ) : (
            <EmptyState
              title="Nothing queued yet"
              body="Search for a title to start tracking."
            />
          )}
          {progress.isError || watchlistUpdate.isError ? (
            <ErrorState
              message={
                progress.error?.message || watchlistUpdate.error?.message
              }
            />
          ) : null}
          <Section title="Continue Watching">
            <TitleRail
              items={data?.continueWatching}
              empty="No active progress."
            />
          </Section>
          <Section title="Favourites">
            <TitleRail
              items={data?.favourites}
              empty="Favourite titles appear here."
            />
          </Section>
          <Section title="Recent Activity">
            {data?.activity?.length ? (
              <View style={{ gap: theme.spacing.md }}>
                {data.activity.slice(0, 4).map((item) => (
                  <AppText key={item.id}>{item.text}</AppText>
                ))}
              </View>
            ) : (
              <EmptyState title="No recent activity" />
            )}
          </Section>
        </>
      ) : null}
    </Screen>
  );
}
