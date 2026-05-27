import { useState } from "react";
import { Switch, TextInput, View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import { ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { useSaveSettingsMutation, useSettingsQuery } from "@/features/settings/queries";
import { useTheme } from "@/lib/theme";
import type { SettingsPayload } from "@/types/domain";

export default function SettingsScreen() {
  const theme = useTheme();
  const settings = useSettingsQuery();
  const save = useSaveSettingsMutation();
  const [draft, setDraft] = useState<SettingsPayload>({});
  const preferences = settings.data?.preferences ?? {};
  const mergedDraft: SettingsPayload = {
    theme: "system",
    region: "US",
    timezone: "Asia/Colombo",
    ...preferences,
    ...draft,
  };

  return (
    <Screen title="Settings" subtitle="Account, providers, visibility.">
      {settings.isLoading ? <LoadingState label="Loading settings" /> : null}
      {settings.isError ? <ErrorState message={settings.error.message} onRetry={() => void settings.refetch()} /> : null}
      <Section title="Profile">
        <Input label="Username" value={mergedDraft.username ?? ""} onChangeText={(username) => setDraft((value) => ({ ...value, username }))} />
        <Input label="Bio" value={mergedDraft.bio ?? ""} onChangeText={(bio) => setDraft((value) => ({ ...value, bio }))} />
      </Section>
      <Section title="Region">
        <Input label="Country" value={mergedDraft.region ?? ""} autoCapitalize="characters" onChangeText={(region) => setDraft((value) => ({ ...value, region }))} />
        <Input label="Timezone" value={mergedDraft.timezone ?? ""} onChangeText={(timezone) => setDraft((value) => ({ ...value, timezone }))} />
      </Section>
      <Section title="Appearance">
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText>Dark mode</AppText>
          <Switch
            value={mergedDraft.theme === "dark"}
            onValueChange={(dark) => setDraft((value) => ({ ...value, theme: dark ? "dark" : "system" }))}
          />
        </View>
      </Section>
      {save.isError ? <AppText style={{ color: theme.colors.danger }}>{save.error.message}</AppText> : null}
      <Button loading={save.isPending} onPress={() => save.mutate(mergedDraft)}>
        Save Settings
      </Button>
    </Screen>
  );
}

function Input(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const theme = useTheme();
  const { label, ...inputProps } = props;
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        style={{
          minHeight: 48,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
          paddingHorizontal: theme.spacing.md,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
          fontSize: 16,
        }}
        {...inputProps}
      />
    </View>
  );
}
