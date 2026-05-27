import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { AppText } from "@/components/primitives/Text";
import { EmptyState } from "@/components/primitives/StateViews";
import { useTheme } from "@/lib/theme";
import type { ProfilePin } from "@/types/domain";

export function ProfilePins({ pins }: { pins?: ProfilePin[] }) {
  const theme = useTheme();
  if (!pins?.length) return <EmptyState title="Pin up to three items." />;
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {pins.map((pin) => (
        <Pressable
          key={`${pin.type}-${pin.id}`}
          accessibilityRole="button"
          accessibilityLabel={`Open ${pin.title}`}
          onPress={() => router.push(pin.href)}
          style={({ pressed }) => ({
            minHeight: 68,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.md,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <View
            style={{
              width: 44,
              height: 56,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.surfaceMuted,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {pin.posterUrl ? (
              <Image
                source={{ uri: pin.posterUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <AppText variant="caption" muted>
                {pin.type.toUpperCase()}
              </AppText>
            )}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="label" numberOfLines={1}>
              {pin.title}
            </AppText>
            <AppText variant="caption" muted numberOfLines={1}>
              {pin.subtitle || pin.type}
            </AppText>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
