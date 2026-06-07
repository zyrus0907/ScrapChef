// Two palettes with identical keys so styles can swap at runtime.
// The `gold*` keys are the legacy names for the primary brand color (now green).

export const lightColors = {
  background: '#F4F7F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E7ECE9',
  borderStrong: '#CDE7DD',
  gold: '#12B886',
  goldLight: '#0CA678',
  goldDim: '#E6FAF3',
  onPrimary: '#FFFFFF',
  cream: '#FBF5EA',
  textPrimary: '#1E2D29',
  textSecondary: '#5C6B66',
  textMuted: '#9AA7A1',
  success: '#2F9E44',
  successDim: '#EBFBEE',
  warning: '#F08C00',
  warningDim: '#FFF4E6',
  danger: '#E8590C',
  dangerDim: '#FFF0E6',
  info: '#1C7ED6',
  overlay: 'rgba(20, 35, 30, 0.45)',
} as const;

export type Palette = { [K in keyof typeof lightColors]: string };

export const darkColors: Palette = {
  background: '#0E1512',
  surface: '#161F1B',
  surfaceElevated: '#1E2A24',
  border: '#24302A',
  borderStrong: '#2E5C49',
  gold: '#15C28E',
  goldLight: '#2BD9A4',
  goldDim: 'rgba(21, 194, 142, 0.16)',
  onPrimary: '#06140F',
  cream: '#1E2A24',
  textPrimary: '#E7F0EB',
  textSecondary: '#9FB1A9',
  textMuted: '#6C7D75',
  success: '#51CF66',
  successDim: 'rgba(81, 207, 102, 0.16)',
  warning: '#FFB454',
  warningDim: 'rgba(255, 180, 84, 0.16)',
  danger: '#FF8A5B',
  dangerDim: 'rgba(255, 138, 91, 0.16)',
  info: '#4DABF7',
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

// Back-compat default (light). Live theming uses useColors().
export const Colors: Palette = lightColors;

export type ColorKey = keyof typeof lightColors;
