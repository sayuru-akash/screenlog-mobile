import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { useCommentsQuery, useLogQuery, useReactionMutation } from "@/features/reviews/queries";
import { useTheme } from "@/lib/theme";

export default function LogDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const log = useLogQuery(id);
  const comments = useCommentsQuery(id);
  const reaction = useReactionMutation("logs", id);
  return (
    <Screen title={log.data?.title || "Review"} subtitle={log.data?.rating ? `${log.data.rating}/10` : undefined}>
      {log.isLoading ? <LoadingState label="Loading review" /> : null}
      {log.isError ? <ErrorState message={log.error.message} onRetry={() => void log.refetch()} /> : null}
      {log.data ? (
        <>
          <AppText>{log.data.spoiler ? "Spoiler review. Tap reveal on web for full text." : log.data.body || "No text."}</AppText>
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Button variant="secondary" loading={reaction.isPending} onPress={() => reaction.mutate(1)}>
              Upvote
            </Button>
            <Button variant="ghost" loading={reaction.isPending} onPress={() => reaction.mutate(-1)}>
              Downvote
            </Button>
          </View>
        </>
      ) : null}
      {comments.isLoading ? <LoadingState label="Loading comments" /> : null}
      {comments.data?.comments?.length ? (
        comments.data.comments.map((comment) => <AppText key={comment.id}>{comment.body}</AppText>)
      ) : (
        <EmptyState title="No comments" />
      )}
    </Screen>
  );
}
