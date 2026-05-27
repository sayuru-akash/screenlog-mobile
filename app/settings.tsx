import { useState } from "react";
import { Switch, TextInput, View } from "react-native";
import { Button } from "@/components/primitives/Button";
import { Screen } from "@/components/primitives/Screen";
import { Section } from "@/components/primitives/Section";
import { ErrorState, LoadingState } from "@/components/primitives/StateViews";
import { AppText } from "@/components/primitives/Text";
import { requestAccountDeletion } from "@/features/auth/actions";
import {
  useNotificationSettingsQuery,
  useProvidersQuery,
  useSaveNotificationSettingsMutation,
  useSaveProvidersMutation,
  useSaveSettingsMutation,
  useSettingsQuery,
} from "@/features/settings/queries";
import { useTheme } from "@/lib/theme";
import type {
  NotificationSettingsPayload,
  ProviderSettingsPayload,
  SettingsPayload,
  Visibility,
} from "@/types/domain";

const visibilityOptions: Array<{ label: string; value: Visibility }> = [
  { label: "Private", value: "PRIVATE" },
  { label: "Followers", value: "FOLLOWERS" },
  { label: "Public", value: "PUBLIC" },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const settings = useSettingsQuery();
  const notificationSettings = useNotificationSettingsQuery();
  const providers = useProvidersQuery(
    settings.data?.preferences?.region ?? "US",
  );
  const save = useSaveSettingsMutation();
  const saveNotifications = useSaveNotificationSettingsMutation();
  const saveProviders = useSaveProvidersMutation();
  const [draft, setDraft] = useState<SettingsPayload>({});
  const [notificationDraft, setNotificationDraft] = useState<
    Partial<NotificationSettingsPayload>
  >({});
  const [providerDraft, setProviderDraft] = useState<
    Partial<ProviderSettingsPayload>
  >({});
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const preferences = settings.data?.preferences ?? {};
  const mergedDraft: SettingsPayload = {
    theme: "system",
    region: "US",
    timezone: "Asia/Colombo",
    ...preferences,
    ...draft,
  };
  const mergedNotifications: NotificationSettingsPayload = {
    inAppEnabled: true,
    newEpisodeAlerts: true,
    seasonPremiereAlerts: true,
    staleWatchlistReminders: true,
    staleWatchlistDays: 21,
    ...notificationSettings.data,
    ...notificationDraft,
  };
  const mergedProviders: ProviderSettingsPayload = {
    region: mergedDraft.region || "US",
    providerIds: [],
    streamingTypes: ["FLATRATE", "FREE"],
    ...providerDraft,
  };

  return (
    <Screen title="Settings" subtitle="Account, providers, visibility.">
      {settings.isLoading ? <LoadingState label="Loading settings" /> : null}
      {settings.isError ? (
        <ErrorState
          message={settings.error.message}
          onRetry={() => void settings.refetch()}
        />
      ) : null}
      <Section title="Profile">
        <Input
          label="Username"
          value={mergedDraft.username ?? ""}
          onChangeText={(username) =>
            setDraft((value) => ({ ...value, username }))
          }
        />
        <Input
          label="Bio"
          value={mergedDraft.bio ?? ""}
          onChangeText={(bio) => setDraft((value) => ({ ...value, bio }))}
        />
        <VisibilityPicker
          label="Profile visibility"
          value={mergedDraft.profileVisibility ?? "PRIVATE"}
          onChange={(profileVisibility) =>
            setDraft((value) => ({ ...value, profileVisibility }))
          }
        />
      </Section>
      <Section title="Region">
        <Input
          label="Country"
          value={mergedDraft.region ?? ""}
          autoCapitalize="characters"
          onChangeText={(region) => setDraft((value) => ({ ...value, region }))}
        />
        <Input
          label="Timezone"
          value={mergedDraft.timezone ?? ""}
          onChangeText={(timezone) =>
            setDraft((value) => ({ ...value, timezone }))
          }
        />
      </Section>
      <Section title="Appearance">
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <AppText>Dark mode</AppText>
          <Switch
            value={mergedDraft.theme === "dark"}
            onValueChange={(dark) =>
              setDraft((value) => ({
                ...value,
                theme: dark ? "dark" : "system",
              }))
            }
          />
        </View>
      </Section>
      <Section title="Defaults">
        <VisibilityPicker
          label="Logs"
          value={mergedDraft.defaultLogVisibility ?? "PRIVATE"}
          onChange={(defaultLogVisibility) =>
            setDraft((value) => ({ ...value, defaultLogVisibility }))
          }
        />
        <VisibilityPicker
          label="Lists"
          value={mergedDraft.defaultListVisibility ?? "PRIVATE"}
          onChange={(defaultListVisibility) =>
            setDraft((value) => ({ ...value, defaultListVisibility }))
          }
        />
      </Section>
      {save.isError ? (
        <AppText style={{ color: theme.colors.danger }}>
          {save.error.message}
        </AppText>
      ) : null}
      <Button loading={save.isPending} onPress={() => save.mutate(mergedDraft)}>
        Save Settings
      </Button>
      <Section title="Notifications">
        {(
          [
            ["inAppEnabled", "In-app"],
            ["newEpisodeAlerts", "New episodes"],
            ["seasonPremiereAlerts", "Season premieres"],
            ["staleWatchlistReminders", "Quiet reminders"],
          ] satisfies Array<[keyof NotificationSettingsPayload, string]>
        ).map(([key, label]) => (
          <View
            key={key}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText>{label}</AppText>
            <Switch
              value={Boolean(
                mergedNotifications[key as keyof NotificationSettingsPayload],
              )}
              onValueChange={(enabled) =>
                setNotificationDraft((value) => ({
                  ...value,
                  [key]: enabled,
                }))
              }
            />
          </View>
        ))}
        <Input
          label="Reminder days"
          value={String(mergedNotifications.staleWatchlistDays)}
          keyboardType="number-pad"
          onChangeText={(staleWatchlistDays) =>
            setNotificationDraft((value) => ({
              ...value,
              staleWatchlistDays: Number.parseInt(staleWatchlistDays, 10) || 21,
            }))
          }
        />
        {saveNotifications.isError ? (
          <AppText style={{ color: theme.colors.danger }}>
            {saveNotifications.error.message}
          </AppText>
        ) : null}
        <Button
          loading={saveNotifications.isPending}
          onPress={() => saveNotifications.mutate(mergedNotifications)}
        >
          Save Notifications
        </Button>
      </Section>
      <Section title="Providers">
        <AppText muted>
          {providers.data?.providers?.length ?? 0} services available for{" "}
          {mergedProviders.region}.
        </AppText>
        <Input
          label="Provider IDs"
          value={mergedProviders.providerIds.join(",")}
          placeholder="8,9,337"
          onChangeText={(providerIds) =>
            setProviderDraft((value) => ({
              ...value,
              providerIds: providerIds
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean),
            }))
          }
        />
        {saveProviders.isError ? (
          <AppText style={{ color: theme.colors.danger }}>
            {saveProviders.error.message}
          </AppText>
        ) : null}
        <Button
          loading={saveProviders.isPending}
          onPress={() => saveProviders.mutate(mergedProviders)}
        >
          Save Providers
        </Button>
      </Section>
      <Section title="Account">
        <AppText muted>Deletion requires email confirmation.</AppText>
        {deleteMessage ? (
          <AppText style={{ color: theme.colors.danger }}>
            {deleteMessage}
          </AppText>
        ) : null}
        {!deleteArmed ? (
          <Button variant="danger" onPress={() => setDeleteArmed(true)}>
            Delete Account
          </Button>
        ) : (
          <View style={{ gap: theme.spacing.sm }}>
            <Button
              variant="danger"
              onPress={() =>
                void requestAccountDeletion()
                  .then(() => {
                    setDeleteMessage("Check your email to confirm deletion.");
                    setDeleteArmed(false);
                  })
                  .catch((error: unknown) => {
                    setDeleteMessage(
                      error instanceof Error
                        ? error.message
                        : "Deletion request failed",
                    );
                  })
              }
            >
              Confirm Deletion
            </Button>
            <Button variant="ghost" onPress={() => setDeleteArmed(false)}>
              Cancel
            </Button>
          </View>
        )}
      </Section>
    </Screen>
  );
}

function VisibilityPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Visibility;
  onChange: (value: Visibility) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label">{label}</AppText>
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        {visibilityOptions.map((option) => (
          <View key={option.value} style={{ flex: 1 }}>
            <Button
              variant={value === option.value ? "secondary" : "ghost"}
              onPress={() => onChange(option.value)}
            >
              {option.label}
            </Button>
          </View>
        ))}
      </View>
    </View>
  );
}

function Input(
  props: React.ComponentProps<typeof TextInput> & { label: string },
) {
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
