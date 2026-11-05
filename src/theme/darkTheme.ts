import {palette} from "./colors";
import {typography} from "./typography";
import {spacing} from "./spacing";
import {radius} from "./radius";
import {shadows} from "./shadows";
import {dimensions} from "./dimensions";
import {animations} from "./animations";
import {AppTheme} from "./lightTheme";

export const darkTheme: AppTheme = {
  isDark: true,
  colors: {
    primary: "#16A870", primaryLight: "rgba(22,168,112,0.18)", primaryDark: palette.emerald[900],
    primaryContainer: "rgba(22,168,112,0.12)", onPrimary: "#FFFFFF",
    secondary: palette.gold.main, secondaryLight: "rgba(212,175,55,0.15)", accent: palette.gold.medium,
    background: "#0A0D0B", surface: "#111712", surfaceElevated: "#192119",
    surfaceHighlight: "#21291F", surfaceVariant: "#192119", card: "#151C15", cardBorder: "#243024",
    textPrimary: "#F0FDF4", textSecondary: "#86EFAC", textMuted: "#4B7A5C",
    textTertiary: "#6B7280",
    textInverted: "#0A0D0B", textInverse: "#0A0D0B", textBrand: "#34D399",
    inputBackground: "#0F1610", inputBorder: "#1E3028", inputBorderFocused: "#16A870",
    borderFocus: "#16A870",
    inputPlaceholder: "#4B7A5C", textPlaceholder: "#4B7A5C", inputText: "#F0FDF4",
    border: "#1E3028", borderLight: "#152018", divider: "#192119",
    success: "#34D399", successLight: "rgba(52,211,153,0.15)",
    warning: "#FBBF24", warningLight: "rgba(251,191,36,0.15)",
    error: "#F87171", errorLight: "rgba(248,113,113,0.15)",
    info: "#60A5FA", infoLight: "rgba(96,165,250,0.15)",
    online: "#4ADE80", onlineLight: "rgba(74,222,128,0.15)",
    offline: "#6B7280", offlineLight: "rgba(107,114,128,0.15)",
    onlineBadge: "#34D399", offlineBadge: "#6B7280",
    bottomNavBackground: "#0D1210", bottomNavBorder: "#192119",
    bottomNavActive: "#16A870", bottomNavInactive: "#4B7A5C",
    modalBackground: "#111712", bottomSheetBackground: "#111712",
    overlay: "rgba(0,0,0,0.75)",
    white: "#FFFFFF", black: "#000000",
    iconPrimary: "#F0FDF4", iconSecondary: "#86EFAC", iconBrand: "#16A870",
    ratingStar: "#FBBF24", tagBackground: "rgba(22,168,112,0.15)", tagText: "#4ADE80",
    ripple: "rgba(22,168,112,0.2)",
    emerald: palette.emerald,
    crimson: "#F0709A", crimsonTint: "rgba(240,112,154,0.16)",
    mint: "rgba(22,168,112,0.15)", sos: "#EF4444",
    gold: palette.gold.main, goldLight: palette.gold.light,
    disabledBackground: "#1E2922", disabledText: "#4B7A5C",
  },
  typography, spacing, radius, shadows, dimensions, animations,
};
