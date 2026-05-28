import type { PropsWithChildren } from "react";
import {
  RefreshControl,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "./Text";
import { IconButton } from "./StateViews";
import { useTheme } from "@/lib/theme";

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  back?: boolean;
  right?: React.ReactNode;
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  onScrollNearEnd?: () => void;
}>;

export function Screen({
  title,
  subtitle,
  scroll = true,
  back = false,
  right,
  children,
  contentStyle,
  refreshing = false,
  onRefresh,
  onScrollNearEnd,
}: ScreenProps) {
  const theme = useTheme();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!onScrollNearEnd) return;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromEnd =
      contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromEnd < 320) onScrollNearEnd();
  };
  const content = (
    <View
      style={[
        { gap: theme.spacing.xl, padding: theme.spacing.lg },
        contentStyle,
      ]}
    >
      {title ? (
        <View style={{ gap: theme.spacing.md }}>
          {back ? (
            <IconButton
              label="Go back"
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/(tabs)")
              }
            >
              <ChevronLeft size={20} color={theme.colors.text} />
            </IconButton>
          ) : null}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="title">{title}</AppText>
              {subtitle ? <AppText muted>{subtitle}</AppText> : null}
            </View>
            {right}
          </View>
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {scroll ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={onScrollNearEnd ? handleScroll : undefined}
          scrollEventThrottle={onScrollNearEnd ? 120 : undefined}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.accent}
                colors={[theme.colors.accent]}
                progressBackgroundColor={theme.colors.surface}
              />
            ) : undefined
          }
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
