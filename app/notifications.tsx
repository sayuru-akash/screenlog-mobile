import { View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { useMarkNotificationsReadMutation, useNotificationsQuery } from "@/features/notifications/queries";
import { compactDate } from "@/lib/format";
import { useTheme } from "@/lib/theme";

export default function NotificationsScreen() {
  const theme = useTheme();
  const notifications = useNotificationsQuery();
  const markRead = useMarkNotificationsReadMutation();
  const items = notifications.data?.items ?? [];
  return (
    <Screen title="Notifications" subtitle={`${notifications.data?.unreadCount ?? 0} unread`}>
      {notifications.isLoading ? <LoadingState label="Loading notifications" /> : null}
      {notifications.isError ? <ErrorState message={notifications.error.message} onRetry={() => void notifications.refetch()} /> : null}
      {items.length ? (
        <Button variant="secondary" loading={markRead.isPending} onPress={() => markRead.mutate(undefined)}>
          Mark All Read
        </Button>
      ) : null}
      {!notifications.isLoading && !items.length ? <EmptyState title="No notifications" /> : null}
      <View style={{ gap: theme.spacing.md }}>
        {items.map((item) => (
          <View key={item.id} style={{ gap: 3 }}>
            <AppText variant="label">{item.title}</AppText>
            {item.body ? <AppText muted>{item.body}</AppText> : null}
            {item.createdAt ? <AppText variant="caption" muted>{compactDate(item.createdAt)}</AppText> : null}
          </View>
        ))}
      </View>
    </Screen>
  );
}
