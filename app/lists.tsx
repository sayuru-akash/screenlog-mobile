import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Modal, Switch, TextInput } from "react-native";
import { X } from "lucide-react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { EmptyState, ErrorState, IconButton, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { useCreateListMutation, useListsQuery } from "@/features/lists/queries";
import { useTheme } from "@/lib/theme";
import type { Visibility } from "@/types/domain";

export default function ListsScreen() {
  const theme = useTheme();
  const lists = useListsQuery();
  const createList = useCreateListMutation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [ranked, setRanked] = useState(true);
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const items = lists.data?.lists ?? [];
  return (
    <Screen
      title="Lists"
      subtitle="Ranked collections and notes."
      right={
        <Button variant="secondary" onPress={() => setOpen(true)}>
          New
        </Button>
      }
    >
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
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <Screen
          title="New list"
          subtitle="Keep it short and useful."
          right={
            <IconButton label="Close" onPress={() => setOpen(false)}>
              <X size={18} color={theme.colors.text} />
            </IconButton>
          }
        >
          <Input label="Title" value={title} onChangeText={setTitle} />
          <Input label="Description" value={description} onChangeText={setDescription} multiline />
          <Input label="Tags" value={tags} onChangeText={setTags} placeholder="thriller, comfort" />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <AppText>Ranked</AppText>
            <Switch value={ranked} onValueChange={setRanked} />
          </View>
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            {(["PRIVATE", "FOLLOWERS", "PUBLIC"] as const).map((option) => (
              <Button key={option} variant={visibility === option ? "primary" : "ghost"} onPress={() => setVisibility(option)}>
                {option === "PRIVATE" ? "Private" : option === "FOLLOWERS" ? "Followers" : "Public"}
              </Button>
            ))}
          </View>
          {createList.isError ? <AppText style={{ color: theme.colors.danger }}>{createList.error.message}</AppText> : null}
          <Button
            loading={createList.isPending}
            disabled={!title.trim()}
            onPress={() =>
              createList.mutate(
                { title, description, tags, ranked, visibility },
                {
                  onSuccess: (payload) => {
                    setOpen(false);
                    setTitle("");
                    setDescription("");
                    setTags("");
                    if (payload.list?.id) router.push(`/list/${payload.list.id}`);
                  },
                },
              )
            }
          >
            Create List
          </Button>
        </Screen>
      </Modal>
    </Screen>
  );
}

function Input(props: React.ComponentProps<typeof TextInput> & { label: string }) {
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
