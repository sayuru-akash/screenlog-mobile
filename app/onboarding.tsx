import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  type LayoutChangeEvent,
  ScrollView,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import appIcon from "../assets/icon.png";
import providersArt from "../assets/onboarding/providers.png";
import socialArt from "../assets/onboarding/social.png";
import watchQueueArt from "../assets/onboarding/watch-queue.png";
import { Button } from "@/components/primitives/Button";
import { AppText } from "@/components/primitives/Text";
import { useTheme } from "@/lib/theme";

const slides = [
  {
    eyebrow: "Your next watch",
    title: "Keep every show and movie moving.",
    body: "Track progress, favourites, rewatches, reviews, and lists without turning your queue into work.",
    art: watchQueueArt,
  },
  {
    eyebrow: "Where it streams",
    title: "See availability around your services.",
    body: "Set your region and providers once, then let Watchlog surface the best place to continue.",
    art: providersArt,
  },
  {
    eyebrow: "Taste and friends",
    title: "Build a profile that shows what you watch.",
    body: "Pin favourites, follow friends, share public reviews, and keep private logs private.",
    art: socialArt,
  },
] as const;

export default function OnboardingScreen() {
  const theme = useTheme();
  const { height, width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [pagerWidth, setPagerWidth] = useState(width);
  const slideWidth = Math.max(1, pagerWidth);
  const artSize = Math.round(
    Math.min(400, Math.max(280, slideWidth * 0.82, height * 0.34)),
  );
  const compactHeight = height < 760;
  const isLast = index === slides.length - 1;
  const progressUnits = index + 1;
  const remainingProgressUnits = slides.length - progressUnits;

  const updateIndexFromOffset = (offsetX: number) => {
    const nextIndex = Math.round(offsetX / slideWidth);
    setIndex(Math.max(0, Math.min(slides.length - 1, nextIndex)));
  };

  const handlePagerLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== pagerWidth) {
      setPagerWidth(nextWidth);
    }
  };

  const goNext = () => {
    if (isLast) {
      router.replace("/(auth)/sign-up");
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    scrollRef.current?.scrollTo({
      x: slideWidth * nextIndex,
      animated: true,
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    updateIndexFromOffset(event.nativeEvent.contentOffset.x);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          flex: 1,
          paddingTop: compactHeight ? theme.spacing.md : theme.spacing.lg,
          paddingBottom: theme.spacing.md,
        }}
      >
        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: compactHeight ? theme.spacing.sm : theme.spacing.md,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 999,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Image
              source={appIcon}
              style={{ width: 34, height: 34, borderRadius: 8 }}
              contentFit="cover"
              accessibilityLabel="Watchlog"
            />
            <AppText
              style={{
                fontSize: 24,
                lineHeight: 30,
                fontWeight: "800",
              }}
            >
              Watchlog
            </AppText>
          </View>
        </View>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onLayout={handlePagerLayout}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScroll}
          onScrollEndDrag={handleScroll}
          scrollEventThrottle={32}
          style={{ flex: 1 }}
        >
          {slides.map((slide) => (
            <View
              key={slide.title}
              style={{
                width: slideWidth,
                flex: 1,
                paddingHorizontal: theme.spacing.lg,
                justifyContent: "center",
                gap: compactHeight ? theme.spacing.md : theme.spacing.xl,
                paddingTop: theme.spacing.sm,
                paddingBottom: theme.spacing.md,
              }}
            >
              <View
                style={{
                  height: artSize,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={slide.art}
                  style={{
                    width: artSize,
                    height: artSize,
                    aspectRatio: 1,
                  }}
                  contentFit="contain"
                  transition={180}
                  accessibilityLabel=""
                />
              </View>
              <View style={{ gap: theme.spacing.sm }}>
                <AppText
                  variant="caption"
                  style={{
                    color: theme.colors.accent,
                    textTransform: "uppercase",
                  }}
                >
                  {slide.eyebrow}
                </AppText>
                <AppText variant="title">{slide.title}</AppText>
                <AppText muted style={{ fontSize: 17, lineHeight: 25 }}>
                  {slide.body}
                </AppText>
              </View>
            </View>
          ))}
        </ScrollView>
        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: theme.spacing.lg,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 7,
                overflow: "hidden",
                borderRadius: 999,
                backgroundColor: theme.colors.surfaceMuted,
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flex: progressUnits,
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: theme.colors.accent,
                }}
              />
              {remainingProgressUnits > 0 ? (
                <View style={{ flex: remainingProgressUnits }} />
              ) : null}
            </View>
            <AppText
              variant="caption"
              style={{
                minWidth: 40,
                textAlign: "right",
                color: theme.colors.text,
                fontWeight: "700",
              }}
            >
              {index + 1} of {slides.length}
            </AppText>
          </View>
          <Button
            onPress={goNext}
            icon={<ChevronRight size={16} color="#FFFFFF" />}
          >
            {isLast ? "Create Account" : "Continue"}
          </Button>
          <Button
            variant="ghost"
            onPress={() => router.replace("/(auth)/sign-in")}
          >
            I already have an account
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
