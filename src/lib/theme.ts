import { useColorScheme } from "react-native";
import { create } from "zustand";
import type { ThemePreference } from "@/types/domain";

export const palette = {
  light: {
    background: "#FAFAFA",
    surface: "#FFFFFF",
    surfaceMuted: "#EEEEEE",
    text: "#171717",
    muted: "#666666",
    faint: "#999999",
    border: "#E5E5E5",
    accent: "#8B5CF6",
    accentSoft: "#EEE7FF",
    success: "#16A34A",
    successSoft: "#DCFCE7",
    danger: "#B42318",
    warning: "#A15C07",
  },
  dark: {
    background: "#0A0A0A",
    surface: "#121212",
    surfaceMuted: "#1F1F1F",
    text: "#F2F2F2",
    muted: "#A3A3A3",
    faint: "#737373",
    border: "#242424",
    accent: "#8B5CF6",
    accentSoft: "#24163F",
    success: "#22C55E",
    successSoft: "#12311F",
    danger: "#FFB4AB",
    warning: "#FFD08A",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
} as const;

type ThemeStore = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

export const useThemePreferenceStore = create<ThemeStore>((set) => ({
  preference: "system",
  setPreference: (preference) => set({ preference }),
}));

export function useTheme() {
  const scheme = useColorScheme();
  const preference = useThemePreferenceStore((state) => state.preference);
  const mode =
    preference === "system"
      ? scheme === "dark"
        ? "dark"
        : "light"
      : preference;
  return {
    mode,
    preference,
    colors: palette[mode],
    spacing,
    radius,
  };
}
