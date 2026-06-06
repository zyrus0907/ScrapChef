// Mealime-inspired light theme: airy off-white, fresh green, charcoal text.
// NOTE: the `gold*` keys are the legacy names for the primary brand color —
// they now hold greens. Kept to avoid touching every call site.
export const Colors = {
  background: '#F4F7F5',       // airy off-white with a hint of green
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E7ECE9',           // subtle neutral hairline
  borderStrong: '#CDE7DD',     // soft green for focus / checkboxes
  gold: '#12B886',             // PRIMARY — fresh emerald green
  goldLight: '#0CA678',        // deeper green for text on tints / accents
  goldDim: '#E6FAF3',          // very light green tint (chips, fills)
  onPrimary: '#FFFFFF',        // text/icons on the green primary
  cream: '#FBF5EA',
  textPrimary: '#1E2D29',      // deep charcoal-green
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

export type ColorKey = keyof typeof Colors;
