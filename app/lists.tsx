import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Screen } from "@/components/primitives/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { useListsQuery } from "@/features/lists/queries";
import { useTheme } from "@/lib/theme";

export default function ListsScreen() {
  const theme = useTheme();
  const lists = useListsQuery();
  const items = lists.data?.lists ?? [];
  return (
    <Screen title="Lists" subtitle="Ranked collections and notes.">
      {lists.isLoading ? <LoadingState label="Loading lists" /> : null}
      {lists.isError ? <ErrorState message={lists.error.message} onRetry={() => void lists.refetch()} /> : null}
      {!lists.isLoading && !items.length ? <EmptyState title="No lists yet" /> : null}
      <View style={{ gap: theme.spacing.md }}>
        {items.map((list) => (
          <Pressable
            key={list.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${list.title}`}
            onPress={() => router.push(`/list/${list.id}`)}
            style={({ pressed }) => ({
              borderRadius: theme.radius.sm,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: theme.spacing.lg,
              backgroundColor: theme.colors.surface,
              opacity: pressed ? 0.72 : 1,
              gap: theme.spacing.xs,
            })}
          >
            <AppText variant="label">{list.title}</AppText>
            <AppText muted>{list.description || `${list.count ?? 0} titles`}</AppText>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
