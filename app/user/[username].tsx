import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { ActivityCalendar } from "@/components/profile/ActivityCalendar";
import {
  useFollowMutation,
  useUserProfileQuery,
} from "@/features/profile/queries";
import { useTheme } from "@/lib/theme";

export default function UserProfileScreen() {
  const theme = useTheme();
  const { username } = useLocalSearchParams<{ username: string }>();
  const profile = useUserProfileQuery(username);
  const follow = useFollowMutation(
    username,
    Boolean(profile.data?.isFollowing),
  );
  const user = profile.data?.user;
  return (
    <Screen title={user?.name || username} subtitle={`@${username}`}>
      {profile.isLoading ? <LoadingState label="Loading profile" /> : null}
      {profile.isError ? (
        <ErrorState
          message={profile.error.message}
          onRetry={() => void profile.refetch()}
        />
      ) : null}
      {profile.data ? (
        <>
          <AppText muted>{user?.bio || "Visible Watchlog profile."}</AppText>
          <Button loading={follow.isPending} onPress={() => follow.mutate()}>
            {profile.data.isFollowing ? "Unfollow" : "Follow"}
          </Button>
          {follow.isError ? (
            <AppText style={{ color: theme.colors.danger }}>
              {follow.error.message}
            </AppText>
          ) : null}
          <Section title="Activity">
            <ActivityCalendar days={profile.data.calendar} />
          </Section>
          <Section title="Reviews">
            {profile.data.reviews?.length ? (
              <View style={{ gap: theme.spacing.sm }}>
                {profile.data.reviews.map((review) => (
                  <Button
                    key={review.id}
                    variant="ghost"
                    onPress={() => router.push(`/log/${review.id}`)}
                  >
                    {review.spoiler
                      ? "Spoiler review"
                      : review.title || review.body || "Review"}
                  </Button>
                ))}
              </View>
            ) : (
              <EmptyState title="No visible reviews" />
            )}
          </Section>
          <Section title="Lists">
            {profile.data.lists?.length ? (
              <View style={{ gap: theme.spacing.sm }}>
                {profile.data.lists.map((list) => (
                  <Button
                    key={list.id}
                    variant="ghost"
                    onPress={() => router.push(`/list/${list.id}`)}
                  >
                    {list.title}
                  </Button>
                ))}
              </View>
            ) : (
              <EmptyState title="No visible lists" />
            )}
          </Section>
        </>
      ) : null}
    </Screen>
  );
}
