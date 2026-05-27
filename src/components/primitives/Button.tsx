import type { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  View,
} from "react-native";
import { AppText } from "./Text";
import { useTheme } from "@/lib/theme";

type ButtonProps = PressableProps &
  PropsWithChildren<{
    variant?: "primary" | "secondary" | "ghost" | "danger";
    loading?: boolean;
    icon?: React.ReactNode;
  }>;

export function Button({
  variant = "primary",
  loading,
  disabled,
  icon,
  children,
  style,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const colors = {
    primary: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
      color: "#FFFFFF",
    },
    secondary: {
      backgroundColor: theme.colors.accentSoft,
      borderColor: theme.colors.accentSoft,
      color: theme.colors.accent,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    danger: {
      backgroundColor: "transparent",
      borderColor: theme.colors.border,
      color: theme.colors.danger,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      {...props}
      style={(state) => [
        {
          minHeight: 44,
          borderRadius: theme.radius.sm,
          borderWidth: 1,
          paddingHorizontal: theme.spacing.lg,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: theme.spacing.sm,
          opacity: isDisabled ? 0.45 : state.pressed ? 0.72 : 1,
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.color} /> : null}
      {!loading && icon ? <View>{icon}</View> : null}
      <AppText variant="label" style={{ color: colors.color }}>
        {children}
      </AppText>
    </Pressable>
  );
}
