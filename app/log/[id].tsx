import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Switch, TextInput, View } from "react-native";
import { X } from "lucide-react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import {
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
} from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import {
  useCommentsQuery,
  useCommentReactionMutation,
  useCreateCommentMutation,
  useDeleteLogMutation,
  useLogQuery,
  useReactionMutation,
  useUpdateLogMutation,
} from "@/features/reviews/queries";
import { useTheme } from "@/lib/theme";

export default function LogDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const log = useLogQuery(id);
  const comments = useCommentsQuery(id);
  const reaction = useReactionMutation("logs", id);
  const commentReaction = useCommentReactionMutation(id);
  const createComment = useCreateCommentMutation(id);
  const updateLog = useUpdateLogMutation(id);
  const deleteLog = useDeleteLogMutation(id);
  const [revealed, setRevealed] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [editRating, setEditRating] = useState("");
  const [editSpoiler, setEditSpoiler] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentSpoiler, setCommentSpoiler] = useState(false);
  const [replyParent, setReplyParent] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const hiddenSpoiler = Boolean(log.data?.spoiler && !revealed);
  return (
    <Screen
      title={log.data?.title || "Review"}
      subtitle={log.data?.rating ? `${log.data.rating}/10` : undefined}
    >
      {log.isLoading ? <LoadingState label="Loading review" /> : null}
      {log.isError ? (
        <ErrorState
          message={log.error.message}
          onRetry={() => void log.refetch()}
        />
      ) : null}
      {log.data ? (
        <>
          <AppText>
            {hiddenSpoiler ? "Spoiler review." : log.data.body || "No text."}
          </AppText>
          {log.data.spoiler ? (
            <Button
              variant="secondary"
              onPress={() => setRevealed((value) => !value)}
            >
              {revealed ? "Hide Spoiler" : "Reveal Spoiler"}
            </Button>
          ) : null}
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Button
              variant="secondary"
              loading={reaction.isPending}
              onPress={() => reaction.mutate(1)}
            >
              Upvote
            </Button>
            <Button
              variant="ghost"
              loading={reaction.isPending}
              onPress={() => reaction.mutate(-1)}
            >
              Downvote
            </Button>
            <Button
              variant="ghost"
              onPress={() => {
                setEditBody(log.data?.body ?? "");
                setEditRating(log.data?.rating ? String(log.data.rating) : "");
                setEditSpoiler(Boolean(log.data?.spoiler));
                setEditOpen(true);
              }}
            >
              Edit
            </Button>
          </View>
        </>
      ) : null}
      {comments.isLoading ? <LoadingState label="Loading comments" /> : null}
      {comments.data?.comments?.length ? (
        comments.data.comments.map((comment) => (
          <View key={comment.id} style={{ gap: theme.spacing.xs }}>
            <AppText>
              {comment.spoiler ? "Spoiler comment" : comment.body}
            </AppText>
            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.sm,
                alignItems: "center",
              }}
            >
              <Button
                variant="ghost"
                loading={commentReaction.isPending}
                onPress={() =>
                  commentReaction.mutate({
                    id: comment.id,
                    value: comment.userReaction === 1 ? 0 : 1,
                  })
                }
              >
                Up {comment.reactionScore ?? 0}
              </Button>
              <Button
                variant="ghost"
                loading={commentReaction.isPending}
                onPress={() =>
                  commentReaction.mutate({
                    id: comment.id,
                    value: comment.userReaction === -1 ? 0 : -1,
                  })
                }
              >
                Down
              </Button>
              <Button
                variant="ghost"
                onPress={() =>
                  setReplyParent({
                    id: comment.id,
                    label: comment.title || "comment",
                  })
                }
              >
                Reply
              </Button>
            </View>
            {comment.replies?.length ? (
              <View
                style={{ gap: theme.spacing.sm, paddingLeft: theme.spacing.lg }}
              >
                {comment.replies.map((reply) => (
                  <View key={reply.id} style={{ gap: theme.spacing.xs }}>
                    <AppText muted>
                      {reply.spoiler ? "Spoiler reply" : reply.body}
                    </AppText>
                    <View
                      style={{ flexDirection: "row", gap: theme.spacing.sm }}
                    >
                      <Button
                        variant="ghost"
                        loading={commentReaction.isPending}
                        onPress={() =>
                          commentReaction.mutate({
                            id: reply.id,
                            value: reply.userReaction === 1 ? 0 : 1,
                          })
                        }
                      >
                        Up {reply.reactionScore ?? 0}
                      </Button>
                      <Button
                        variant="ghost"
                        loading={commentReaction.isPending}
                        onPress={() =>
                          commentReaction.mutate({
                            id: reply.id,
                            value: reply.userReaction === -1 ? 0 : -1,
                          })
                        }
                      >
                        Down
                      </Button>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))
      ) : (
        <EmptyState title="No comments" />
      )}
      <View style={{ gap: theme.spacing.md }}>
        {replyParent ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <AppText muted>Replying to {replyParent.label}</AppText>
            <Button variant="ghost" onPress={() => setReplyParent(null)}>
              Clear
            </Button>
          </View>
        ) : null}
        <TextInput
          accessibilityLabel="Comment"
          placeholder="Write a comment"
          value={commentBody}
          onChangeText={setCommentBody}
          multiline
          placeholderTextColor={theme.colors.faint}
          style={{
            minHeight: 96,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.sm,
            padding: theme.spacing.md,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            fontSize: 16,
            textAlignVertical: "top",
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <AppText>Spoiler</AppText>
          <Switch value={commentSpoiler} onValueChange={setCommentSpoiler} />
        </View>
        {createComment.isError || commentReaction.isError ? (
          <AppText style={{ color: theme.colors.danger }}>
            {createComment.error?.message || commentReaction.error?.message}
          </AppText>
        ) : null}
        <Button
          loading={createComment.isPending}
          disabled={!commentBody.trim()}
          onPress={() =>
            createComment.mutate(
              {
                body: commentBody,
                spoiler: commentSpoiler,
                parentId: replyParent?.id,
              },
              {
                onSuccess: () => {
                  setCommentBody("");
                  setCommentSpoiler(false);
                  setReplyParent(null);
                },
              },
            )
          }
        >
          Comment
        </Button>
      </View>
      <Modal
        visible={editOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditOpen(false)}
      >
        <Screen
          title="Edit review"
          subtitle={log.data?.title ?? undefined}
          right={
            <IconButton label="Close edit" onPress={() => setEditOpen(false)}>
              <X size={18} color={theme.colors.text} />
            </IconButton>
          }
        >
          <TextInput
            accessibilityLabel="Rating"
            value={editRating}
            onChangeText={setEditRating}
            keyboardType="number-pad"
            placeholder="Rating 1-10"
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
          <TextInput
            accessibilityLabel="Review"
            value={editBody}
            onChangeText={setEditBody}
            multiline
            placeholder="Review"
            placeholderTextColor={theme.colors.faint}
            style={{
              minHeight: 140,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.sm,
              padding: theme.spacing.md,
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              fontSize: 16,
              textAlignVertical: "top",
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText>Spoiler</AppText>
            <Switch value={editSpoiler} onValueChange={setEditSpoiler} />
          </View>
          {updateLog.isError || deleteLog.isError ? (
            <ErrorState
              message={updateLog.error?.message || deleteLog.error?.message}
            />
          ) : null}
          <Button
            loading={updateLog.isPending}
            onPress={() =>
              updateLog.mutate(
                {
                  rating: editRating.trim()
                    ? Math.max(
                        1,
                        Math.min(10, Number.parseInt(editRating, 10) || 1),
                      )
                    : null,
                  review: editBody.trim() || null,
                  spoiler: editSpoiler,
                },
                { onSuccess: () => setEditOpen(false) },
              )
            }
          >
            Save
          </Button>
          <Button
            variant="danger"
            loading={deleteLog.isPending}
            onPress={() =>
              Alert.alert(
                "Delete review?",
                "This removes the review and its comments.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                      deleteLog.mutate(undefined, {
                        onSuccess: () => router.back(),
                      }),
                  },
                ],
              )
            }
          >
            Delete Review
          </Button>
        </Screen>
      </Modal>
    </Screen>
  );
}
