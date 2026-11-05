import {palette} from "./colors";
import {typography} from "./typography";
import {spacing} from "./spacing";
import {radius} from "./radius";
import {shadows} from "./shadows";
import {dimensions} from "./dimensions";
import {animations} from "./animations";

export interface ThemeColors {
  primary: string; primaryLight: string; primaryDark: string;
  primaryContainer: string; onPrimary: string;
  secondary: string; secondaryLight: string; accent: string;
  background: string; surface: string; surfaceElevated: string;
  surfaceHighlight: string; surfaceVariant: string; card: string; cardBorder: string;
  textPrimary: string; textSecondary: string; textMuted: string;
  textTertiary: string; textInverted: string; textInverse: string; textBrand: string;
  inputBackground: string; inputBorder: string; inputBorderFocused: string;
  inputPlaceholder: string; inputText: string;
  border: string; borderLight: string; borderFocus: string; divider: string;
  success: string; successLight: string; warning: string; warningLight: string;
  error: string; errorLight: string; info: string; infoLight: string;
  online: string; onlineLight: string; offline: string; offlineLight: string;
  onlineBadge: string; offlineBadge: string;
  bottomNavBackground: string; bottomNavBorder: string;
  bottomNavActive: string; bottomNavInactive: string;
  modalBackground: string; bottomSheetBackground: string; overlay: string;
  white: string; black: string; iconPrimary: string; iconSecondary: string;
  iconBrand: string; ratingStar: string; tagBackground: string; tagText: string; ripple: string;
  emerald: typeof palette.emerald;
  // Figma brand accents: crimson for back chevrons/tags/wordmark, mint for active chips and status pills.
  crimson: string; crimsonTint: string; mint: string; sos: string;
  gold: string; goldLight: string;
  textPlaceholder: string;
  disabledBackground: string; disabledText: string;
}

export interface AppTheme {
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  dimensions: typeof dimensions;
  animations: typeof animations;
}

export const lightTheme: AppTheme = {
  isDark: false,
  colors: {
    primary: palette.brand.green,
    primaryLight: palette.brand.mint,
    primaryDark: palette.brand.greenDark,
    primaryContainer: palette.brand.mint,
    onPrimary: palette.neutral[0],
    secondary: palette.gold.main,
    secondaryLight: palette.gold.light,
    accent: palette.gold.medium,
    background: "#FAFAFC", surface: "#FFFFFF", surfaceElevated: "#FFFFFF",
    surfaceHighlight: "#F7F8FA", surfaceVariant: "#F3F4F6", card: "#FFFFFF", cardBorder: "#F0F1F5",
    textPrimary: "#1F242C", textSecondary: "#5A6270", textMuted: "#94A0B0",
    textTertiary: "#9CA3AF",
    textInverted: "#FFFFFF", textInverse: "#FFFFFF", textBrand: palette.brand.green,
    inputBackground: "#F9FAFC", inputBorder: "#E5E7EB",
    inputBorderFocused: palette.brand.green, borderFocus: palette.brand.green,
    inputPlaceholder: "#9CA3AF", textPlaceholder: "#9CA3AF", inputText: "#1F242C",
    border: "#E8EAED", borderLight: "#F3F4F6", divider: "#EDEFF2",
    success: palette.semantic.success, successLight: palette.semantic.successLight,
    warning: palette.semantic.warning, warningLight: palette.semantic.warningLight,
    error: palette.semantic.error, errorLight: palette.semantic.errorLight,
    info: palette.semantic.info, infoLight: palette.semantic.infoLight,
    online: palette.semantic.online, onlineLight: palette.semantic.onlineLight,
    offline: palette.semantic.offline, offlineLight: palette.semantic.offlineLight,
    onlineBadge: "#10B981", offlineBadge: "#9CA3AF",
    bottomNavBackground: "#FFFFFF", bottomNavBorder: "#EEF0F4",
    bottomNavActive: palette.brand.green, bottomNavInactive: "#9CA3AF",
    modalBackground: "#FFFFFF", bottomSheetBackground: "#FFFFFF",
    overlay: "rgba(15,23,42,0.55)",
    white: "#FFFFFF", black: "#000000",
    iconPrimary: "#1F242C", iconSecondary: "#6B7280", iconBrand: palette.brand.green,
    ratingStar: "#F59E0B", tagBackground: palette.brand.mint, tagText: palette.brand.green,
    ripple: "rgba(17,75,68,0.12)",
    emerald: palette.emerald,
    crimson: palette.brand.crimson, crimsonTint: palette.brand.crimsonTint,
    mint: palette.brand.mint, sos: palette.brand.sos,
    gold: palette.gold.main, goldLight: palette.gold.light,
    disabledBackground: "#E5E7EB", disabledText: "#9CA3AF",
  },
  typography, spacing, radius, shadows, dimensions, animations,
};
