import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Pin } from "lucide-react-native";
import { AppText } from "@/components/primitives/Text";
import { EmptyState } from "@/components/primitives/StateViews";
import { useListQuery } from "@/features/lists/queries";
import { useTheme } from "@/lib/theme";
import type { ProfilePin } from "@/types/domain";

export function ProfilePins({ pins }: { pins?: ProfilePin[] }) {
  const theme = useTheme();
  if (!pins?.length) return <EmptyState title="Pin up to three items." />;
  return (
    <View style={{ gap: theme.spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
        }}
      >
        <Pin size={17} color={theme.colors.accent} />
        <AppText variant="heading">Pinned</AppText>
      </View>
      {pins.map((pin, index) => (
        <Pressable
          key={`${pin.type}-${pin.id}-${index}`}
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
            <ProfilePinImage pin={pin} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <View
              style={{
                alignSelf: "flex-start",
                borderRadius: 999,
                backgroundColor: theme.colors.accentSoft,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 2,
              }}
            >
              <AppText
                variant="caption"
                style={{
                  color: theme.colors.accent,
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                {pin.type}
              </AppText>
            </View>
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

function ProfilePinImage({ pin }: { pin: ProfilePin }) {
  const theme = useTheme();
  if (pin.posterUrl) {
    return (
      <Image
        source={{ uri: pin.posterUrl }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
      />
    );
  }

  if (pin.type === "list") {
    return <PinnedListImage pin={pin} />;
  }

  return (
    <AppText variant="caption" muted>
      {pin.type.toUpperCase()}
    </AppText>
  );
}

function PinnedListImage({ pin }: { pin: ProfilePin }) {
  const list = useListQuery(pin.id);
  const cover = list.data?.covers?.[0];
  if (cover) {
    return (
      <Image
        source={{ uri: cover }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
      />
    );
  }

  return (
    <AppText variant="caption" muted>
      LIST
    </AppText>
  );
}
