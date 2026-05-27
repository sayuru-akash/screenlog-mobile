import { BlurView } from "expo-blur";
import { Eye } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { AppText } from "@/components/primitives/Text";
import { useTheme } from "@/lib/theme";
import {
  getSpoilerLabel,
  type SpoilerKind,
} from "@/components/reviews/spoiler-display";

export function SpoilerCard({
  kind = "review",
  onReveal,
}: {
  kind?: SpoilerKind;
  onReveal: () => void;
}) {
  const theme = useTheme();
  const label = getSpoilerLabel(kind);

  return (
    <View
      accessibilityLabel={`${label}. Reveal to read.`}
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceMuted,
        overflow: "hidden",
      }}
    >
      <View style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
        <View
          style={[
            styles.line,
            {
              width: "82%",
              backgroundColor: theme.colors.faint,
            },
          ]}
        />
        <View
          style={[
            styles.line,
            {
              width: "94%",
              backgroundColor: theme.colors.faint,
            },
          ]}
        />
        <View
          style={[
            styles.line,
            {
              width: "58%",
              backgroundColor: theme.colors.faint,
            },
          ]}
        />
      </View>
      <BlurView
        intensity={28}
        tint={theme.mode === "dark" ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            alignItems: "center",
            justifyContent: "center",
            padding: theme.spacing.md,
            gap: theme.spacing.sm,
            backgroundColor:
              theme.mode === "dark"
                ? "rgba(10,10,10,0.52)"
                : "rgba(255,255,255,0.5)",
          },
        ]}
      >
        <AppText variant="label">{label}</AppText>
        <Button
          variant="secondary"
          icon={<Eye size={16} color={theme.colors.accent} />}
          onPress={onReveal}
        >
          Reveal
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    height: 13,
    borderRadius: 999,
    opacity: 0.24,
  },
});
