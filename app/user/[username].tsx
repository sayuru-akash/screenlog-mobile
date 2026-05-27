import { useLocalSearchParams } from "expo-router";
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
          <Section title="Activity">
            <ActivityCalendar days={profile.data.calendar} />
          </Section>
          <Section title="Lists">
            {profile.data.lists?.length ? (
              <View style={{ gap: theme.spacing.sm }}>
                {profile.data.lists.map((list) => (
                  <AppText key={list.id}>{list.title}</AppText>
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
