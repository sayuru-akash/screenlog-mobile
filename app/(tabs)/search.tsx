import { router } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Check, ChevronRight, Lock, Plus } from "lucide-react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/primitives/StateViews";
import { TitleRow } from "@/components/content/TitleRow";
import { AppText } from "@/components/primitives/Text";
import {
  useAddToWatchlistMutation,
  useLookupTitleMutation,
  useSearchQuery,
  useUserSearchQuery,
} from "@/features/search/queries";
import { initials } from "@/lib/format";
import { useTheme } from "@/lib/theme";
import type { MediaType, UserSearchResult } from "@/types/domain";

export default function SearchScreen() {
  const theme = useTheme();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"titles" | "people">("titles");
  const [type, setType] = useState<"all" | MediaType>("all");
  const search = useSearchQuery(q, type);
  const userSearch = useUserSearchQuery(q);
  const add = useAddToWatchlistMutation();
  const lookup = useLookupTitleMutation();
  const results = search.data?.results ?? [];
  const people = userSearch.data?.results ?? [];
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const activeQuery = mode === "people" ? userSearch : search;

  return (
    <Screen
      title="Search"
      subtitle="Find titles and people."
      refreshing={activeQuery.isRefetching}
      onRefresh={() => {
        if (q.trim().length >= 2) void activeQuery.refetch();
      }}
      contentStyle={{ gap: theme.spacing.lg }}
    >
      <TextInput
        accessibilityLabel="Search"
        placeholder={mode === "people" ? "Search people" : "Search titles"}
        value={q}
        onChangeText={setQ}
        autoCapitalize="none"
        placeholderTextColor={theme.colors.faint}
        style={{
          minHeight: 48,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
          paddingHorizontal: theme.spacing.md,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
          fontSize: 16,
        }}
      />
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        {(["titles", "people"] as const).map((option) => (
          <Button
            key={option}
            variant={mode === option ? "primary" : "ghost"}
            onPress={() => setMode(option)}
          >
            {option === "titles" ? "Titles" : "People"}
          </Button>
        ))}
      </View>
      {mode === "titles" ? (
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          {(["all", "show", "movie"] as const).map((option) => (
            <Button
              key={option}
              variant={type === option ? "primary" : "ghost"}
              onPress={() => setType(option)}
            >
              {option === "all"
                ? "All"
                : option === "show"
                  ? "Shows"
                  : "Movies"}
            </Button>
          ))}
        </View>
      ) : null}
      <Button variant="secondary" onPress={() => router.push("/discover")}>
        Discover
      </Button>
      {q.trim().length < 2 ? (
        <EmptyState title="Type to search" body="Two or more characters." />
      ) : null}
      {activeQuery.isLoading ? <ListSkeleton rows={4} /> : null}
      {activeQuery.isError ? (
        <ErrorState
          message={activeQuery.error.message}
          onRetry={() => void activeQuery.refetch()}
        />
      ) : null}
      {!activeQuery.isLoading &&
      q.trim().length >= 2 &&
      (mode === "people" ? !people.length : !results.length) ? (
        <EmptyState title="No matches" />
      ) : null}
      {mode === "people" ? (
        <View style={{ gap: theme.spacing.md }}>
          {people.map((person) => (
            <UserResultRow key={person.id} person={person} />
          ))}
        </View>
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          {results.map((item, index) => {
            const key = `${item.type}-${item.id || item.tmdbId}`;
            const added = addedKeys.has(key);
            return (
              <TitleRow
                key={`${key}-${index}`}
                item={item}
                onPress={() => {
                  if (!item.tmdbId) {
                    router.push(`/${item.type}/${item.id}`);
                    return;
                  }
                  lookup.mutate(item, {
                    onSuccess: (payload) =>
                      router.push(`/${payload.type}/${payload.id}`),
                  });
                }}
                right={
                  <Button
                    variant="secondary"
                    loading={add.isPending && addingKey === key}
                    onPress={() => {
                      setAddingKey(key);
                      add.mutate(item, {
                        onSuccess: () =>
                          setAddedKeys((values) => new Set(values).add(key)),
                        onSettled: () => setAddingKey(null),
                      });
                    }}
                    icon={
                      added ? (
                        <Check size={15} color={theme.colors.accent} />
                      ) : (
                        <Plus size={15} color={theme.colors.accent} />
                      )
                    }
                  >
                    {added ? "Added" : "Add"}
                  </Button>
                }
              />
            );
          })}
        </View>
      )}
      {add.isError || lookup.isError ? (
        <AppText style={{ color: theme.colors.danger }}>
          {add.error?.message || lookup.error?.message}
        </AppText>
      ) : null}
    </Screen>
  );
}

function UserResultRow({ person }: { person: UserSearchResult }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${person.name || person.username}`}
      onPress={() => router.push(`/user/${person.username}`)}
      style={({ pressed }) => ({
        minHeight: 72,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.accent,
        }}
      >
        {person.image ? (
          <Image
            source={{ uri: person.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <AppText variant="label" style={{ color: "#FFFFFF" }}>
            {initials(person.name || person.username)}
          </AppText>
        )}
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant="label" numberOfLines={1}>
          {person.name || person.username}
        </AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          @{person.username} · {person.followerCount ?? 0}{" "}
          {(person.followerCount ?? 0) === 1 ? "follower" : "followers"}
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {person.canViewProfile ? null : (
            <Lock size={12} color={theme.colors.faint} />
          )}
          <AppText variant="caption" muted numberOfLines={1}>
            {person.canViewProfile
              ? person.bio || (person.following ? "Following" : "View profile")
              : "Private profile"}
          </AppText>
        </View>
      </View>
      <ChevronRight size={18} color={theme.colors.faint} />
    </Pressable>
  );
}
