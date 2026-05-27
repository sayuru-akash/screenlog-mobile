import { useEffect, useMemo } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Star } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
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
  const width = useMemo(() => INPUT_STAR_SIZE * 5 + INPUT_STAR_GAP * 4, []);
  const updateFromLocation = (event: GestureResponderEvent) => {
    const x = Math.max(0, Math.min(width, event.nativeEvent.locationX));
    const next = Math.max(0.5, Math.min(5, Math.ceil((x / width) * 10) / 2));
    onChange(next);
  };

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
          {value
            ? `${Number.isInteger(value) ? value : value.toFixed(1)}/5`
            : "Not rated"}
        </AppText>
      </View>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Rating"
        accessibilityValue={{
          text: value
            ? `${Number.isInteger(value) ? value : value.toFixed(1)} out of 5`
            : "Not rated",
        }}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment") {
            onChange(Math.min(5, (value ?? 0) + 0.5));
          }
          if (event.nativeEvent.actionName === "decrement") {
            const next = Math.max(0, (value ?? 0) - 0.5);
            onChange(next > 0 ? next : null);
          }
        }}
        accessibilityActions={[
          { name: "increment", label: "Increase rating" },
          { name: "decrement", label: "Decrease rating" },
        ]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={updateFromLocation}
        onResponderMove={updateFromLocation}
        style={{
          width,
          minHeight: 48,
          justifyContent: "center",
        }}
      >
        <StarFillTrack
          value={currentValue}
          size={INPUT_STAR_SIZE}
          gap={INPUT_STAR_GAP}
          fillColor={theme.colors.accent}
          emptyColor={theme.colors.faint}
          animated
        />
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
  animated = false,
}: {
  value: number;
  size: number;
  gap: number;
  fillColor: string;
  emptyColor: string;
  animated?: boolean;
}) {
  const progress = useSharedValue(value);
  const width = size * 5 + gap * 4;

  useEffect(() => {
    progress.value = animated
      ? withSpring(value, { damping: 18, stiffness: 220 })
      : value;
  }, [animated, progress, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: (Math.max(0, Math.min(5, progress.value)) / 5) * width,
  }));

  return (
    <View style={[styles.track, { width, height: size }]}>
      <StarRow size={size} gap={gap} color={emptyColor} fill="transparent" />
      <Animated.View
        pointerEvents="none"
        style={[styles.fillClip, { height: size }, animatedStyle]}
      >
        <StarRow size={size} gap={gap} color={fillColor} fill={fillColor} />
      </Animated.View>
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
