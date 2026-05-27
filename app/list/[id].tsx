import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Screen } from "@/components/primitives/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { toDisplayListItems } from "@/features/lists/list-display";
import { useListQuery } from "@/features/lists/queries";
import { useTheme } from "@/lib/theme";

export default function ListDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = useListQuery(id);
  const items = toDisplayListItems(list.data?.items ?? []);
  return (
    <Screen title={list.data?.title || "List"} subtitle={list.data?.description || undefined}>
      {list.isLoading ? <LoadingState label="Loading list" /> : null}
      {list.isError ? <ErrorState message={list.error.message} onRetry={() => void list.refetch()} /> : null}
      {!list.isLoading && !items.length ? <EmptyState title="No list items" /> : null}
      <View style={{ gap: theme.spacing.md }}>
        {items.map((item) => (
          <View key={item.id} style={{ flexDirection: "row", gap: theme.spacing.md, alignItems: "center" }}>
            <AppText variant="heading" muted>
              {item.displayPosition}
            </AppText>
            <View style={{ flex: 1 }}>
              <AppText variant="label">{item.title}</AppText>
              {item.note ? <AppText muted>{item.note}</AppText> : null}
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}
