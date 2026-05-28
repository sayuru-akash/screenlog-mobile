import { describe, expect, it } from "vitest";
import { resolveSettingsSection, settingsSectionVisibility } from "./sections";

describe("settings sections", () => {
  it("defaults to app settings instead of an all-in-one page", () => {
    expect(
      settingsSectionVisibility(resolveSettingsSection(undefined)),
    ).toEqual({
      showUserSettings: false,
      showNotificationSettings: false,
      showAppSettings: true,
      needsSettings: true,
    });
  });

  it("keeps profile and notification settings as separate pages", () => {
    expect(
      settingsSectionVisibility(resolveSettingsSection("profile")),
    ).toEqual({
      showUserSettings: true,
      showNotificationSettings: false,
      showAppSettings: false,
      needsSettings: true,
    });
    expect(
      settingsSectionVisibility(resolveSettingsSection("notifications")),
    ).toEqual({
      showUserSettings: false,
      showNotificationSettings: true,
      showAppSettings: false,
      needsSettings: false,
    });
  });
});
