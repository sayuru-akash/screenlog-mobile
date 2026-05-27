import { router } from "expo-router";
import { View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import { AppText } from "@/components/primitives/Text";
import { useTheme } from "@/lib/theme";

export default function OnboardingScreen() {
  const theme = useTheme();
  return (
    <Screen title="Setup" subtitle="Pick the basics now. Change them anytime.">
      <Section title="Region">
        <AppText muted>
          Default region is used for streaming availability.
        </AppText>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          {["US", "LK", "GB"].map((region) => (
            <Button key={region} variant="ghost">
              {region}
            </Button>
          ))}
        </View>
      </Section>
      <Section title="Providers">
        <AppText muted>Choose services in Settings after sign in.</AppText>
      </Section>
      <Button onPress={() => router.replace("/(tabs)")}>Continue</Button>
    </Screen>
  );
}
