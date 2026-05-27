import { router } from "expo-router";
import type { Href } from "expo-router";
import { View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { useFeedQuery } from "@/features/feed/queries";
import { mobileRouteFromHref } from "@/lib/api-mappers";
import { useTheme } from "@/lib/theme";

export default function FeedScreen() {
  const theme = useTheme();
  const feed = useFeedQuery();
  const items = feed.data?.items ?? [];
  return (
    <Screen
      back
      title="Feed"
      subtitle="Visible activity from people you follow."
    >
      {feed.isLoading ? <LoadingState label="Loading feed" /> : null}
      {feed.isError ? (
        <ErrorState
          message={feed.error.message}
          onRetry={() => void feed.refetch()}
        />
      ) : null}
      {!feed.isLoading && !items.length ? (
        <EmptyState title="No feed activity" />
      ) : null}
      <View style={{ gap: theme.spacing.md }}>
        {items.map((item) => {
          const route = mobileRouteFromHref(item.href);
          return (
            <View key={item.id} style={{ gap: theme.spacing.xs }}>
              <AppText>{item.text}</AppText>
              {route ? (
                <Button
                  variant="ghost"
                  onPress={() => router.push(route as Href)}
                >
                  Open
                </Button>
              ) : null}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
