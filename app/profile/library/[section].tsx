import { useCallback, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Film, Heart, PlayCircle, Tv } from "lucide-react-native";
import { Screen } from "@/components/primitives/Screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import {
  isProfileLibrarySection,
  profileLibrarySectionCopy,
  selectProfileLibraryItems,
} from "@/features/profile/library-sections";
import { useProfileLibraryQuery } from "@/features/profile/queries";
import { useTheme } from "@/lib/theme";
import type { TitleSummary } from "@/types/domain";

const PAGE_SIZE = 18;
const sectionIcons = {
  favorites: Heart,
  shows: Tv,
  movies: Film,
};

export default function ProfileLibrarySectionScreen() {
  const theme = useTheme();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const library = useProfileLibraryQuery();
  const selectedSection = isProfileLibrarySection(section) ? section : null;
  const copy = selectedSection
    ? profileLibrarySectionCopy[selectedSection]
    : null;
  const HeaderIcon = copy ? sectionIcons[copy.icon] : null;
  const [pager, setPager] = useState({
    key: "",
    visibleCount: PAGE_SIZE,
    loadingMore: false,
  });

  const items = useMemo(() => {
    if (!selectedSection) return [];
    return selectProfileLibraryItems(selectedSection, library.data);
  }, [library.data, selectedSection]);

  const pagerKey = `${selectedSection ?? "none"}-${items
    .map((item) => `${item.type}:${item.id}`)
    .join("|")}`;
  const visibleCount = pager.key === pagerKey ? pager.visibleCount : PAGE_SIZE;
  const loadingMore = pager.key === pagerKey && pager.loadingMore;
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setPager({
      key: pagerKey,
      visibleCount,
      loadingMore: true,
    });
    requestAnimationFrame(() => {
      setPager({
        key: pagerKey,
        visibleCount: Math.min(visibleCount + PAGE_SIZE, items.length),
        loadingMore: false,
      });
    });
  }, [hasMore, items.length, loadingMore, pagerKey, visibleCount]);

  return (
    <Screen
      back
      scroll={false}
      title={copy?.title ?? "Profile Library"}
      subtitle={copy?.subtitle}
      contentStyle={{ flex: 1 }}
    >
      {!selectedSection ? (
        <EmptyState
          title="Library section unavailable"
          body="Return to profile and choose a valid section."
        />
      ) : null}
      {library.isLoading ? (
        <LoadingState label="Loading profile library" />
      ) : null}
      {library.isError ? (
        <ErrorState
          message={library.error.message}
          onRetry={() => void library.refetch()}
        />
      ) : null}
      {selectedSection && !library.isLoading && !library.isError ? (
        <FlashList
          data={visibleItems}
          numColumns={2}
          keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
          renderItem={({ item }) => <LibraryTitleCard item={item} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.55}
          ListHeaderComponent={
            items.length ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.sm,
                  paddingBottom: theme.spacing.md,
                }}
              >
                {HeaderIcon ? (
                  <HeaderIcon size={18} color={theme.colors.accent} />
                ) : null}
                <AppText variant="caption" muted>
                  Showing {visibleItems.length} of {items.length}
                </AppText>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState title={copy?.empty ?? "Nothing here"} />
          }
          ListFooterComponent={
            loadingMore ? (
              <View
                style={{
                  paddingVertical: theme.spacing.xl,
                  alignItems: "center",
                }}
              >
                <ActivityIndicator color={theme.colors.accent} />
              </View>
            ) : (
              <View style={{ height: theme.spacing.xl }} />
            )
          }
          contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
        />
      ) : null}
    </Screen>
  );
}

function LibraryTitleCard({ item }: { item: TitleSummary }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={() => router.push(`/${item.type}/${item.id}`)}
      style={({ pressed }) => ({
        flex: 1,
        margin: theme.spacing.xs,
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
              alignItems: "center",
              justifyContent: "center",
              padding: theme.spacing.md,
            }}
          >
            <PlayCircle size={22} color={theme.colors.faint} />
          </View>
        )}
      </View>
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
    </Pressable>
  );
}
