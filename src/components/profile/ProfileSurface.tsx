import { router } from "expo-router";
import { useState } from "react";
import {
  BookMarked,
  ChevronRight,
  Clock,
  Film,
  Heart,
  MessageSquare,
  Tv,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { Button } from "@/components/primitives/Button";
import { EmptyState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { ActivityCalendar } from "./ActivityCalendar";
import { ProfilePins } from "./ProfilePins";
import { SpoilerCard } from "@/components/reviews/SpoilerCard";
import { shouldHideSpoilerText } from "@/components/reviews/spoiler-display";
import {
  type ProfileLibrarySection,
  profileLibrarySectionCopy,
  selectProfileLibraryItems,
} from "@/features/profile/library-sections";
import { profileStatsForSummary } from "@/features/profile/profile-summary";
import { formatStarsFromBackend } from "@/features/reviews/rating";
import { initials } from "@/lib/format";
import { useTheme } from "@/lib/theme";
import type {
  CustomListSummary,
  ProfilePayload,
  ReviewSummary,
  TitleSummary,
  WatchlistPayload,
} from "@/types/domain";

export type ProfileTab = "overview" | "history" | "reviews" | "lists";

const tabs: Array<{ value: ProfileTab; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "history", label: "History" },
  { value: "reviews", label: "Reviews" },
  { value: "lists", label: "Lists" },
];

export function ProfileHero({
  profile,
  action,
  showUsername = true,
}: {
  profile: ProfilePayload;
  action?: React.ReactNode;
  showUsername?: boolean;
}) {
  const theme = useTheme();
  const user = profile.user;
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: theme.colors.accent,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <AppText variant="heading" style={{ color: "#FFFFFF" }}>
              {initials(user?.name || user?.username)}
            </AppText>
          )}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="heading" numberOfLines={1}>
            {user?.name || user?.username || "Watchlog"}
          </AppText>
          {showUsername ? (
            <AppText muted numberOfLines={1}>
              {user?.username ? `@${user.username}` : "Watchlog profile"}
            </AppText>
          ) : null}
          {user?.bio ? (
            <AppText muted numberOfLines={3}>
              {user.bio}
            </AppText>
          ) : null}
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing.sm,
        }}
      >
        <ProfileMetric
          label="Followers"
          value={user?.followerCount ?? profile.stats?.Followers ?? 0}
        />
        <ProfileMetric
          label="Following"
          value={user?.followingCount ?? profile.stats?.Following ?? 0}
        />
        {profile.isSelf ? (
          <ProfileMetric label="Visibility" value="Your profile" />
        ) : null}
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

function ProfileMetric({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.surfaceMuted,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: 2,
      }}
    >
      <AppText variant="label">{String(value ?? 0)}</AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

export function ProfileStats({ profile }: { profile: ProfilePayload }) {
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const iconByLabel = {
    "Watch time": Clock,
    Movies: Film,
    Shows: BookMarked,
    Reviews: MessageSquare,
  };
  const items = profileStatsForSummary(profile);
  const gap = theme.spacing.md;
  const cardWidth =
    containerWidth > 0 ? Math.max(154, (containerWidth - gap) / 2) : 168;
  return (
    <View
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        setContainerWidth((current) =>
          Math.abs(current - nextWidth) > 1 ? nextWidth : current,
        );
      }}
      style={{
        marginRight: -theme.spacing.lg,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + gap}
        snapToAlignment="start"
      >
        <View
          style={{
            flexDirection: "row",
            gap,
            paddingRight: theme.spacing.lg,
          }}
        >
          {items.map((item) => {
            const Icon = iconByLabel[item.label];
            return (
              <View
                key={item.label}
                accessibilityLabel={item.accessibilityLabel}
                style={{
                  width: cardWidth,
                  minHeight: 108,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.lg,
                  gap: theme.spacing.md,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.colors.surfaceMuted,
                  }}
                >
                  <Icon size={17} color={theme.colors.accent} />
                </View>
                <View style={{ gap: 2 }}>
                  <AppText
                    variant="heading"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.78}
                  >
                    {item.displayValue}
                  </AppText>
                  <AppText variant="caption" muted numberOfLines={1}>
                    {item.label}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export function ProfileTabs({
  value,
  onChange,
}: {
  value: ProfileTab;
  onChange: (value: ProfileTab) => void;
}) {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={value === tab.value ? "secondary" : "ghost"}
            onPress={() => onChange(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </View>
    </ScrollView>
  );
}

export function ProfileOverview({
  profile,
  library,
  libraryLoading,
}: {
  profile: ProfilePayload;
  library?: WatchlistPayload;
  libraryLoading?: boolean;
}) {
  const theme = useTheme();
  const favorites = selectProfileLibraryItems("favorites", library);
  const completedShows = selectProfileLibraryItems("completed-shows", library);
  const watchedMovies = selectProfileLibraryItems("watched-movies", library);
  return (
    <View style={{ gap: theme.spacing.xl }}>
      <ActivityCalendar days={profile.calendar} />
      <ProfilePins pins={profile.pinned} />
      {libraryLoading ? <ProfileLibraryLoading /> : null}
      {!libraryLoading && library ? (
        <ProfileLibrarySections
          favorites={favorites}
          completedShows={completedShows}
          watchedMovies={watchedMovies}
        />
      ) : null}
      <GenreChips stats={profile.stats} />
    </View>
  );
}

export function ProfileLibrarySections({
  favorites,
  completedShows,
  watchedMovies,
}: {
  favorites: TitleSummary[];
  completedShows: TitleSummary[];
  watchedMovies: TitleSummary[];
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xl }}>
      <ProfileTitlePreviewSection
        title={profileLibrarySectionCopy.favorites.title}
        icon={profileLibrarySectionCopy.favorites.icon}
        items={favorites}
        empty={profileLibrarySectionCopy.favorites.empty}
        section="favorites"
      />
      <ProfileTitlePreviewSection
        title={profileLibrarySectionCopy["completed-shows"].title}
        icon={profileLibrarySectionCopy["completed-shows"].icon}
        items={completedShows}
        empty={profileLibrarySectionCopy["completed-shows"].empty}
        section="completed-shows"
      />
      <ProfileTitlePreviewSection
        title={profileLibrarySectionCopy["watched-movies"].title}
        icon={profileLibrarySectionCopy["watched-movies"].icon}
        items={watchedMovies}
        empty={profileLibrarySectionCopy["watched-movies"].empty}
        section="watched-movies"
      />
    </View>
  );
}

function ProfileLibraryLoading() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      {[0, 1].map((section) => (
        <View key={section} style={{ gap: theme.spacing.md }}>
          <View
            style={{
              width: 150,
              height: 24,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.surfaceMuted,
            }}
          />
          <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
            {[0, 1].map((item) => (
              <View
                key={item}
                style={{
                  flex: 1,
                  aspectRatio: 2 / 3,
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.surfaceMuted,
                }}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function ProfileTitlePreviewSection({
  title,
  icon,
  items,
  empty,
  section,
}: {
  title: string;
  icon: "favorites" | "shows" | "movies";
  items: TitleSummary[];
  empty: string;
  section: ProfileLibrarySection;
}) {
  const theme = useTheme();
  const Icon = icon === "favorites" ? Heart : icon === "shows" ? Tv : Film;
  return (
    <View style={{ gap: theme.spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            flex: 1,
            minWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
          }}
        >
          <Icon size={18} color={theme.colors.accent} />
          <AppText variant="heading" numberOfLines={1}>
            {title}
          </AppText>
        </View>
        {items.length ? (
          <Button
            variant="ghost"
            icon={<ChevronRight size={16} color={theme.colors.text} />}
            onPress={() => router.push(`/profile/library/${section}`)}
          >
            View all
          </Button>
        ) : null}
      </View>
      {items.length ? (
        <ProfileTitleSlider items={items.slice(0, 10)} />
      ) : (
        <EmptyState title={empty} />
      )}
    </View>
  );
}

function ProfileTitleSlider({ items }: { items: TitleSummary[] }) {
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const gap = theme.spacing.md;
  const cardWidth =
    containerWidth > 0 ? Math.max(132, (containerWidth - gap) / 2) : 156;

  return (
    <View
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        setContainerWidth((current) =>
          Math.abs(current - nextWidth) > 1 ? nextWidth : current,
        );
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + gap}
        snapToAlignment="start"
      >
        <View
          style={{
            flexDirection: "row",
            gap,
            paddingRight: theme.spacing.lg,
          }}
        >
          {items.map((item, index) => (
            <ProfileTitleCard
              key={`${item.type}-${item.id}-${index}`}
              item={item}
              width={cardWidth}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function ProfileTitleGrid({ items }: { items: TitleSummary[] }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.spacing.md,
      }}
    >
      {items.map((item, index) => (
        <ProfileTitleCard
          key={`${item.type}-${item.id}-${index}`}
          item={item}
        />
      ))}
    </View>
  );
}

export function ProfileTitleCard({
  item,
  width,
}: {
  item: TitleSummary;
  width?: number;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={() => router.push(`/${item.type}/${item.id}`)}
      style={({ pressed }) => ({
        width: width ?? "47.8%",
        minWidth: width ?? 132,
        flexGrow: width ? 0 : 1,
        opacity: pressed ? 0.72 : 1,
        gap: theme.spacing.sm,
      })}
    >
      <View
        style={{
          aspectRatio: 2 / 3,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.surfaceMuted,
          overflow: "hidden",
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
              justifyContent: "flex-end",
              padding: theme.spacing.md,
            }}
          >
            <AppText variant="label">{item.title}</AppText>
          </View>
        )}
      </View>
      <View style={{ gap: 2 }}>
        <AppText variant="label" numberOfLines={1}>
          {item.title}
        </AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          {item.progressLabel ||
            item.runtimeLabel ||
            item.year ||
            item.status ||
            "Watchlog"}
        </AppText>
      </View>
    </Pressable>
  );
}

export function ProfileListGrid({
  lists,
  compact = false,
}: {
  lists?: CustomListSummary[];
  compact?: boolean;
}) {
  const theme = useTheme();
  if (!lists?.length) return <EmptyState title="No visible lists" />;
  return (
    <View style={{ gap: theme.spacing.md }}>
      {lists.map((list, index) => (
        <Pressable
          key={`${list.id}-${index}`}
          accessibilityRole="button"
          accessibilityLabel={`Open ${list.title}`}
          onPress={() => router.push(`/list/${list.id}`)}
          style={({ pressed }) => ({
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            padding: compact ? theme.spacing.md : theme.spacing.lg,
            gap: theme.spacing.sm,
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            {(list.covers ?? []).slice(0, 3).map((cover, index) => (
              <Image
                key={`${cover}-${index}`}
                source={{ uri: cover }}
                style={{
                  width: 34,
                  height: 48,
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.surfaceMuted,
                  marginLeft: index ? -14 : 0,
                }}
                contentFit="cover"
              />
            ))}
          </View>
          <AppText variant="label" numberOfLines={1}>
            {list.title}
          </AppText>
          {list.description ? (
            <AppText variant="caption" muted numberOfLines={compact ? 1 : 2}>
              {list.description}
            </AppText>
          ) : null}
          <AppText variant="caption" muted>
            {list.visibility?.toLowerCase() ?? "private"} · {list.count ?? 0}{" "}
            titles
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

export function ProfileLogList({
  logs,
  empty,
}: {
  logs?: ReviewSummary[];
  empty: string;
}) {
  const theme = useTheme();
  const [revealedLogs, setRevealedLogs] = useState<Set<string>>(
    () => new Set(),
  );
  if (!logs?.length) return <EmptyState title={empty} />;
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {logs.map((log, index) => {
        const hidden = shouldHideSpoilerText({
          spoiler: log.spoiler,
          revealed: revealedLogs.has(log.id),
        });
        const ratingLabel = formatStarsFromBackend(log.rating);

        return (
          <View
            key={`${log.id}-${log.createdAt ?? log.watchedAt ?? index}`}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.md,
              gap: theme.spacing.sm,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${log.title ?? "review"}`}
              onPress={() => router.push(`/log/${log.id}`)}
              style={({ pressed }) => ({
                flexDirection: "row",
                gap: theme.spacing.md,
                opacity: pressed ? 0.72 : 1,
              })}
            >
              {log.posterUrl ? (
                <Image
                  source={{ uri: log.posterUrl }}
                  style={{
                    width: 44,
                    height: 64,
                    borderRadius: theme.radius.sm,
                  }}
                  contentFit="cover"
                />
              ) : null}
              <View style={{ flex: 1, gap: 3 }}>
                <AppText variant="label" numberOfLines={1}>
                  {log.subtitle || log.title || "Untitled"}
                </AppText>
                <AppText variant="caption" muted numberOfLines={1}>
                  {formatDateText(log.watchedAt ?? log.createdAt)}
                  {ratingLabel ? ` · ${ratingLabel}` : ""}
                </AppText>
                {log.body && !hidden ? (
                  <AppText muted numberOfLines={2}>
                    {log.body}
                  </AppText>
                ) : null}
              </View>
            </Pressable>
            {log.body && hidden ? (
              <SpoilerCard
                kind="review"
                onReveal={() =>
                  setRevealedLogs((current) => {
                    const next = new Set(current);
                    next.add(log.id);
                    return next;
                  })
                }
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function GenreChips({ stats }: { stats?: ProfilePayload["stats"] }) {
  const theme = useTheme();
  const raw = stats?.["Top genres"];
  const genres =
    typeof raw === "string"
      ? Array.from(
          new Set(
            raw
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
          ),
        )
      : [];
  if (!genres.length) {
    return (
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="heading">Top genres</AppText>
        <AppText muted>Genres will build up as you track titles.</AppText>
      </View>
    );
  }
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <AppText variant="heading">Top genres</AppText>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing.sm,
        }}
      >
        {genres.map((genre, index) => (
          <View
            key={`${genre}-${index}`}
            style={{
              borderRadius: 999,
              backgroundColor: theme.colors.surfaceMuted,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xs,
            }}
          >
            <AppText variant="caption">{genre}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatDateText(value?: string | null) {
  if (!value) return "Watchlog";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
