import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { Animated, Pressable, View } from "react-native";
import { AppText } from "@/components/primitives/Text";
import { avatarCandidateCopy } from "@/features/profile/avatar";
import { initials } from "@/lib/format";
import { useTheme } from "@/lib/theme";
import type { ProfileAvatarCandidate } from "@/types/domain";

export function AvatarCandidateSheet({
  visible,
  candidates,
  selectedId,
  onSelect,
}: {
  visible: boolean;
  candidates: ProfileAvatarCandidate[];
  selectedId: string | null;
  onSelect: (candidate: ProfileAvatarCandidate) => void;
}) {
  const theme = useTheme();
  const [reveal] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) {
      reveal.setValue(0);
      return;
    }
    Animated.timing(reveal, {
      toValue: 1,
      duration: 170,
      useNativeDriver: false,
    }).start();
  }, [reveal, visible]);

  if (!visible) return null;

  return (
    <Animated.View
      accessibilityRole="menu"
      style={{
        opacity: reveal,
        transform: [
          {
            translateY: reveal.interpolate({
              inputRange: [0, 1],
              outputRange: [-6, 0],
            }),
          },
        ],
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.xs,
        gap: theme.spacing.xs,
        shadowColor: "#000000",
        shadowOpacity: theme.mode === "dark" ? 0.34 : 0.12,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -7,
          left: 30,
          width: 14,
          height: 14,
          borderLeftWidth: 1,
          borderTopWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          transform: [{ rotate: "45deg" }],
        }}
      />
      <View style={{ padding: theme.spacing.sm, gap: 2 }}>
        <AppText variant="label">Choose profile picture</AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          From your featured pin
        </AppText>
      </View>
      {candidates.map((candidate) => (
        <AvatarCandidateRow
          key={candidate.id}
          candidate={candidate}
          loading={selectedId === candidate.id}
          disabled={Boolean(selectedId)}
          onPress={() => onSelect(candidate)}
        />
      ))}
    </Animated.View>
  );
}

function AvatarCandidateRow({
  candidate,
  loading,
  disabled,
  onPress,
}: {
  candidate: ProfileAvatarCandidate;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = candidate.image && !imageFailed;
  const copy = avatarCandidateCopy(candidate);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Use ${candidate.name} as profile avatar`}
      disabled={disabled && !loading}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 64,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        borderRadius: theme.radius.sm,
        backgroundColor:
          pressed || loading ? theme.colors.surfaceMuted : "transparent",
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        opacity: disabled && !loading ? 0.48 : pressed ? 0.72 : 1,
      })}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: theme.colors.accent,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {showImage ? (
          <Image
            source={{ uri: candidate.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <AppText variant="label" style={{ color: "#FFFFFF" }}>
            {initials(candidate.name)}
          </AppText>
        )}
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant="label" numberOfLines={1}>
          {copy.title}
        </AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          {copy.subtitle}
        </AppText>
      </View>
      <View
        style={{
          borderRadius: 999,
          backgroundColor: theme.colors.accentSoft,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 3,
        }}
      >
        <AppText
          variant="caption"
          style={{
            color: theme.colors.accent,
            fontWeight: "700",
            textTransform: "capitalize",
          }}
        >
          {loading ? "Saving" : copy.label}
        </AppText>
      </View>
      <ChevronRight size={16} color={theme.colors.faint} />
    </Pressable>
  );
}
