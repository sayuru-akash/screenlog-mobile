import { router } from "expo-router";
import { Settings } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import { EmptyState, ErrorState, IconButton, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { ActivityCalendar } from "@/components/profile/ActivityCalendar";
import { useProfileQuery } from "@/features/profile/queries";
import { initials } from "@/lib/format";
import { useTheme } from "@/lib/theme";

export default function ProfileScreen() {
  const theme = useTheme();
  const profile = useProfileQuery();
  const user = profile.data?.user;
  return (
    <Screen
      title="Profile"
      subtitle={user?.username ? `@${user.username}` : "Your Watchlog identity."}
      right={
        <IconButton label="Settings" onPress={() => router.push("/settings")}>
          <Settings size={20} color={theme.colors.text} />
        </IconButton>
      }
    >
      {profile.isLoading ? <LoadingState label="Loading profile" /> : null}
      {profile.isError ? <ErrorState message={profile.error.message} onRetry={() => void profile.refetch()} /> : null}
      {!profile.isLoading && !profile.isError ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                backgroundColor: theme.colors.accentSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AppText variant="heading" style={{ color: theme.colors.accent }}>
                {initials(user?.name || user?.username)}
              </AppText>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <AppText variant="heading">{user?.name || "Watchlog"}</AppText>
              <AppText muted>{user?.bio || "Tracking what you watch."}</AppText>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Button variant="secondary" onPress={() => router.push("/lists")}>
              Lists
            </Button>
            <Button variant="ghost" onPress={() => router.push("/feed")}>
              Feed
            </Button>
          </View>
          <Section title="Activity">
            <ActivityCalendar days={profile.data?.calendar} />
          </Section>
          <Section title="Stats">
            {profile.data?.stats ? (
              <View style={{ gap: theme.spacing.sm }}>
                {Object.entries(profile.data.stats).map(([key, value]) => (
                  <AppText key={key}>
                    {key}: {value ?? "0"}
                  </AppText>
                ))}
              </View>
            ) : (
              <EmptyState title="No stats yet" />
            )}
          </Section>
        </>
      ) : null}
    </Screen>
  );
}
