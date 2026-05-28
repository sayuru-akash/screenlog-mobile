import { useState } from "react";
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { Modal, Pressable, View } from "react-native";
import { AppText } from "@/components/primitives/Text";
import { initials } from "@/lib/format";
import { useTheme } from "@/lib/theme";
import type { ProfileAvatarCandidate } from "@/types/domain";

export function AvatarCandidateSheet({
  visible,
  candidates,
  selectedId,
  onClose,
  onSelect,
}: {
  visible: boolean;
  candidates: ProfileAvatarCandidate[];
  selectedId: string | null;
  onClose: () => void;
  onSelect: (candidate: ProfileAvatarCandidate) => void;
}) {
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close avatar picker"
        onPress={onClose}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor:
            theme.mode === "dark" ? "rgba(0,0,0,0.52)" : "rgba(0,0,0,0.2)",
        }}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            maxHeight: "78%",
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.lg,
            gap: theme.spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="heading">Choose avatar</AppText>
              <AppText variant="caption" muted>
                Cast portraits from your featured pin.
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close avatar picker"
              onPress={onClose}
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.surfaceMuted,
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <X size={18} color={theme.colors.text} />
            </Pressable>
          </View>
          <View style={{ gap: theme.spacing.sm }}>
            {candidates.map((candidate) => (
              <AvatarCandidateRow
                key={candidate.id}
                candidate={candidate}
                loading={selectedId === candidate.id}
                disabled={Boolean(selectedId)}
                onPress={() => onSelect(candidate)}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Use ${candidate.name} as profile avatar`}
      disabled={disabled && !loading}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 72,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: loading ? theme.colors.accent : theme.colors.border,
        backgroundColor: theme.colors.surfaceMuted,
        padding: theme.spacing.md,
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
          {candidate.name}
        </AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          {candidate.character || candidate.sourceTitle || "Featured cast"}
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
          {loading ? "Saving" : candidate.gender}
        </AppText>
      </View>
    </Pressable>
  );
}
