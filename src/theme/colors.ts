/**
 * Color Tokens — Beautician Partner App
 * Brand: Deep Emerald Green #0A3F2F + Gold Accent #D4AF37
 * Mirrors getReadyApp palette architecture exactly.
 */
export const palette = {
  emerald: {
    50: '#F0FAF5', 100: '#D1F0E0', 200: '#A3E1C1', 300: '#5FC99A',
    400: '#22A56E', 500: '#0A7C4E', 600: '#0A6B43', 700: '#085636',
    800: '#063F27', 900: '#0A3F2F',
  },
  gold: {
    light: '#FBF3DC', medium: '#E8C84A', main: '#D4AF37',
    dark: '#B8920A', deepDark: '#8A6D0A',
  },
  neutral: {
    0: '#FFFFFF', 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB',
    300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563',
    700: '#374151', 800: '#1F2937', 900: '#111827', 950: '#0B0F17',
  },
  darkSurface: {
    background: '#0A0D0B', surface: '#111712', surfaceElevated: '#192119',
    card: '#151C15', cardBorder: '#243024',
  },
  semantic: {
    success: '#10B981', successLight: '#ECFDF5',
    warning: '#F59E0B', warningLight: '#FFFBEB',
    error: '#EF4444', errorLight: '#FEF2F2',
    info: '#3B82F6', infoLight: '#EFF6FF',
    online: '#22C55E', onlineLight: '#DCFCE7',
    offline: '#9CA3AF', offlineLight: '#F3F4F6',
  },
} as const;
export type ColorPalette = typeof palette;
