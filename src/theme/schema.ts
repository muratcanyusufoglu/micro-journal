/**
 * OneLine Design System
 * Single source of truth for all design tokens
 */

export type ColorScheme = {
  // Backgrounds
  bgPrimary: string;
  bgSurface: string;
  bgSubtle: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textPlaceholder: string;
  textMuted: string;

  // Accent
  accentPrimary: string;
  accentActive: string;
  accentDeep: string;

  // Borders
  borderSoft: string;
  borderCard: string;

  // Status
  successSoft: string;
  dangerSoft: string;

  // Tags / Mood ribbons (backgrounds)
  tagCalm: string;
  tagHappy: string;
  tagReflective: string;
  tagStressed: string;
  tagGrateful: string;
  tagEnergized: string;
  tagFocused: string;
  tagSad: string;
  tagNeutral: string;
};

export const lightColors: ColorScheme = {
  // Backgrounds
  bgPrimary: "#f6f8f6",
  bgSurface: "#FFFFFF",
  bgSubtle: "#F1F1EE",

  // Text
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textPlaceholder: "#9CA3AF",
  textMuted: "#B6BDC6",

  // Accent
  accentPrimary: "#C8D6CC",
  accentActive: "#AFC3B6",
  accentDeep: "#8FA99B",

  // Borders
  borderSoft: "#E5E7EB",
  borderCard: "#E7E5E0",

  // Status
  successSoft: "#BFD8C7",
  dangerSoft: "#E6B8B8",

  // Tags / Mood ribbons (backgrounds)
  tagCalm: "#C8D6CC",
  tagHappy: "#BFD8C7",
  tagReflective: "#E7E5E0",
  tagStressed: "#E6B8B8",
  tagGrateful: "#E6DFB8",
  tagEnergized: "#B8D4E6",
  tagFocused: "#D2C7E6",
  tagSad: "#C9D1DA",
  tagNeutral: "#F1F1EE",
};

export const darkColors: ColorScheme = {
  // Backgrounds
  bgPrimary: "#1A1A1A",
  bgSurface: "#2A2A2A",
  bgSubtle: "#232323",

  // Text
  textPrimary: "#E8E8E8",
  textSecondary: "#A0A0A0",
  textPlaceholder: "#707070",
  textMuted: "#5A5A5A",

  // Accent
  accentPrimary: "#8FA99B",
  accentActive: "#A5BBAD",
  accentDeep: "#718E80",

  // Borders
  borderSoft: "#3A3A3A",
  borderCard: "#353535",

  // Status
  successSoft: "#4A6B54",
  dangerSoft: "#8B5757",

  // Tags / Mood ribbons (backgrounds)
  tagCalm: "#2F3F38",
  tagHappy: "#2D4636",
  tagReflective: "#333333",
  tagStressed: "#513333",
  tagGrateful: "#4A4630",
  tagEnergized: "#2D3C4A",
  tagFocused: "#3C334A",
  tagSad: "#2F3944",
  tagNeutral: "#2A2A2A",
};

export const warmColors: ColorScheme = {
  // Backgrounds
  bgPrimary: "#FBF8F3",
  bgSurface: "#FFFEFB",
  bgSubtle: "#F5F2ED",

  // Text
  textPrimary: "#3D2E1E",
  textSecondary: "#8B7355",
  textPlaceholder: "#B39A7C",
  textMuted: "#C4B5A0",

  // Accent
  accentPrimary: "#D4A373",
  accentActive: "#C89865",
  accentDeep: "#B88552",

  // Borders
  borderSoft: "#EAE0D5",
  borderCard: "#E5DAC8",

  // Status
  successSoft: "#C8D4B8",
  dangerSoft: "#E6B8B8",

  // Tags / Mood ribbons (backgrounds)
  tagCalm: "#E5DAC8",
  tagHappy: "#C8D4B8",
  tagReflective: "#F5F2ED",
  tagStressed: "#E6B8B8",
  tagGrateful: "#E9D9B8",
  tagEnergized: "#C8DCE6",
  tagFocused: "#D9CCE9",
  tagSad: "#D7D1C6",
  tagNeutral: "#EAE0D5",
};

export const coolColors: ColorScheme = {
  // Backgrounds
  bgPrimary: "#F3F6F9",
  bgSurface: "#FFFFFF",
  bgSubtle: "#EDF1F5",

  // Text
  textPrimary: "#1E2D3D",
  textSecondary: "#5A6B7C",
  textPlaceholder: "#8C9CAD",
  textMuted: "#B0BAC6",

  // Accent
  accentPrimary: "#A8C5D9",
  accentActive: "#93B7CC",
  accentDeep: "#7DA3B8",

  // Borders
  borderSoft: "#DFE7ED",
  borderCard: "#D8E1E8",

  // Status
  successSoft: "#B8D4C8",
  dangerSoft: "#E6B8B8",

  // Tags / Mood ribbons (backgrounds)
  tagCalm: "#A8C5D9",
  tagHappy: "#B8D4C8",
  tagReflective: "#EDF1F5",
  tagStressed: "#E6B8B8",
  tagGrateful: "#D9D3A8",
  tagEnergized: "#A8CFE6",
  tagFocused: "#C6B8E6",
  tagSad: "#B7C2CD",
  tagNeutral: "#DFE7ED",
};

export type ThemeName = "light" | "dark" | "warm" | "cool";

export const themeColors: Record<ThemeName, ColorScheme> = {
  light: lightColors,
  dark: darkColors,
  warm: warmColors,
  cool: coolColors,
};

export const radius = {
  card: 28,
  button: 26,
  iconButton: 22,
  thumb: 16,
  sheet: 24,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  titleSerif: 26,
  sectionSerif: 22,
  body: 16,
  small: 13,
  micro: 12,
} as const;

export const shadows = {
  soft: {
    shadowColor: "#1F2937",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: "#1F2937",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export type Theme = {
  colors: ColorScheme;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  currentTheme: ThemeName;
};
