import { router } from "expo-router";
import type { Href } from "expo-router";
import {
  AlertCircle,
  Bell,
  ChevronDown,
  Eye,
  LogOut,
  Settings,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Modal, Pressable, View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import {
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
  useProfileLibraryQuery,
  useProfileQuery,
} from "@/features/profile/queries";
import { profileMenuItems } from "@/features/profile/profile-menu";
import { signOut } from "@/features/auth/actions";
import { useTheme } from "@/lib/theme";

export default function ProfileScreen() {
  const theme = useTheme();
  const profile = useProfileQuery();
  const library = useProfileLibraryQuery();
  const [tab, setTab] = useState<ProfileTab>("overview");
  const user = profile.data?.user;

  return (
    <Screen
      title="Profile"
      refreshing={profile.isRefetching || library.isRefetching}
      onRefresh={() => {
        void profile.refetch();
        void library.refetch();
      }}
      subtitle={
        user?.username ? `@${user.username}` : "Your Watchlog identity."
      }
      right={<ProfileActionsMenu username={user?.username} />}
    >
      {profile.isLoading ? <ProfileSkeleton /> : null}
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
            showUsername={false}
            action={
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.sm,
                }}
              >
                <Button
                  variant="secondary"
                  icon={<Users size={16} color={theme.colors.accent} />}
                  onPress={() => router.push("/feed")}
                  style={{ flex: 1 }}
                >
                  Friends Feed
                </Button>
              </View>
            }
          />
          <ProfileStats profile={profile.data} />
          <ProfileTabs value={tab} onChange={setTab} />
          {tab === "overview" ? (
            <ProfileOverview
              profile={profile.data}
              library={library.data}
              libraryLoading={library.isLoading}
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
          {tab === "overview" && library.isError ? (
            <ErrorState
              message={library.error.message}
              onRetry={() => void library.refetch()}
            />
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

function ProfileActionsMenu({ username }: { username?: string | null }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const items = profileMenuItems(username);

  const close = () => setOpen(false);
  const confirmSignOut = () => {
    close();
    Alert.alert("Sign out?", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          setSigningOut(true);
          void signOut()
            .then(() => router.replace("/(auth)/sign-in"))
            .catch(() => {
              Alert.alert("Sign out failed", "Please try again.");
            })
            .finally(() => setSigningOut(false));
        },
      },
    ]);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile menu"
        accessibilityState={{ expanded: open }}
        disabled={signingOut}
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          minHeight: 42,
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.xs,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 999,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.md,
          opacity: signingOut ? 0.45 : pressed ? 0.72 : 1,
        })}
      >
        <SlidersHorizontal size={18} color={theme.colors.text} />
        <ChevronDown size={15} color={theme.colors.muted} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close profile menu"
          onPress={close}
          style={{
            flex: 1,
            alignItems: "flex-end",
            paddingTop: 78,
            paddingRight: theme.spacing.lg,
            backgroundColor:
              theme.mode === "dark" ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0.16)",
          }}
        >
          <Pressable
            accessibilityRole="menu"
            onPress={(event) => event.stopPropagation()}
            style={{
              width: 272,
              maxWidth: "92%",
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.sm,
              gap: 2,
              shadowColor: "#000000",
              shadowOpacity: theme.mode === "dark" ? 0.42 : 0.16,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 12 },
              elevation: 8,
            }}
          >
            {items.map((item) => (
              <ProfileMenuRow
                key={item.key}
                label={item.label}
                icon={menuIcon(
                  item.key,
                  theme.colors[item.destructive ? "danger" : "text"],
                )}
                destructive={item.destructive}
                onPress={() => {
                  if (item.key === "sign-out") {
                    confirmSignOut();
                    return;
                  }
                  close();
                  router.push(item.route as Href);
                }}
              />
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function ProfileMenuRow({
  label,
  icon,
  destructive,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  destructive?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 46,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        borderRadius: theme.radius.sm,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: pressed ? theme.colors.surfaceMuted : "transparent",
      })}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: destructive
            ? theme.mode === "dark"
              ? "rgba(255,180,171,0.12)"
              : "rgba(180,35,24,0.08)"
            : theme.colors.surfaceMuted,
        }}
      >
        {icon}
      </View>
      <AppText
        variant="label"
        style={{
          flex: 1,
          color: destructive ? theme.colors.danger : theme.colors.text,
        }}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function menuIcon(key: string, color: string) {
  if (key === "public-view") return <Eye size={16} color={color} />;
  if (key === "notification-settings") return <Bell size={16} color={color} />;
  if (key === "user-settings") return <UserCog size={16} color={color} />;
  if (key === "app-settings") return <Settings size={16} color={color} />;
  if (key === "sign-out") return <LogOut size={16} color={color} />;
  return <AlertCircle size={16} color={color} />;
}
