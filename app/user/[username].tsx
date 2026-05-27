import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import {
  ProfileHero,
  ProfileListGrid,
  ProfileLogList,
  ProfileOverview,
  ProfileStats,
  ProfileTabs,
  type ProfileTab,
} from "@/components/profile/ProfileSurface";
import {
  useFollowMutation,
  useUserProfileQuery,
} from "@/features/profile/queries";
import { useTheme } from "@/lib/theme";

export default function UserProfileScreen() {
  const theme = useTheme();
  const { username } = useLocalSearchParams<{ username: string }>();
  const profile = useUserProfileQuery(username);
  const [tab, setTab] = useState<ProfileTab>("overview");
  const isFollowing = Boolean(
    profile.data?.following ?? profile.data?.isFollowing,
  );
  const follow = useFollowMutation(username, isFollowing);

  return (
    <Screen
      back
      title={profile.data?.user?.name || username}
      subtitle={username ? `@${username}` : undefined}
    >
      {profile.isLoading ? <LoadingState label="Loading profile" /> : null}
      {profile.isError ? (
        <ErrorState
          message={profile.error.message}
          onRetry={() => void profile.refetch()}
        />
      ) : null}
      {profile.data ? (
        <View style={{ gap: theme.spacing.xl }}>
          <ProfileHero
            profile={profile.data}
            action={
              !profile.data.isSelf ? (
                <Button
                  variant={isFollowing ? "secondary" : "primary"}
                  loading={follow.isPending}
                  onPress={() => follow.mutate()}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              ) : null
            }
          />
          {follow.isError ? (
            <AppText style={{ color: theme.colors.danger }}>
              {follow.error.message}
            </AppText>
          ) : null}
          <ProfileStats profile={profile.data} />
          <ProfileTabs value={tab} onChange={setTab} />
          {tab === "overview" ? (
            <ProfileOverview profile={profile.data} onTabChange={setTab} />
          ) : null}
          {tab === "history" ? (
            <ProfileLogList
              logs={profile.data.logs}
              empty="No visible watch history yet."
            />
          ) : null}
          {tab === "reviews" ? (
            <ProfileLogList
              logs={profile.data.reviews}
              empty="No visible reviews yet."
            />
          ) : null}
          {tab === "lists" ? (
            <ProfileListGrid lists={profile.data.lists} />
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}
