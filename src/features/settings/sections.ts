export type SettingsSection = "profile" | "notifications" | "app";

export function resolveSettingsSection(
  section?: string | null,
): SettingsSection {
  if (section === "profile" || section === "notifications") return section;
  return "app";
}

export function settingsSectionVisibility(section: SettingsSection) {
  const showUserSettings = section === "profile";
  const showNotificationSettings = section === "notifications";
  const showAppSettings = section === "app";
  return {
    showUserSettings,
    showNotificationSettings,
    showAppSettings,
    needsSettings: showUserSettings || showAppSettings,
  };
}

export function settingsSectionCopy(section: SettingsSection) {
  if (section === "profile") {
    return {
      title: "User Settings",
      subtitle: "Profile and default visibility.",
    };
  }
  if (section === "notifications") {
    return {
      title: "Notification Settings",
      subtitle: "Alerts and reminders.",
    };
  }
  return {
    title: "App Settings",
    subtitle: "Region, providers, theme, and account.",
  };
}
