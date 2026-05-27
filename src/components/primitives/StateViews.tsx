import { ActivityIndicator, Pressable, View } from "react-native";
import { RefreshCw } from "lucide-react-native";
import { AppText } from "./Text";
import { Button } from "./Button";
import { useTheme } from "@/lib/theme";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={{ minHeight: 120, alignItems: "center", justifyContent: "center", gap: theme.spacing.md }}>
      <ActivityIndicator color={theme.colors.accent} />
      <AppText muted>{label}</AppText>
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        minHeight: 96,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        justifyContent: "center",
        gap: theme.spacing.xs,
      }}
    >
      <AppText variant="label">{title}</AppText>
      {body ? <AppText muted>{body}</AppText> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={{
        minHeight: 112,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      <AppText variant="label">Could not load this.</AppText>
      <AppText muted>{message || "Try again in a moment."}</AppText>
      {onRetry ? (
        <Button variant="secondary" onPress={onRetry} icon={<RefreshCw size={16} color={theme.colors.accent} />}>
          Retry
        </Button>
      ) : null}
    </View>
  );
}

export function IconButton({
  label,
  children,
  onPress,
}: {
  label: string;
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}
