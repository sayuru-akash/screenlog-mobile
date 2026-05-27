import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Modal, TextInput, View } from "react-native";
import { Pin, X } from "lucide-react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { EmptyState, ErrorState, IconButton, LoadingState } from "@/components/primitives/StateViews";
import { TitleRow } from "@/components/content/TitleRow";
import { AppText } from "@/components/primitives/Text";
import { toDisplayListItems } from "@/features/lists/list-display";
import { useAddListItemMutation, useListQuery } from "@/features/lists/queries";
import { useSearchQuery } from "@/features/search/queries";
import { useSetProfilePinMutation } from "@/features/profile/queries";
import { useTheme } from "@/lib/theme";

export default function ListDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = useListQuery(id);
  const addItem = useAddListItemMutation(id);
  const setPin = useSetProfilePinMutation();
  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState("");
  const search = useSearchQuery(q, "all");
  const items = toDisplayListItems(list.data?.items ?? []);
  return (
    <Screen
      title={list.data?.title || "List"}
      subtitle={list.data?.description || undefined}
      right={
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <IconButton label="Pin list" onPress={() => setPin.mutate({ type: "LIST", listId: id, rank: 0 })}>
            <Pin size={18} color={theme.colors.text} />
          </IconButton>
          <Button variant="secondary" onPress={() => setAddOpen(true)}>
            Add
          </Button>
        </View>
      }
    >
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
      <Modal visible={addOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddOpen(false)}>
        <Screen
          title="Add title"
          subtitle="Search shows and movies."
          right={
            <IconButton label="Close" onPress={() => setAddOpen(false)}>
              <X size={18} color={theme.colors.text} />
            </IconButton>
          }
        >
          <TextInput
            accessibilityLabel="Search list items"
            placeholder="Search titles"
            value={q}
            onChangeText={setQ}
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
          {q.trim().length < 2 ? <EmptyState title="Type to search" /> : null}
          {search.isLoading ? <LoadingState label="Searching" /> : null}
          {search.isError ? <ErrorState message={search.error.message} onRetry={() => void search.refetch()} /> : null}
          {addItem.isError ? <ErrorState message={addItem.error.message} /> : null}
          <View style={{ gap: theme.spacing.md }}>
            {search.data?.results?.map((item) => (
              <TitleRow
                key={`${item.type}-${item.id || item.tmdbId}`}
                item={item}
                right={
                  <Button
                    variant="secondary"
                    loading={addItem.isPending}
                    onPress={() =>
                      addItem.mutate(item, {
                        onSuccess: () => {
                          setAddOpen(false);
                          setQ("");
                        },
                      })
                    }
                  >
                    Add
                  </Button>
                }
              />
            ))}
          </View>
        </Screen>
      </Modal>
    </Screen>
  );
}
