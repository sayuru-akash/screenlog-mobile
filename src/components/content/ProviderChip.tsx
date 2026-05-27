import { Image } from "expo-image";
import { View } from "react-native";
import { AppText } from "@/components/primitives/Text";
import { tmdbImageUrl } from "@/lib/api-mappers";
import { useTheme } from "@/lib/theme";
import type { ProviderSummary } from "@/types/domain";

export function ProviderChip({
  provider,
  label,
  available,
  hasAny,
  compact = false,
}: {
  provider?: ProviderSummary | null;
  label?: string | null;
  available?: boolean;
  hasAny?: boolean;
  compact?: boolean;
}) {
  const theme = useTheme();
  const text =
    label ??
    (provider?.name
      ? `${available === false ? "" : "On "}${provider.name}`
      : null);
  if (!text) return null;
  const logoUrl = tmdbImageUrl(provider?.logoUrl ?? provider?.logoPath, "w500");
  const success = available !== false && (available || provider);

  return (
    <View
      accessibilityLabel={text}
      style={{
        alignSelf: "flex-start",
        minHeight: compact ? 26 : 30,
        maxWidth: "100%",
        minWidth: 0,
        flexShrink: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
        borderRadius: 999,
        paddingVertical: compact ? 3 : 5,
        paddingHorizontal: compact ? theme.spacing.sm : theme.spacing.md,
        backgroundColor: success
          ? theme.colors.successSoft
          : theme.colors.surfaceMuted,
        borderWidth: 1,
        borderColor: success
          ? theme.mode === "dark"
            ? "#1F6B3A"
            : "#BBF7D0"
          : theme.colors.border,
      }}
    >
      {logoUrl && success ? (
        <Image
          source={{ uri: logoUrl }}
          style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0 }}
          contentFit="cover"
        />
      ) : null}
      <AppText
        variant="caption"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          color: success
            ? theme.colors.success
            : hasAny
              ? theme.colors.muted
              : theme.colors.faint,
          flexShrink: 1,
          minWidth: 0,
          maxWidth: compact ? 128 : 220,
        }}
      >
        {text}
      </AppText>
    </View>
  );
}
