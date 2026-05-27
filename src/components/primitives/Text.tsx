import type { PropsWithChildren } from "react";
import { Text as NativeText, type TextProps } from "react-native";
import { useTheme } from "@/lib/theme";

type AppTextProps = TextProps &
  PropsWithChildren<{
    variant?: "title" | "heading" | "body" | "caption" | "label";
    muted?: boolean;
  }>;

export function AppText({
  variant = "body",
  muted,
  style,
  children,
  ...props
}: AppTextProps) {
  const theme = useTheme();
  const sizes = {
    title: { fontSize: 34, lineHeight: 40, fontWeight: "700" as const },
    heading: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
    label: { fontSize: 14, lineHeight: 18, fontWeight: "700" as const },
  };

  return (
    <NativeText
      {...props}
      style={[
        {
          color: muted ? theme.colors.muted : theme.colors.text,
          letterSpacing: 0,
        },
        sizes[variant],
        style,
      ]}
    >
      {children}
    </NativeText>
  );
}
