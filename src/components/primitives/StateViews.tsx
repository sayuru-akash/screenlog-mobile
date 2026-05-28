import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  View,
  type ViewStyle,
} from "react-native";
import { RefreshCw } from "lucide-react-native";
import { AppText } from "./Text";
import { Button } from "./Button";
import { useTheme } from "@/lib/theme";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        minHeight: 120,
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.md,
      }}
    >
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

export function SkeletonBlock({
  width = "100%",
  height,
  radius,
  style,
}: {
  width?: ViewStyle["width"];
  height: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.48));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.86,
          duration: 780,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(opacity, {
          toValue: 0.48,
          duration: 780,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius ?? theme.radius.sm,
          backgroundColor: theme.colors.surfaceMuted,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ListSkeleton({
  rows = 5,
  poster = true,
}: {
  rows?: number;
  poster?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityLabel="Loading content"
      style={{ gap: theme.spacing.md }}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={index}
          style={{
            minHeight: poster ? 76 : 58,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          {poster ? (
            <SkeletonBlock width={50} height={68} radius={theme.radius.sm} />
          ) : null}
          <View style={{ flex: 1, gap: theme.spacing.sm }}>
            <SkeletonBlock width="72%" height={16} />
            <SkeletonBlock width="52%" height={13} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function DashboardSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xl }}>
      <SkeletonBlock height={270} radius={theme.radius.md} />
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <SkeletonBlock width={86} height={40} />
        <SkeletonBlock width={86} height={40} />
      </View>
      <ListSkeleton rows={3} />
    </View>
  );
}

export function ProfileSkeleton() {
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
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <SkeletonBlock width={72} height={72} radius={36} />
          <View style={{ flex: 1, gap: theme.spacing.sm }}>
            <SkeletonBlock width="58%" height={20} />
            <SkeletonBlock width="42%" height={14} />
            <SkeletonBlock width="78%" height={14} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
        <SkeletonBlock width={154} height={108} radius={theme.radius.md} />
        <SkeletonBlock width={154} height={108} radius={theme.radius.md} />
      </View>
      <ListSkeleton rows={3} />
    </View>
  );
}

export function SettingsSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.lg }}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={{ gap: theme.spacing.sm }}>
          <SkeletonBlock width="36%" height={16} />
          <SkeletonBlock height={48} />
        </View>
      ))}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
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
        <Button
          variant="secondary"
          onPress={onRetry}
          icon={<RefreshCw size={16} color={theme.colors.accent} />}
        >
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
