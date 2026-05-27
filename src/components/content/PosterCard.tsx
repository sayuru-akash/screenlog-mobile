import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { AppText } from "@/components/primitives/Text";
import { useTheme } from "@/lib/theme";
import type { TitleSummary } from "@/types/domain";

export function PosterCard({ item, compact = false }: { item: TitleSummary; compact?: boolean }) {
  const theme = useTheme();
  const href = `/${item.type}/${item.id}` as const;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={() => router.push(href)}
      style={({ pressed }) => ({
        width: compact ? 132 : 164,
        opacity: pressed ? 0.75 : 1,
        gap: theme.spacing.sm,
      })}
    >
      <View
        style={{
          aspectRatio: 2 / 3,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.surfaceMuted,
          overflow: "hidden",
        }}
      >
        {item.posterUrl ? (
          <Image source={{ uri: item.posterUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        ) : (
          <View style={{ flex: 1, padding: theme.spacing.md, justifyContent: "flex-end" }}>
            <AppText variant="label">{item.title}</AppText>
          </View>
        )}
      </View>
      <View style={{ gap: 2 }}>
        <AppText variant="label" numberOfLines={1}>
          {item.title}
        </AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          {item.progressLabel || item.nextLabel || item.runtimeLabel || item.year || item.status || "Watchlog"}
        </AppText>
      </View>
    </Pressable>
  );
}
