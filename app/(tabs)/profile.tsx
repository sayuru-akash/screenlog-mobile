import { router } from "expo-router";
import { Settings } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import {
  ErrorState,
  IconButton,
  LoadingState,
} from "@/components/primitives/StateViews";
import {
  ProfileHero,
  ProfileListGrid,
  ProfileLogList,
  ProfileOverview,
  ProfileStats,
  ProfileTabs,
  type ProfileTab,
} from "@/components/profile/ProfileSurface";
import { useProfileQuery } from "@/features/profile/queries";
import { signOut } from "@/features/auth/actions";
import { useTheme } from "@/lib/theme";

export default function ProfileScreen() {
  const theme = useTheme();
  const profile = useProfileQuery();
  const [tab, setTab] = useState<ProfileTab>("overview");
  const user = profile.data?.user;

  return (
    <Screen
      title="Profile"
      subtitle={
        user?.username ? `@${user.username}` : "Your Watchlog identity."
      }
      right={
        <IconButton label="Settings" onPress={() => router.push("/settings")}>
          <Settings size={20} color={theme.colors.text} />
        </IconButton>
      }
    >
      {profile.isLoading ? <LoadingState label="Loading profile" /> : null}
      {profile.isError ? (
        <ErrorState
          message={profile.error.message}
          onRetry={() => void profile.refetch()}
        />
      ) : null}
      {!profile.isLoading && !profile.isError && profile.data ? (
        <View style={{ gap: theme.spacing.xl }}>
          <ProfileHero
            profile={profile.data}
            action={
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: theme.spacing.sm,
                }}
              >
                {user?.username ? (
                  <Button
                    variant="secondary"
                    onPress={() => router.push(`/user/${user.username}`)}
                  >
                    Public View
                  </Button>
                ) : null}
                <Button
                  variant="secondary"
                  onPress={() => router.push("/lists")}
                >
                  Lists
                </Button>
                <Button variant="ghost" onPress={() => router.push("/feed")}>
                  Friends Feed
                </Button>
                <Button
                  variant="danger"
                  onPress={() =>
                    void signOut().then(() => router.replace("/(auth)/sign-in"))
                  }
                >
                  Sign Out
                </Button>
              </View>
            }
          />
          <ProfileStats profile={profile.data} />
          <ProfileTabs value={tab} onChange={setTab} />
          {tab === "overview" ? (
            <ProfileOverview
              profile={profile.data}
              onTabChange={setTab}
              canCreateLists
            />
          ) : null}
          {tab === "history" ? (
            <ProfileLogList
              logs={profile.data.logs}
              empty="Your watch history will appear here."
            />
          ) : null}
          {tab === "reviews" ? (
            <ProfileLogList
              logs={profile.data.reviews}
              empty="Your reviews will appear here."
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
