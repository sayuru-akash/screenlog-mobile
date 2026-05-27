import { View } from "react-native";
import { Screen } from "@/components/primitives/Screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { useFeedQuery } from "@/features/feed/queries";
import { useTheme } from "@/lib/theme";

export default function FeedScreen() {
  const theme = useTheme();
  const feed = useFeedQuery();
  const items = feed.data?.items ?? [];
  return (
    <Screen title="Feed" subtitle="Visible activity from people you follow.">
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
        {items.map((item) => (
          <AppText key={item.id}>{item.text}</AppText>
        ))}
      </View>
    </Screen>
  );
}
