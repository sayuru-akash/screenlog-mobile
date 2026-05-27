import { Pressable, StyleSheet, View } from "react-native";
import { Star } from "lucide-react-native";
import { AppText } from "@/components/primitives/Text";
import { useTheme } from "@/lib/theme";
import {
  backendRatingToStars,
  formatStarsFromBackend,
} from "@/features/reviews/rating";

const DISPLAY_STAR_SIZE = 14;
const DISPLAY_STAR_GAP = 2;
const INPUT_STAR_SIZE = 28;
const INPUT_STAR_GAP = 8;

export function StarRatingDisplay({ rating }: { rating?: number | null }) {
  const theme = useTheme();
  const stars = backendRatingToStars(rating) ?? 0;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
      }}
    >
      <StarFillTrack
        value={stars}
        size={DISPLAY_STAR_SIZE}
        gap={DISPLAY_STAR_GAP}
        fillColor={theme.colors.warning}
        emptyColor={theme.colors.faint}
      />
      <AppText variant="caption" muted>
        {formatStarsFromBackend(rating)}
      </AppText>
    </View>
  );
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const theme = useTheme();
  const currentValue = value ?? 0;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        <AppText variant="label">Rating</AppText>
        <AppText variant="caption" muted>
          {value ? `${value}/5` : "Not rated"}
        </AppText>
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Rating"
        style={{
          flexDirection: "row",
          gap: INPUT_STAR_GAP,
          minHeight: 48,
          alignItems: "center",
        }}
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;
          const active = currentValue >= starValue;
          return (
            <Pressable
              key={starValue}
              accessibilityRole="radio"
              accessibilityLabel={`Set rating to ${starValue} out of 5`}
              accessibilityState={{ checked: currentValue === starValue }}
              hitSlop={8}
              onPress={() =>
                onChange(currentValue === starValue ? null : starValue)
              }
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: 21,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
                backgroundColor: active
                  ? theme.colors.accentSoft
                  : theme.colors.surfaceMuted,
                transform: [{ scale: pressed ? 0.94 : 1 }],
              })}
            >
              <Star
                size={INPUT_STAR_SIZE}
                color={active ? theme.colors.accent : theme.colors.faint}
                fill={active ? theme.colors.accent : "transparent"}
                strokeWidth={2}
              />
            </Pressable>
          );
        })}
      </View>
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear rating"
          onPress={() => onChange(null)}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <AppText variant="caption" muted>
            Clear rating
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

function StarFillTrack({
  value,
  size,
  gap,
  fillColor,
  emptyColor,
}: {
  value: number;
  size: number;
  gap: number;
  fillColor: string;
  emptyColor: string;
}) {
  const width = size * 5 + gap * 4;
  const filledStars = Math.max(0, Math.min(5, Math.round(value)));
  const clippedWidth =
    filledStars === 0 ? 0 : filledStars * size + (filledStars - 1) * gap;

  return (
    <View style={[styles.track, { width, height: size }]}>
      <StarRow size={size} gap={gap} color={emptyColor} fill="transparent" />
      <View
        pointerEvents="none"
        style={[styles.fillClip, { height: size, width: clippedWidth }]}
      >
        <StarRow size={size} gap={gap} color={fillColor} fill={fillColor} />
      </View>
    </View>
  );
}

function StarRow({
  size,
  gap,
  color,
  fill,
}: {
  size: number;
  gap: number;
  color: string;
  fill: string;
}) {
  return (
    <View style={{ flexDirection: "row", gap }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          color={color}
          fill={fill}
          strokeWidth={2}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: "relative",
  },
  fillClip: {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "hidden",
  },
});
