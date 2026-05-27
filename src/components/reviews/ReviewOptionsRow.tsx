import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/primitives/Text";
import { useTheme } from "@/lib/theme";
import type { Visibility } from "@/types/domain";

const VISIBILITY_OPTIONS: Array<{ value: Visibility; label: string }> = [
  { value: "PRIVATE", label: "Private" },
  { value: "FOLLOWERS", label: "Followers" },
  { value: "PUBLIC", label: "Public" },
];

export function ReviewOptionsRow({
  visibility,
  onVisibilityChange,
  spoiler,
  onSpoilerChange,
}: {
  visibility: Visibility;
  onVisibilityChange: (visibility: Visibility) => void;
  spoiler: boolean;
  onSpoilerChange: (spoiler: boolean) => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: theme.spacing.sm,
      }}
    >
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Review visibility"
        style={{
          flexDirection: "row",
          flexGrow: 1,
          flexShrink: 1,
          gap: theme.spacing.xs,
          minWidth: 220,
        }}
      >
        {VISIBILITY_OPTIONS.map((option) => {
          const active = visibility === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} visibility`}
              accessibilityState={{ checked: active }}
              onPress={() => onVisibilityChange(option.value)}
              style={({ pressed }) => ({
                minHeight: 40,
                flex: 1,
                borderRadius: theme.radius.sm,
                borderWidth: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: theme.spacing.sm,
                opacity: pressed ? 0.72 : 1,
                borderColor: active ? theme.colors.accent : theme.colors.border,
                backgroundColor: active
                  ? theme.colors.accentSoft
                  : theme.colors.surface,
              })}
            >
              <AppText
                variant="caption"
                style={{
                  color: active ? theme.colors.accent : theme.colors.text,
                }}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel="Contains spoilers"
        accessibilityState={{ checked: spoiler }}
        onPress={() => onSpoilerChange(!spoiler)}
        style={({ pressed }) => ({
          minHeight: 40,
          borderRadius: theme.radius.sm,
          borderWidth: 1,
          borderColor: spoiler ? theme.colors.accent : theme.colors.border,
          backgroundColor: spoiler
            ? theme.colors.accentSoft
            : theme.colors.surface,
          paddingHorizontal: theme.spacing.md,
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
          opacity: pressed ? 0.72 : 1,
        })}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
            borderColor: spoiler ? theme.colors.accent : theme.colors.faint,
            backgroundColor: spoiler ? theme.colors.accent : "transparent",
          }}
        >
          {spoiler ? <Check size={13} color="#FFFFFF" /> : null}
        </View>
        <AppText
          variant="caption"
          style={{ color: spoiler ? theme.colors.accent : theme.colors.text }}
        >
          Spoilers
        </AppText>
      </Pressable>
    </View>
  );
}
