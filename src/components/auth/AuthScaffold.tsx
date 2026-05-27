import { Image } from "expo-image";
import { Link, type Href } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState, type PropsWithChildren } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
  type TextInputProps,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import appIcon from "../../../assets/icon.png";
import { IconButton } from "../primitives/StateViews";
import { AppText } from "../primitives/Text";
import { useTheme } from "@/lib/theme";

type AuthScaffoldProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  art: ImageSourcePropType;
  backHref?: Href;
}>;

export function AuthScaffold({
  title,
  subtitle,
  art,
  backHref = "/onboarding",
  children,
}: AuthScaffoldProps) {
  const theme = useTheme();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [floatValue] = useState(() => new Animated.Value(0));
  const availableHeight = Math.max(1, height - insets.top - insets.bottom);
  const short = availableHeight < 700;
  const compact = availableHeight < 780;
  const horizontalPadding = width < 360 ? theme.spacing.md : theme.spacing.lg;
  const verticalPadding = short ? theme.spacing.sm : theme.spacing.md;
  const sectionGap = short ? theme.spacing.sm : theme.spacing.md;
  const useNativeAnimationDriver = Platform.OS !== "web";
  const artHeight = Math.round(
    Math.min(
      short ? 116 : compact ? 142 : 176,
      Math.max(96, availableHeight * (short ? 0.15 : 0.19), width * 0.3),
    ),
  );

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: useNativeAnimationDriver,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: useNativeAnimationDriver,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [floatValue, useNativeAnimationDriver]);

  const translateY = floatValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const rotate = floatValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["-1.5deg", "1.5deg"],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: horizontalPadding,
            paddingTop: verticalPadding,
            paddingBottom: verticalPadding,
            gap: sectionGap,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: sectionGap,
            }}
          >
            <Link href={backHref} asChild>
              <IconButton label="Back">
                <ChevronLeft size={20} color={theme.colors.text} />
              </IconButton>
            </Link>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.sm,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: short ? theme.spacing.xs : theme.spacing.sm,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 999,
                backgroundColor: theme.colors.surface,
              }}
            >
              <Image
                source={appIcon}
                style={{
                  width: short ? 26 : 30,
                  height: short ? 26 : 30,
                  borderRadius: 8,
                }}
                contentFit="cover"
                accessibilityLabel="Watchlog"
              />
              <AppText
                style={{
                  fontSize: short ? 19 : 21,
                  lineHeight: short ? 24 : 27,
                  fontWeight: "800",
                }}
              >
                Watchlog
              </AppText>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              gap: sectionGap,
            }}
          >
            <Animated.View
              style={{
                height: artHeight,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ translateY }, { rotate }],
              }}
            >
              <Image
                source={art}
                style={{ width: artHeight * 0.74, height: artHeight }}
                contentFit="contain"
                transition={180}
                accessibilityLabel=""
              />
            </Animated.View>

            <View style={{ alignItems: "center", gap: theme.spacing.sm }}>
              <AppText
                variant="title"
                style={{
                  textAlign: "center",
                  fontSize: short ? 27 : compact ? 30 : 34,
                  lineHeight: short ? 32 : compact ? 36 : 40,
                }}
              >
                {title}
              </AppText>
              <AppText
                muted
                style={{
                  maxWidth: 320,
                  textAlign: "center",
                  fontSize: short ? 15 : 16,
                  lineHeight: short ? 21 : 23,
                }}
              >
                {subtitle}
              </AppText>
            </View>

            <View
              style={{
                gap: theme.spacing.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surface,
                padding: short ? theme.spacing.sm : theme.spacing.md,
              }}
            >
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthInput({
  label,
  style,
  ...inputProps
}: TextInputProps & { label: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.faint}
        autoCorrect={false}
        style={[
          {
            minHeight: 50,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing.md,
            color: theme.colors.text,
            backgroundColor: theme.colors.background,
            fontSize: 16,
          },
          style,
        ]}
        {...inputProps}
      />
    </View>
  );
}

export function AuthMessage({
  tone = "muted",
  children,
}: PropsWithChildren<{ tone?: "muted" | "danger" | "success" }>) {
  const theme = useTheme();
  const color =
    tone === "danger"
      ? theme.colors.danger
      : tone === "success"
        ? theme.colors.success
        : theme.colors.muted;
  return (
    <View
      style={{
        borderRadius: theme.radius.sm,
        backgroundColor:
          tone === "success" ? theme.colors.successSoft : theme.colors.surface,
        borderWidth: tone === "muted" ? 0 : 1,
        borderColor: tone === "danger" ? theme.colors.danger : color,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
      }}
    >
      <AppText style={{ color, fontSize: 14, lineHeight: 20 }}>
        {children}
      </AppText>
    </View>
  );
}
