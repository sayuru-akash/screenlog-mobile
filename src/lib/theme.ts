import { useColorScheme } from "react-native";

export const palette = {
  light: {
    background: "#F7F7F4",
    surface: "#FFFFFF",
    surfaceMuted: "#ECEFEA",
    text: "#151816",
    muted: "#626A64",
    faint: "#8A928C",
    border: "#DDE3DD",
    accent: "#1F7A5B",
    accentSoft: "#DCEDE5",
    danger: "#B42318",
    warning: "#A15C07",
  },
  dark: {
    background: "#101412",
    surface: "#171D1A",
    surfaceMuted: "#202822",
    text: "#F2F5F1",
    muted: "#B9C1BB",
    faint: "#869088",
    border: "#2B352F",
    accent: "#62C99A",
    accentSoft: "#183B2D",
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

export function useTheme() {
  const scheme = useColorScheme();
  const mode = scheme === "dark" ? "dark" : "light";
  return {
    mode,
    colors: palette[mode],
    spacing,
    radius,
  };
}
