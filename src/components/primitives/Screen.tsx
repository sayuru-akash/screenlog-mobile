import type { PropsWithChildren } from "react";
import { ScrollView, View, type ViewStyle } from "react-native";
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
}>;

export function Screen({
  title,
  subtitle,
  scroll = true,
  back = false,
  right,
  children,
  contentStyle,
}: ScreenProps) {
  const theme = useTheme();
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
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
