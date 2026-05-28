import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Pin } from "lucide-react-native";
import { AppText } from "@/components/primitives/Text";
import { EmptyState } from "@/components/primitives/StateViews";
import { useTheme } from "@/lib/theme";
import type { ProfilePin } from "@/types/domain";

export function ProfilePins({ pins }: { pins?: ProfilePin[] }) {
  const theme = useTheme();
  const pin = pins?.[0];
  if (!pin) return <EmptyState title="Feature a favorite title or list." />;
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
        <AppText variant="heading">Featured pin</AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${pin.title}`}
        onPress={() => router.push(pin.href)}
        style={({ pressed }) => ({
          minHeight: 214,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          overflow: "hidden",
          opacity: pressed ? 0.72 : 1,
        })}
      >
        <View
          style={{
            minHeight: 214,
            justifyContent: "flex-end",
            backgroundColor: theme.colors.surfaceMuted,
          }}
        >
          <ProfilePinImage pin={pin} />
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: theme.spacing.lg,
              gap: theme.spacing.sm,
              backgroundColor:
                theme.mode === "dark"
                  ? "rgba(0,0,0,0.56)"
                  : "rgba(255,255,255,0.82)",
            }}
          >
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
            <AppText variant="heading" numberOfLines={2}>
              {pin.title}
            </AppText>
            <AppText variant="caption" muted numberOfLines={1}>
              {pin.subtitle || "Featured on profile"}
            </AppText>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function ProfilePinImage({ pin }: { pin: ProfilePin }) {
  if (pin.posterUrl) {
    return (
      <Image
        source={{ uri: pin.posterUrl }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppText variant="caption" muted>
        {pin.type.toUpperCase()}
      </AppText>
    </View>
  );
}
