import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  Bell,
  Check,
  Clock,
  Film,
  PlayCircle,
  Sparkles,
  Tv,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
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
import { ProviderChip } from "@/components/content/ProviderChip";
import { TitleRail } from "@/components/content/TitleRail";
import {
  titleToWatchlistInput,
  useProgressMutation,
  useWatchlistUpdateMutation,
} from "@/features/content/actions";
import { useHomeQuery, useUpNextQuery } from "@/features/home/queries";
import { useTheme } from "@/lib/theme";
import type { TitleSummary } from "@/types/domain";

type UpNextFilter = "all" | "available" | "short" | "movies";
type LibraryTab = "shows" | "movies";

const UP_NEXT_FILTERS: Array<{ value: UpNextFilter; label: string }> = [
  { value: "all", label: "Best" },
  { value: "available", label: "Available" },
  { value: "short", label: "Short" },
  { value: "movies", label: "Films" },
];

export default function HomeScreen() {
  const theme = useTheme();
  const [upNextFilter, setUpNextFilter] = useState<UpNextFilter>("all");
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("shows");
  const home = useHomeQuery();
  const upNextQuery = useUpNextQuery(upNextFilter);
  const progress = useProgressMutation();
  const watchlistUpdate = useWatchlistUpdateMutation();
  const data = home.data;
  const upNext = upNextQuery.data?.upNext;
  const alternates = upNextQuery.data?.upNextItems ?? [];

  const visibleShows = useMemo(
    () => (data?.shows ?? []).filter((item) => item.status !== "DROPPED"),
    [data?.shows],
  );
  const visibleMovies = useMemo(() => data?.movies ?? [], [data?.movies]);
  const visibleContinueWatching = useMemo(
    () => data?.continueWatching ?? [],
    [data?.continueWatching],
  );
  const planToWatch =
    libraryTab === "shows"
      ? visibleShows.filter((item) => item.status === "PLAN_TO_WATCH")
      : visibleMovies.filter((item) => item.status === "PLAN_TO_WATCH");

  const markWatched = (item: TitleSummary) => {
    if (item.type === "show" && item.nextEpisodeId) {
      progress.mutate({
        action: "watch",
        episodeId: item.nextEpisodeId,
      });
      return;
    }

    if (item.type === "movie") {
      watchlistUpdate.mutate({
        ...titleToWatchlistInput(item),
        userStatus: "WATCHED",
      });
    }
  };

  return (
    <Screen
      title="Watchlog"
      right={
        <IconButton
          label="Notifications"
          onPress={() => router.push("/notifications")}
        >
          <Bell size={20} color={theme.colors.text} />
        </IconButton>
      }
      contentStyle={{ gap: theme.spacing.xl }}
    >
      {home.isLoading ? <LoadingState label="Loading your dashboard" /> : null}
      {home.isError ? (
        <ErrorState
          message={home.error.message}
          onRetry={() => void home.refetch()}
        />
      ) : null}
      {!home.isLoading && !home.isError ? (
        <>
          <Section
            title="Up Next"
            action={
              <Sparkles
                size={18}
                color={theme.colors.accent}
                strokeWidth={2.4}
              />
            }
          >
            <SegmentedControl
              value={upNextFilter}
              options={UP_NEXT_FILTERS}
              onChange={setUpNextFilter}
            />
            {upNextQuery.isLoading || upNextQuery.isFetching ? (
              <UpNextSkeleton />
            ) : upNextQuery.isError ? (
              <ErrorState
                message={upNextQuery.error.message}
                onRetry={() => void upNextQuery.refetch()}
              />
            ) : upNext ? (
              <View style={{ gap: theme.spacing.md }}>
                <UpNextHero
                  item={upNext}
                  loading={progress.isPending || watchlistUpdate.isPending}
                  onMarkWatched={() => markWatched(upNext)}
                />
                {alternates.length ? (
                  <View style={{ gap: theme.spacing.sm }}>
                    {alternates.slice(0, 4).map((item, index) => (
                      <UpNextRow
                        key={`${item.type}-${item.id}-${index}`}
                        item={item}
                      />
                    ))}
                  </View>
                ) : (
                  <EmptyState
                    title="No other matches"
                    body="Try another Up Next filter."
                  />
                )}
              </View>
            ) : (
              <EmptyState
                title="Start tracking your first show"
                body="Search for your favourite series and movies and Watchlog will build this dashboard."
              />
            )}
          </Section>

          {progress.isError || watchlistUpdate.isError ? (
            <ErrorState
              message={
                progress.error?.message || watchlistUpdate.error?.message
              }
            />
          ) : null}

          <View style={{ gap: theme.spacing.md }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                paddingBottom: theme.spacing.sm,
              }}
            >
              <View style={{ flex: 1 }}>
                <LibraryTabs
                  value={libraryTab}
                  onChange={setLibraryTab}
                  showCount={data?.shows?.length ?? 0}
                  movieCount={data?.movies?.length ?? 0}
                />
              </View>
            </View>
          </View>

          {libraryTab === "shows" ? (
            <>
              <ContinueWatchingSection
                items={visibleContinueWatching}
                loading={progress.isPending}
                onMarkWatched={markWatched}
              />
              <RecentActivityRail items={data?.recentWatches ?? []} />
              {planToWatch.length ? (
                <Section
                  title="Plan to Watch"
                  action={<CountLabel count={planToWatch.length} />}
                >
                  <TitleRail items={planToWatch} empty="Nothing planned." />
                </Section>
              ) : null}
            </>
          ) : (
            <>
              <Section
                title="Plan to Watch"
                action={
                  planToWatch.length ? (
                    <CountLabel count={planToWatch.length} />
                  ) : null
                }
              >
                <TitleRail items={planToWatch} empty="No films planned yet." />
              </Section>
            </>
          )}
        </>
      ) : null}
    </Screen>
  );
}

function UpNextHero({
  item,
  loading,
  onMarkWatched,
}: {
  item: TitleSummary;
  loading: boolean;
  onMarkWatched: () => void;
}) {
  const theme = useTheme();
  const heroUrl =
    item.type === "show"
      ? item.episodeStillUrl || item.backdropUrl || item.posterUrl
      : item.backdropUrl || item.posterUrl;
  const canMarkWatched = item.type === "movie" || Boolean(item.nextEpisodeId);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={() => router.push(`/${item.type}/${item.id}`)}
      style={({ pressed }) => ({
        borderRadius: theme.radius.md,
        overflow: "hidden",
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        opacity: pressed ? 0.82 : 1,
      })}
    >
      <View style={{ minHeight: 270 }}>
        {heroUrl ? (
          <Image
            source={{ uri: heroUrl }}
            style={{ position: "absolute", inset: 0 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: theme.colors.surfaceMuted,
            }}
          />
        )}
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor:
              theme.mode === "dark"
                ? "rgba(0,0,0,0.48)"
                : "rgba(255,255,255,0.50)",
          }}
        />
        <View
          style={{
            flex: 1,
            minHeight: 270,
            justifyContent: "flex-end",
            padding: theme.spacing.lg,
            gap: theme.spacing.sm,
          }}
        >
          {item.reasonLabel ? <ReasonBadge label={item.reasonLabel} /> : null}
          <AppText variant="title" numberOfLines={2}>
            {item.title}
          </AppText>
          {item.nextLabel ? (
            <AppText muted numberOfLines={2}>
              {item.nextLabel}
            </AppText>
          ) : null}
          <ProgressBar progress={item.progress} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <ProviderChip
                provider={item.provider}
                label={item.availabilityLabel}
                available={item.isAvailableOnSelected}
                hasAny={item.hasAnyProvider}
              />
            </View>
            <Button
              loading={loading}
              disabled={!canMarkWatched}
              onPress={(event) => {
                event.stopPropagation();
                onMarkWatched();
              }}
              icon={<Check size={16} color="#FFFFFF" />}
            >
              Watched
            </Button>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function UpNextSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      <View
        style={{
          minHeight: 270,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          overflow: "hidden",
          justifyContent: "flex-end",
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: theme.colors.surfaceMuted,
          }}
        />
        <View
          style={{
            width: 96,
            height: 26,
            borderRadius: 999,
            backgroundColor: theme.colors.accentSoft,
          }}
        />
        <View
          style={{
            width: "64%",
            height: 34,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.surface,
            opacity: theme.mode === "dark" ? 0.4 : 0.7,
          }}
        />
        <View
          style={{
            width: "82%",
            height: 18,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.surface,
            opacity: theme.mode === "dark" ? 0.3 : 0.55,
          }}
        />
        <View
          style={{
            height: 6,
            borderRadius: 999,
            backgroundColor: theme.colors.surface,
            opacity: theme.mode === "dark" ? 0.35 : 0.65,
          }}
        />
      </View>
      {[0, 1, 2].map((item) => (
        <View
          key={item}
          style={{
            flexDirection: "row",
            gap: theme.spacing.md,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
          }}
        >
          <View
            style={{
              width: 58,
              height: 82,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.surfaceMuted,
            }}
          />
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              gap: theme.spacing.sm,
            }}
          >
            <View
              style={{
                width: "42%",
                height: 14,
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            />
            <View
              style={{
                width: "72%",
                height: 18,
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            />
            <View
              style={{
                width: "86%",
                height: 28,
                borderRadius: 999,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function UpNextRow({ item }: { item: TitleSummary }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={() => router.push(`/${item.type}/${item.id}`)}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <PosterImage item={item} width={58} height={82} />
      <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
        {item.reasonLabel ? (
          <AppText
            variant="caption"
            numberOfLines={1}
            style={{ color: theme.colors.accent, fontWeight: "700" }}
          >
            {item.reasonLabel}
          </AppText>
        ) : null}
        <AppText variant="label" numberOfLines={1}>
          {item.title}
        </AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          {item.nextLabel ?? item.runtimeLabel ?? item.year ?? "Ready"}
        </AppText>
        <ProviderChip
          compact
          provider={item.provider}
          label={item.availabilityLabel}
          available={item.isAvailableOnSelected}
          hasAny={item.hasAnyProvider}
        />
      </View>
    </Pressable>
  );
}

function ContinueWatchingSection({
  items,
  loading,
  onMarkWatched,
}: {
  items: TitleSummary[];
  loading: boolean;
  onMarkWatched: (item: TitleSummary) => void;
}) {
  const theme = useTheme();
  return (
    <Section title="Continue Watching">
      {items.length ? (
        <View style={{ gap: theme.spacing.md }}>
          {items.slice(0, 5).map((item, index) => (
            <View
              key={`${item.type}-${item.id}-${index}`}
              style={{
                flexDirection: "row",
                gap: theme.spacing.md,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.md,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title}`}
                onPress={() => router.push(`/${item.type}/${item.id}`)}
              >
                <PosterImage item={item} width={70} height={102} />
              </Pressable>
              <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.sm }}>
                <View style={{ gap: theme.spacing.xs }}>
                  <AppText variant="label" numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" muted numberOfLines={2}>
                    {item.nextLabel ?? item.progressLabel ?? "Next episode"}
                  </AppText>
                </View>
                <ProgressBar progress={item.progress} compact />
                <ProviderChip
                  compact
                  provider={item.provider}
                  label={item.availabilityLabel}
                  available={item.isAvailableOnSelected}
                  hasAny={item.hasAnyProvider}
                />
                <Button
                  loading={loading}
                  disabled={!item.nextEpisodeId}
                  onPress={() => onMarkWatched(item)}
                  icon={<Check size={16} color="#FFFFFF" />}
                >
                  Mark Watched
                </Button>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState title="No active progress" />
      )}
    </Section>
  );
}

function RecentActivityRail({ items }: { items: TitleSummary[] }) {
  const theme = useTheme();
  return (
    <Section title="Recent Activity">
      {items.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.md,
              paddingRight: theme.spacing.lg,
            }}
          >
            {items.slice(0, 10).map((item, index) => (
              <Pressable
                key={`${item.type}-${item.id}-${item.activityId ?? item.watchedAt ?? index}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title}`}
                onPress={() => router.push(`/${item.type}/${item.id}`)}
                style={{ width: 92, gap: theme.spacing.xs }}
              >
                <PosterImage item={item} width={92} height={132} />
                <AppText variant="caption" numberOfLines={1}>
                  {item.title}
                </AppText>
                {item.episodeLabel ? (
                  <AppText variant="caption" muted numberOfLines={1}>
                    {item.episodeLabel}
                  </AppText>
                ) : null}
                {item.watchedAt ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.xs,
                    }}
                  >
                    <Clock size={12} color={theme.colors.faint} />
                    <AppText variant="caption" muted numberOfLines={1}>
                      {formatTimeAgo(item.watchedAt)}
                    </AppText>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <EmptyState title="No recent activity" />
      )}
    </Section>
  );
}

function LibraryTabs({
  value,
  onChange,
  showCount,
  movieCount,
}: {
  value: LibraryTab;
  onChange: (value: LibraryTab) => void;
  showCount: number;
  movieCount: number;
}) {
  const theme = useTheme();
  const options: Array<{
    value: LibraryTab;
    label: string;
    count: number;
    icon: React.ReactNode;
  }> = [
    {
      value: "shows",
      label: "TV Shows",
      count: showCount,
      icon: (
        <Tv
          size={15}
          color={value === "shows" ? theme.colors.accent : theme.colors.muted}
        />
      ),
    },
    {
      value: "movies",
      label: "Movies",
      count: movieCount,
      icon: (
        <Film
          size={15}
          color={value === "movies" ? theme.colors.accent : theme.colors.muted}
        />
      ),
    },
  ];

  return (
    <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => ({
              minHeight: 36,
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.xs,
              borderBottomWidth: 2,
              borderBottomColor: active ? theme.colors.accent : "transparent",
              opacity: pressed ? 0.72 : 1,
            })}
          >
            {option.icon}
            <AppText
              variant="label"
              style={{
                color: active ? theme.colors.accent : theme.colors.muted,
              }}
            >
              {option.label}
            </AppText>
            <CountLabel count={option.count} />
          </Pressable>
        );
      })}
    </View>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        padding: 3,
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 34,
              borderRadius: theme.radius.sm - 2,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: theme.spacing.xs,
              backgroundColor: active ? theme.colors.accent : "transparent",
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <AppText
              variant="caption"
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: active ? "#FFFFFF" : theme.colors.muted,
                fontWeight: "700",
              }}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function PosterImage({
  item,
  width,
  height,
}: {
  item: TitleSummary;
  width: number;
  height: number;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        width,
        height,
        borderRadius: theme.radius.sm,
        overflow: "hidden",
        backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      {item.posterUrl ? (
        <Image
          source={{ uri: item.posterUrl }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PlayCircle size={18} color={theme.colors.faint} />
        </View>
      )}
    </View>
  );
}

function ProgressBar({
  progress,
  compact = false,
}: {
  progress?: TitleSummary["progress"];
  compact?: boolean;
}) {
  const theme = useTheme();
  if (!progress || progress.total <= 0) return null;
  const width =
    `${Math.min(100, (progress.watched / progress.total) * 100)}%` as const;
  return (
    <View style={{ gap: compact ? 0 : theme.spacing.xs }}>
      {!compact ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: theme.spacing.sm,
          }}
        >
          <AppText variant="caption" muted>
            Progress
          </AppText>
          <AppText variant="caption" muted>
            {progress.watched}/{progress.total}
          </AppText>
        </View>
      ) : null}
      <View
        style={{
          height: compact ? 4 : 6,
          borderRadius: 999,
          overflow: "hidden",
          backgroundColor: theme.colors.surfaceMuted,
        }}
      >
        <View
          style={{
            height: "100%",
            width,
            borderRadius: 999,
            backgroundColor: theme.colors.accent,
          }}
        />
      </View>
    </View>
  );
}

function ReasonBadge({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 999,
        backgroundColor: theme.colors.accent,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 5,
      }}
    >
      <AppText
        variant="caption"
        style={{ color: "#FFFFFF", fontWeight: "700" }}
      >
        {label}
      </AppText>
    </View>
  );
}

function CountLabel({ count }: { count: number }) {
  const theme = useTheme();
  return (
    <View
      style={{
        minWidth: 22,
        borderRadius: 999,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: theme.colors.surfaceMuted,
        alignItems: "center",
      }}
    >
      <AppText variant="caption" muted style={{ fontSize: 11, lineHeight: 14 }}>
        {count}
      </AppText>
    </View>
  );
}

function formatTimeAgo(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
