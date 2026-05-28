import { describe, expect, it } from "vitest";
import { profileMenuItems } from "./profile-menu";

describe("profile menu", () => {
  it("builds modern profile menu entries with public view only when possible", () => {
    expect(profileMenuItems("sayuru").map((item) => item.label)).toEqual([
      "Public view",
      "User settings",
      "Notification settings",
      "App settings",
      "Sign out",
    ]);
    expect(profileMenuItems(undefined).map((item) => item.label)).toEqual([
      "User settings",
      "Notification settings",
      "App settings",
      "Sign out",
    ]);
  });
});
