import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import {
  EmptyState,
  ErrorState,
  ProfileSkeleton,
} from "@/components/primitives/StateViews";
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
  const isPrivateProfile =
    profile.isError &&
    typeof profile.error === "object" &&
    profile.error !== null &&
    "status" in profile.error &&
    profile.error.status === 403;

  return (
    <Screen
      back
      title={profile.data?.user?.name || username}
      subtitle={username ? `@${username}` : undefined}
      refreshing={profile.isRefetching}
      onRefresh={() => void profile.refetch()}
    >
      {profile.isLoading ? <ProfileSkeleton /> : null}
      {isPrivateProfile ? (
        <PrivateProfileState username={username} />
      ) : profile.isError ? (
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
            <ProfileOverview
              profile={profile.data}
              library={profile.data.library}
            />
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

function PrivateProfileState({ username }: { username?: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xl }}>
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
        <AppText variant="heading">
          {username ? `@${username}` : "Private profile"}
        </AppText>
        <AppText muted>
          This profile is private. Public lists can still be opened from direct
          list links, but profile activity is hidden by the owner.
        </AppText>
      </View>
      <EmptyState
        title="Private activity"
        body="Follow counts and visible activity appear here when this profile is public or shared with you."
      />
    </View>
  );
}
