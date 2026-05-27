import { router, type Href } from "expo-router";
import { Pressable, View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import {
  useMarkNotificationsReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/queries";
import { compactDate } from "@/lib/format";
import { mobileRouteFromHref } from "@/lib/api-mappers";
import { useTheme } from "@/lib/theme";

export default function NotificationsScreen() {
  const theme = useTheme();
  const notifications = useNotificationsQuery();
  const markRead = useMarkNotificationsReadMutation();
  const items = notifications.data?.items ?? [];
  return (
    <Screen
      back
      title="Notifications"
      subtitle={`${notifications.data?.unreadCount ?? 0} unread`}
    >
      {notifications.isLoading ? (
        <LoadingState label="Loading notifications" />
      ) : null}
      {notifications.isError ? (
        <ErrorState
          message={notifications.error.message}
          onRetry={() => void notifications.refetch()}
        />
      ) : null}
      {items.length ? (
        <Button
          variant="secondary"
          loading={markRead.isPending}
          onPress={() => markRead.mutate(undefined)}
        >
          Mark All Read
        </Button>
      ) : null}
      {!notifications.isLoading && !items.length ? (
        <EmptyState title="No notifications" />
      ) : null}
      <View style={{ gap: theme.spacing.md }}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole={item.href ? "button" : "text"}
            accessibilityLabel={item.href ? `Open ${item.title}` : item.title}
            onPress={() => {
              if (!item.read) markRead.mutate([item.id]);
              const route = mobileRouteFromHref(item.href);
              if (route) router.push(route as Href);
            }}
            style={({ pressed }) => ({
              gap: 3,
              opacity: pressed ? 0.72 : 1,
              padding: theme.spacing.sm,
              borderRadius: theme.radius.sm,
              backgroundColor: item.read
                ? "transparent"
                : theme.colors.accentSoft,
            })}
          >
            <AppText variant="label">{item.title}</AppText>
            {item.body ? <AppText muted>{item.body}</AppText> : null}
            {item.createdAt ? (
              <AppText variant="caption" muted>
                {compactDate(item.createdAt)}
              </AppText>
            ) : null}
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
