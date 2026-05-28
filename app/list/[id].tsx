import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, Modal, Pressable, Switch, TextInput, View } from "react-native";
import { Pencil, Pin, Trash2, X } from "lucide-react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import {
  EmptyState,
  ErrorState,
  IconButton,
  ListSkeleton,
} from "@/components/primitives/StateViews";
import { TitleRow } from "@/components/content/TitleRow";
import { AppText } from "@/components/primitives/Text";
import {
  routeForListItem,
  toDisplayListItems,
} from "@/features/lists/list-display";
import {
  useAddListItemMutation,
  useDeleteListMutation,
  useListQuery,
  useRemoveListItemMutation,
  useUpdateListMutation,
} from "@/features/lists/queries";
import { useSearchQuery } from "@/features/search/queries";
import { useSetProfilePinMutation } from "@/features/profile/queries";
import { pinConfirmationCopy } from "@/features/content/action-confirmations";
import { useTheme } from "@/lib/theme";
import type { Visibility } from "@/types/domain";

export default function ListDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = useListQuery(id);
  const addItem = useAddListItemMutation(id);
  const removeItem = useRemoveListItemMutation(id);
  const updateList = useUpdateListMutation(id);
  const deleteList = useDeleteListMutation(id);
  const setPin = useSetProfilePinMutation();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [ranked, setRanked] = useState(true);
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const search = useSearchQuery(q, "all");
  const items = toDisplayListItems(list.data?.items ?? []);
  const canEdit = Boolean(list.data?.canEdit);
  const ownerUsername = list.data?.user?.username;
  const hasSearchResult = (result: {
    type: string;
    tmdbId?: number;
    title: string;
  }) =>
    items.some((item) => {
      if (item.type !== result.type) return false;
      if (item.tmdbId && result.tmdbId) return item.tmdbId === result.tmdbId;
      return item.title.toLowerCase() === result.title.toLowerCase();
    });
  const openEdit = () => {
    setTitle(list.data?.title ?? "");
    setDescription(list.data?.description ?? "");
    setTags((list.data?.tags ?? []).join(", "));
    setRanked(Boolean(list.data?.ranked));
    setVisibility(list.data?.visibility ?? "PUBLIC");
    setEditOpen(true);
  };
  const confirmDeleteList = () => {
    Alert.alert("Delete list?", "This removes the list and its items.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteList.mutate(undefined, {
            onSuccess: () => router.replace("/lists"),
          }),
      },
    ]);
  };
  const confirmPinList = () => {
    const copy = pinConfirmationCopy({
      title: list.data?.title ?? "This list",
      type: "list",
    });
    Alert.alert(copy.title, copy.message, [
      { text: "Cancel", style: "cancel" },
      {
        text: copy.confirmLabel,
        onPress: () => setPin.mutate({ type: "LIST", listId: id, rank: 0 }),
      },
    ]);
  };
  return (
    <Screen
      back
      title={list.data?.title || "List"}
      subtitle={list.data?.description || undefined}
      right={
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <IconButton label="Pin list" onPress={confirmPinList}>
            <Pin size={18} color={theme.colors.text} />
          </IconButton>
          {canEdit ? (
            <>
              <IconButton label="Edit list" onPress={openEdit}>
                <Pencil size={18} color={theme.colors.text} />
              </IconButton>
              <Button variant="secondary" onPress={() => setAddOpen(true)}>
                Add
              </Button>
            </>
          ) : null}
        </View>
      }
      refreshing={list.isRefetching}
      onRefresh={() => void list.refetch()}
    >
      {list.isLoading ? <ListSkeleton rows={5} /> : null}
      {list.isError ? (
        <ErrorState
          message={list.error.message}
          onRetry={() => void list.refetch()}
        />
      ) : null}
      {list.data ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
            <CoverStack covers={list.data.covers} title={list.data.title} />
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <AppText variant="heading" numberOfLines={2}>
                {list.data.title}
              </AppText>
              {ownerUsername ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open @${ownerUsername}`}
                  onPress={() => router.push(`/user/${ownerUsername}`)}
                >
                  <AppText muted numberOfLines={1}>
                    by @{ownerUsername}
                  </AppText>
                </Pressable>
              ) : null}
              {list.data.description ? (
                <AppText muted numberOfLines={3}>
                  {list.data.description}
                </AppText>
              ) : null}
            </View>
          </View>
          <AppText variant="caption" muted>
            {list.data.visibility?.toLowerCase() ?? "private"} · {items.length}{" "}
            titles
            {list.data.ranked ? " · ranked" : ""}
          </AppText>
          {list.data.tags?.length ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: theme.spacing.sm,
              }}
            >
              {list.data.tags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    borderRadius: 999,
                    backgroundColor: theme.colors.surfaceMuted,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.xs,
                  }}
                >
                  <AppText variant="caption">{tag}</AppText>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      {!list.isLoading && !items.length ? (
        <EmptyState title="No list items" />
      ) : null}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing.md,
        }}
      >
        {items.map((item, index) => {
          const route = routeForListItem(item);
          return (
            <View
              key={`${item.id}-${item.type}-${item.movieId ?? item.showId ?? "missing"}-${item.rank ?? index}`}
              style={{ width: "47%", flexGrow: 1, maxWidth: 190 }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title}`}
                accessibilityState={{ disabled: !route }}
                disabled={!route}
                onPress={() => {
                  if (route) router.push(route);
                }}
                style={({ pressed }) => ({
                  gap: theme.spacing.sm,
                  opacity: pressed ? 0.72 : route ? 1 : 0.58,
                })}
              >
                <View
                  style={{
                    aspectRatio: 2 / 3,
                    borderRadius: theme.radius.md,
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
                <View
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.sm,
                    alignItems: "flex-start",
                  }}
                >
                  {list.data?.ranked ? (
                    <View
                      style={{
                        borderRadius: theme.radius.sm,
                        backgroundColor: theme.colors.surfaceMuted,
                        paddingHorizontal: theme.spacing.sm,
                        paddingVertical: 2,
                      }}
                    >
                      <AppText variant="caption" muted>
                        {item.displayPosition}
                      </AppText>
                    </View>
                  ) : null}
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" numberOfLines={2}>
                      {item.title}
                    </AppText>
                    {item.note ? (
                      <AppText variant="caption" muted numberOfLines={2}>
                        {item.note}
                      </AppText>
                    ) : null}
                    {item.year ? (
                      <AppText variant="caption" muted numberOfLines={1}>
                        {item.year}
                      </AppText>
                    ) : null}
                  </View>
                </View>
              </Pressable>
              {canEdit ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.title}`}
                  onPress={() =>
                    Alert.alert(
                      "Remove title?",
                      `${item.title} will be removed from this list.`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Remove",
                          style: "destructive",
                          onPress: () => removeItem.mutate(item),
                        },
                      ],
                    )
                  }
                  style={({ pressed }) => ({
                    marginTop: theme.spacing.sm,
                    minHeight: 36,
                    borderRadius: theme.radius.sm,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.72 : 1,
                  })}
                >
                  <Trash2 size={16} color={theme.colors.danger} />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
      {removeItem.isError || updateList.isError || deleteList.isError ? (
        <ErrorState
          message={
            removeItem.error?.message ||
            updateList.error?.message ||
            deleteList.error?.message
          }
        />
      ) : null}
      <Modal
        visible={editOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditOpen(false)}
      >
        <Screen
          title="Edit list"
          subtitle={list.data?.title ?? undefined}
          right={
            <IconButton label="Close edit" onPress={() => setEditOpen(false)}>
              <X size={18} color={theme.colors.text} />
            </IconButton>
          }
        >
          <Input label="Title" value={title} onChangeText={setTitle} />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Input
            label="Tags"
            value={tags}
            onChangeText={setTags}
            placeholder="thriller, comfort"
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText>Ranked</AppText>
            <Switch value={ranked} onValueChange={setRanked} />
          </View>
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            {(["PRIVATE", "FOLLOWERS", "PUBLIC"] as const).map((option) => (
              <Button
                key={option}
                variant={visibility === option ? "primary" : "ghost"}
                onPress={() => setVisibility(option)}
              >
                {option === "PRIVATE"
                  ? "Private"
                  : option === "FOLLOWERS"
                    ? "Followers"
                    : "Public"}
              </Button>
            ))}
          </View>
          <AppText variant="caption" muted>
            List privacy is controlled here and does not change your profile
            visibility.
          </AppText>
          <Button
            loading={updateList.isPending}
            disabled={!title.trim()}
            onPress={() =>
              updateList.mutate(
                { title, description, tags, ranked, visibility },
                { onSuccess: () => setEditOpen(false) },
              )
            }
          >
            Save
          </Button>
          <Button
            variant="danger"
            loading={deleteList.isPending}
            onPress={confirmDeleteList}
          >
            Delete List
          </Button>
        </Screen>
      </Modal>
      <Modal
        visible={addOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddOpen(false)}
      >
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
          {search.isLoading ? <ListSkeleton rows={4} /> : null}
          {search.isError ? (
            <ErrorState
              message={search.error.message}
              onRetry={() => void search.refetch()}
            />
          ) : null}
          {addItem.isError ? (
            <ErrorState message={addItem.error.message} />
          ) : null}
          <View style={{ gap: theme.spacing.md }}>
            {search.data?.results?.map((item, index) => {
              const alreadyAdded = hasSearchResult(item);
              return (
                <TitleRow
                  key={`${item.type}-${item.id || item.tmdbId}-${index}`}
                  item={item}
                  right={
                    <Button
                      variant={alreadyAdded ? "ghost" : "secondary"}
                      loading={addItem.isPending}
                      disabled={alreadyAdded}
                      onPress={() =>
                        addItem.mutate(item, {
                          onSuccess: () => {
                            setAddOpen(false);
                            setQ("");
                          },
                        })
                      }
                    >
                      {alreadyAdded ? "Added" : "Add"}
                    </Button>
                  }
                />
              );
            })}
          </View>
        </Screen>
      </Modal>
    </Screen>
  );
}

function CoverStack({ covers, title }: { covers?: string[]; title: string }) {
  const theme = useTheme();
  const visibleCovers = (covers ?? []).slice(0, 3);
  return (
    <View style={{ width: 92, height: 124 }}>
      {visibleCovers.length ? (
        visibleCovers.map((cover, index) => (
          <Image
            key={`${cover}-${index}`}
            source={{ uri: cover }}
            style={{
              position: "absolute",
              left: index * 14,
              top: index * 6,
              width: 68,
              height: 102,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.surfaceMuted,
              borderWidth: 1,
              borderColor: theme.colors.surface,
            }}
            contentFit="cover"
          />
        ))
      ) : (
        <View
          style={{
            width: 78,
            height: 110,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.surfaceMuted,
            justifyContent: "flex-end",
            padding: theme.spacing.sm,
          }}
        >
          <AppText variant="caption" numberOfLines={3}>
            {title}
          </AppText>
        </View>
      )}
    </View>
  );
}

function Input(
  props: React.ComponentProps<typeof TextInput> & { label: string },
) {
  const theme = useTheme();
  const { label, ...inputProps } = props;
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.faint}
        style={{
          minHeight: inputProps.multiline ? 96 : 48,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
          padding: theme.spacing.md,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
          fontSize: 16,
          textAlignVertical: inputProps.multiline ? "top" : "center",
        }}
        {...inputProps}
      />
    </View>
  );
}
