import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, Modal, Switch, TextInput, View } from "react-native";
import { X } from "lucide-react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
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
import {
  StarRatingDisplay,
  StarRatingInput,
} from "@/components/reviews/StarRating";
import { ReviewOptionsRow } from "@/components/reviews/ReviewOptionsRow";
import { SpoilerCard } from "@/components/reviews/SpoilerCard";
import { shouldHideSpoilerText } from "@/components/reviews/spoiler-display";
import {
  backendRatingToStars,
  formatStarsFromBackend,
  starsToBackendRating,
} from "@/features/reviews/rating";
import type { Visibility } from "@/types/domain";

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
  const [editRatingStars, setEditRatingStars] = useState<number | null>(null);
  const [editSpoiler, setEditSpoiler] = useState(false);
  const [editVisibility, setEditVisibility] = useState<Visibility>("PRIVATE");
  const [commentBody, setCommentBody] = useState("");
  const [commentSpoiler, setCommentSpoiler] = useState(false);
  const [revealedComments, setRevealedComments] = useState<Set<string>>(
    () => new Set(),
  );
  const [replyParent, setReplyParent] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const hiddenSpoiler = shouldHideSpoilerText({
    spoiler: log.data?.spoiler,
    revealed,
  });
  return (
    <Screen
      back
      title={log.data?.title || "Review"}
      subtitle={formatStarsFromBackend(log.data?.rating) ?? undefined}
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
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.md,
            }}
          >
            {log.data.posterUrl ? (
              <Image
                source={{ uri: log.data.posterUrl }}
                style={{
                  width: 68,
                  height: 102,
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.surfaceMuted,
                }}
                contentFit="cover"
              />
            ) : null}
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <AppText variant="heading" numberOfLines={2}>
                {log.data.subtitle || log.data.title || "Review"}
              </AppText>
              <AppText variant="caption" muted>
                {log.data.user?.username
                  ? `@${log.data.user.username}`
                  : "Watchlog"}
                {log.data.watchedAt
                  ? ` · ${formatDate(log.data.watchedAt)}`
                  : ""}
                {log.data.rewatch ? " · rewatch" : ""}
              </AppText>
              {log.data.rating ? (
                <StarRatingDisplay rating={log.data.rating} />
              ) : null}
              {hiddenSpoiler ? (
                <SpoilerCard kind="review" onReveal={() => setRevealed(true)} />
              ) : (
                <AppText>{log.data.body || "No text."}</AppText>
              )}
            </View>
          </View>
          {log.data.spoiler && revealed ? (
            <Button
              variant="secondary"
              onPress={() => setRevealed((value) => !value)}
            >
              Hide Spoiler
            </Button>
          ) : null}
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Button
              variant="secondary"
              loading={reaction.isPending}
              onPress={() =>
                reaction.mutate(log.data.userReaction === 1 ? 0 : 1)
              }
            >
              Up {log.data.reactionScore ?? 0}
            </Button>
            <Button
              variant="ghost"
              loading={reaction.isPending}
              onPress={() =>
                reaction.mutate(log.data.userReaction === -1 ? 0 : -1)
              }
            >
              Downvote
            </Button>
            {log.data.canEdit ? (
              <Button
                variant="ghost"
                onPress={() => {
                  setEditBody(log.data?.body ?? "");
                  setEditRatingStars(backendRatingToStars(log.data?.rating));
                  setEditSpoiler(Boolean(log.data?.spoiler));
                  setEditVisibility(log.data?.visibility ?? "PRIVATE");
                  setEditOpen(true);
                }}
              >
                Edit
              </Button>
            ) : null}
          </View>
        </>
      ) : null}
      <Section title="Comments">
        <View style={{ gap: theme.spacing.md }}>
          {comments.isLoading ? (
            <LoadingState label="Loading comments" />
          ) : null}
          {comments.data?.comments?.length ? (
            comments.data.comments.map((comment, commentIndex) => (
              <View
                key={`${comment.id}-${comment.createdAt ?? commentIndex}`}
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.md,
                  gap: theme.spacing.xs,
                }}
              >
                <CommentBody
                  comment={comment}
                  revealed={revealedComments.has(comment.id)}
                  onReveal={() =>
                    setRevealedComments((current) => {
                      const next = new Set(current);
                      next.add(comment.id);
                      return next;
                    })
                  }
                />
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
                    style={{
                      gap: theme.spacing.sm,
                      paddingLeft: theme.spacing.lg,
                    }}
                  >
                    {comment.replies.map((reply, replyIndex) => (
                      <View
                        key={`${reply.id}-${reply.createdAt ?? replyIndex}`}
                        style={{ gap: theme.spacing.xs }}
                      >
                        <CommentBody
                          comment={reply}
                          revealed={revealedComments.has(reply.id)}
                          onReveal={() =>
                            setRevealedComments((current) => {
                              const next = new Set(current);
                              next.add(reply.id);
                              return next;
                            })
                          }
                          muted
                          kind="reply"
                        />
                        <View
                          style={{
                            flexDirection: "row",
                            gap: theme.spacing.sm,
                          }}
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
          ) : comments.isLoading ? null : (
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
              <Switch
                value={commentSpoiler}
                onValueChange={setCommentSpoiler}
              />
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
              {replyParent ? "Reply" : "Comment"}
            </Button>
          </View>
        </View>
      </Section>
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
          <StarRatingInput
            value={editRatingStars}
            onChange={setEditRatingStars}
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
          <ReviewOptionsRow
            visibility={editVisibility}
            onVisibilityChange={setEditVisibility}
            spoiler={editSpoiler}
            onSpoilerChange={setEditSpoiler}
          />
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
                  rating: starsToBackendRating(editRatingStars),
                  review: editBody.trim() || null,
                  spoiler: editSpoiler,
                  visibility: editVisibility,
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

function CommentBody({
  comment,
  revealed,
  onReveal,
  muted = false,
  kind = "comment",
}: {
  comment: { spoiler?: boolean; body?: string | null; title?: string | null };
  revealed: boolean;
  onReveal: () => void;
  muted?: boolean;
  kind?: "comment" | "reply";
}) {
  if (shouldHideSpoilerText({ spoiler: comment.spoiler, revealed })) {
    return <SpoilerCard kind={kind} onReveal={onReveal} />;
  }
  return (
    <AppText muted={muted}>
      {comment.body || comment.title || "No text."}
    </AppText>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
