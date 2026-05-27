import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { AppText } from "./Text";
import { useTheme } from "@/lib/theme";

export function Section({
  title,
  action,
  children,
}: PropsWithChildren<{ title: string; action?: React.ReactNode }>) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ minHeight: 28, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <AppText variant="heading">{title}</AppText>
        {action}
      </View>
      {children}
    </View>
  );
}
