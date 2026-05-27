import { Image } from "expo-image";
import { View } from "react-native";
import { AppText } from "@/components/primitives/Text";
import { tmdbImageUrl } from "@/lib/api-mappers";
import { useTheme } from "@/lib/theme";
import type { ProviderSummary } from "@/types/domain";

export function ProviderChip({
  provider,
  compact = false,
}: {
  provider?: ProviderSummary | null;
  compact?: boolean;
}) {
  const theme = useTheme();
  if (!provider?.name) return null;
  const logoUrl = tmdbImageUrl(provider.logoUrl ?? provider.logoPath, "w500");

  return (
    <View
      accessibilityLabel={`Available on ${provider.name}`}
      style={{
        alignSelf: "flex-start",
        minHeight: compact ? 26 : 30,
        maxWidth: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
        borderRadius: 999,
        paddingVertical: compact ? 3 : 5,
        paddingHorizontal: compact ? theme.spacing.sm : theme.spacing.md,
        backgroundColor: theme.colors.successSoft,
        borderWidth: 1,
        borderColor: theme.mode === "dark" ? "#1F6B3A" : "#BBF7D0",
      }}
    >
      {logoUrl ? (
        <Image
          source={{ uri: logoUrl }}
          style={{ width: 18, height: 18, borderRadius: 4 }}
          contentFit="cover"
        />
      ) : null}
      <AppText
        variant="caption"
        numberOfLines={1}
        style={{ color: theme.colors.success }}
      >
        {provider.name}
      </AppText>
    </View>
  );
}
