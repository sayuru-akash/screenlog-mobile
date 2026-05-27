import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Switch, TextInput, View } from "react-native";
import { Image } from "expo-image";
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
import { tmdbImageUrl } from "@/lib/api-mappers";
import { useThemePreferenceStore } from "@/lib/theme";
import type {
  NotificationSettingsPayload,
  ProviderSummary,
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
  const { section } = useLocalSearchParams<{ section?: string }>();
  const focusedSection =
    section === "profile" || section === "notifications" ? section : null;
  const showUserSettings = !focusedSection || focusedSection === "profile";
  const showNotificationSettings =
    !focusedSection || focusedSection === "notifications";
  const showAppSettings = !focusedSection;
  const needsSettings = showUserSettings || showAppSettings;
  const setThemePreference = useThemePreferenceStore(
    (state) => state.setPreference,
  );
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
    providerIds: providers.data?.selectedProviderIds ?? [],
    streamingTypes: providers.data?.streamingTypes ?? ["FLATRATE", "FREE"],
    ...providerDraft,
  };

  useEffect(() => {
    if (mergedDraft.theme) setThemePreference(mergedDraft.theme);
  }, [mergedDraft.theme, setThemePreference]);

  return (
    <Screen
      back
      title={
        focusedSection === "profile"
          ? "User Settings"
          : focusedSection === "notifications"
            ? "Notification Settings"
            : "Settings"
      }
      subtitle={
        focusedSection === "profile"
          ? "Profile and visibility."
          : focusedSection === "notifications"
            ? "Alerts and reminders."
            : "Account, providers, visibility."
      }
    >
      {needsSettings && settings.isLoading ? (
        <LoadingState label="Loading settings" />
      ) : null}
      {needsSettings && settings.isError ? (
        <ErrorState
          message={settings.error.message}
          onRetry={() => void settings.refetch()}
        />
      ) : null}
      {showUserSettings ? (
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
      ) : null}
      {showAppSettings ? (
        <>
          <Section title="Region">
            <Input
              label="Country"
              value={mergedDraft.region ?? ""}
              autoCapitalize="characters"
              onChangeText={(region) =>
                setDraft((value) => ({ ...value, region }))
              }
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
            <SegmentedOptions
              value={mergedDraft.theme ?? "system"}
              options={[
                ["system", "System"],
                ["light", "Light"],
                ["dark", "Dark"],
              ]}
              onChange={(themeValue) => {
                setThemePreference(themeValue);
                setDraft((value) => ({ ...value, theme: themeValue }));
              }}
            />
          </Section>
        </>
      ) : null}
      {showUserSettings ? (
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
      ) : null}
      {showUserSettings || showAppSettings ? (
        <>
          {save.isError ? (
            <AppText style={{ color: theme.colors.danger }}>
              {save.error.message}
            </AppText>
          ) : null}
          <Button
            loading={save.isPending}
            onPress={() => save.mutate(mergedDraft)}
          >
            Save Settings
          </Button>
        </>
      ) : null}
      {showNotificationSettings ? (
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
                staleWatchlistDays:
                  Number.parseInt(staleWatchlistDays, 10) || 21,
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
      ) : null}
      {showAppSettings ? (
        <Section title="Providers">
          {providers.isLoading ? (
            <LoadingState label="Loading services" />
          ) : null}
          {providers.isError ? (
            <ErrorState
              message={providers.error.message}
              onRetry={() => void providers.refetch()}
            />
          ) : null}
          <AppText muted>
            {providers.data?.providers?.length ?? 0} services for{" "}
            {providers.data?.catalogRegion ?? mergedProviders.region}
            {providers.data?.isFallbackCatalog ? " fallback catalog" : ""}.
          </AppText>
          <ProviderPicker
            providerIds={mergedProviders.providerIds}
            providers={providers.data?.providers ?? []}
            onChange={(providerIds) =>
              setProviderDraft((value) => ({ ...value, providerIds }))
            }
          />
          <SegmentedOptions
            valueSet={new Set(mergedProviders.streamingTypes)}
            options={[
              ["FLATRATE", "Included"],
              ["FREE", "Free"],
              ["ADS", "Ads"],
              ["RENT", "Rent"],
              ["BUY", "Buy"],
            ]}
            multi
            onToggle={(streamingType) =>
              setProviderDraft((value) => {
                const current = new Set(
                  value.streamingTypes ?? mergedProviders.streamingTypes,
                );
                if (current.has(streamingType)) current.delete(streamingType);
                else current.add(streamingType);
                return {
                  ...value,
                  streamingTypes: Array.from(current).length
                    ? Array.from(current)
                    : ["FLATRATE"],
                };
              })
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
      ) : null}
      {showAppSettings ? (
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
      ) : null}
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

function SegmentedOptions<TValue extends string>({
  value,
  valueSet,
  options,
  multi,
  onChange,
  onToggle,
}: {
  value?: TValue;
  valueSet?: Set<TValue>;
  options: Array<[TValue, string]>;
  multi?: boolean;
  onChange?: (value: TValue) => void;
  onToggle?: (value: TValue) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}
    >
      {options.map(([optionValue, label]) => {
        const selected = multi
          ? Boolean(valueSet?.has(optionValue))
          : value === optionValue;
        return (
          <Button
            key={optionValue}
            variant={selected ? "secondary" : "ghost"}
            onPress={() =>
              multi ? onToggle?.(optionValue) : onChange?.(optionValue)
            }
          >
            {label}
          </Button>
        );
      })}
    </View>
  );
}

function ProviderPicker({
  providerIds,
  providers,
  onChange,
}: {
  providerIds: string[];
  providers: ProviderSummary[];
  onChange: (providerIds: string[]) => void;
}) {
  const theme = useTheme();
  const selected = new Set(providerIds);
  if (!providers.length) return <AppText muted>No services found.</AppText>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.sm,
          paddingRight: theme.spacing.lg,
        }}
      >
        {providers.slice(0, 40).map((provider, index) => {
          const active = Boolean(provider.id && selected.has(provider.id));
          const logoUrl = tmdbImageUrl(provider.logoUrl ?? provider.logoPath);
          return (
            <Pressable
              key={`${provider.id ?? provider.name}-${index}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${active ? "Remove" : "Select"} ${
                provider.name
              }`}
              onPress={() => {
                if (!provider.id) return;
                const next = new Set(selected);
                if (next.has(provider.id)) next.delete(provider.id);
                else next.add(provider.id);
                onChange(Array.from(next));
              }}
              style={({ pressed }) => ({
                width: 108,
                minHeight: 96,
                borderRadius: theme.radius.md,
                padding: theme.spacing.sm,
                gap: theme.spacing.sm,
                borderWidth: 1,
                borderColor: active ? theme.colors.accent : theme.colors.border,
                backgroundColor: active
                  ? theme.colors.accentSoft
                  : theme.colors.surface,
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  backgroundColor: theme.colors.surfaceMuted,
                  overflow: "hidden",
                }}
              >
                {logoUrl ? (
                  <Image
                    source={{ uri: logoUrl }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : null}
              </View>
              <AppText variant="caption" numberOfLines={2}>
                {provider.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
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
