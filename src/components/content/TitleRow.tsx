import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { AppText } from "@/components/primitives/Text";
import { ProviderChip } from "./ProviderChip";
import { useTheme } from "@/lib/theme";
import type { TitleSummary } from "@/types/domain";

export function TitleRow({
  item,
  right,
  onPress,
}: {
  item: TitleSummary;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={onPress ?? (() => router.push(`/${item.type}/${item.id}`))}
      style={({ pressed }) => ({
        minHeight: 76,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <View
        style={{
          width: 50,
          height: 68,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.surfaceMuted,
          overflow: "hidden",
        }}
      >
        {item.posterUrl ? (
          <Image
            source={{ uri: item.posterUrl }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : null}
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant="label" numberOfLines={1}>
          {item.title}
        </AppText>
        <AppText variant="caption" muted numberOfLines={2}>
          {item.progressLabel ||
            item.nextLabel ||
            item.runtimeLabel ||
            item.status ||
            item.year ||
            "Watchlog"}
        </AppText>
        <ProviderChip provider={item.provider} compact />
      </View>
      {right ?? <ChevronRight size={18} color={theme.colors.faint} />}
    </Pressable>
  );
}
