import { router } from "expo-router";
import {
  BookMarked,
  Clock,
  List,
  MessageSquare,
  Users,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { Button } from "@/components/primitives/Button";
import { EmptyState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { ActivityCalendar } from "./ActivityCalendar";
import { ProfilePins } from "./ProfilePins";
import { initials } from "@/lib/format";
import { useTheme } from "@/lib/theme";
import type {
  CustomListSummary,
  ProfilePayload,
  ReviewSummary,
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
}: {
  profile: ProfilePayload;
  action?: React.ReactNode;
}) {
  const theme = useTheme();
  const user = profile.user;
  return (
    <View style={{ gap: theme.spacing.lg }}>
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
          <AppText muted numberOfLines={1}>
            {user?.username ? `@${user.username}` : "Watchlog profile"}
            {profile.stats?.Followers
              ? ` · ${profile.stats.Followers} followers`
              : ""}
          </AppText>
          {user?.bio ? (
            <AppText muted numberOfLines={3}>
              {user.bio}
            </AppText>
          ) : null}
        </View>
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

export function ProfileStats({ profile }: { profile: ProfilePayload }) {
  const theme = useTheme();
  const stats = profile.stats ?? {};
  const items = [
    {
      label: "Shows",
      value: stats["Shows tracked"] ?? stats["Visible Log Count"] ?? 0,
      icon: BookMarked,
    },
    {
      label: "Reviews",
      value: stats.Reviews ?? stats["Visible Review Count"] ?? 0,
      icon: MessageSquare,
    },
    {
      label: "Lists",
      value: stats.Lists ?? stats["Visible List Count"] ?? 0,
      icon: List,
    },
    { label: "Watch time", value: stats["Watch time"] ?? "0m", icon: Clock },
    { label: "Followers", value: stats.Followers ?? 0, icon: Users },
  ];
  return (
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <View
            key={item.label}
            style={{
              width: "31.5%",
              minWidth: 104,
              flexGrow: 1,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.md,
              gap: theme.spacing.xs,
            }}
          >
            <Icon size={15} color={theme.colors.muted} />
            <AppText variant="heading" numberOfLines={1}>
              {String(item.value)}
            </AppText>
            <AppText variant="caption" muted>
              {item.label}
            </AppText>
          </View>
        );
      })}
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
  onTabChange,
  canCreateLists,
}: {
  profile: ProfilePayload;
  onTabChange: (value: ProfileTab) => void;
  canCreateLists?: boolean;
}) {
  const theme = useTheme();
  const lists = profile.lists ?? [];
  const logs = profile.logs ?? [];
  return (
    <View style={{ gap: theme.spacing.xl }}>
      <ActivityCalendar days={profile.calendar} />
      <ProfilePins pins={profile.pinned} />
      {lists.length ? (
        <View style={{ gap: theme.spacing.md }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText variant="heading">Lists</AppText>
            <Button variant="ghost" onPress={() => onTabChange("lists")}>
              View all
            </Button>
          </View>
          <ProfileListGrid lists={lists.slice(0, 3)} compact />
        </View>
      ) : canCreateLists ? (
        <View
          style={{
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.lg,
            gap: theme.spacing.sm,
          }}
        >
          <AppText variant="label">Lists</AppText>
          <AppText muted>
            Create custom collections to feature on your profile.
          </AppText>
          <Button variant="secondary" onPress={() => router.push("/lists")}>
            Create List
          </Button>
        </View>
      ) : null}
      <View style={{ gap: theme.spacing.md }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <AppText variant="heading">Recent watches</AppText>
          <Button variant="ghost" onPress={() => onTabChange("history")}>
            View history
          </Button>
        </View>
        <ProfileLogList
          logs={logs.slice(0, 8)}
          empty="Watched titles will appear here."
        />
      </View>
      <GenreChips stats={profile.stats} />
    </View>
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
      {lists.map((list) => (
        <Pressable
          key={list.id}
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
  if (!logs?.length) return <EmptyState title={empty} />;
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {logs.map((log) => (
        <Pressable
          key={log.id}
          accessibilityRole="button"
          accessibilityLabel={`Open ${log.title ?? "review"}`}
          onPress={() => router.push(`/log/${log.id}`)}
          style={({ pressed }) => ({
            flexDirection: "row",
            gap: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
            opacity: pressed ? 0.72 : 1,
          })}
        >
          {log.posterUrl ? (
            <Image
              source={{ uri: log.posterUrl }}
              style={{ width: 44, height: 64, borderRadius: theme.radius.sm }}
              contentFit="cover"
            />
          ) : null}
          <View style={{ flex: 1, gap: 3 }}>
            <AppText variant="label" numberOfLines={1}>
              {log.subtitle || log.title || "Untitled"}
            </AppText>
            <AppText variant="caption" muted numberOfLines={1}>
              {formatDateText(log.watchedAt ?? log.createdAt)}
              {log.rating ? ` · ${(log.rating / 2).toFixed(1)} / 5` : ""}
            </AppText>
            {log.body ? (
              <AppText muted numberOfLines={2}>
                {log.spoiler ? "Spoiler review" : log.body}
              </AppText>
            ) : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function GenreChips({ stats }: { stats?: ProfilePayload["stats"] }) {
  const theme = useTheme();
  const raw = stats?.["Top genres"];
  const genres =
    typeof raw === "string"
      ? raw
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
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
        {genres.map((genre) => (
          <View
            key={genre}
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
