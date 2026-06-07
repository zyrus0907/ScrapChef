// Base neutrals/semantics per scheme + swappable accent presets.
// `gold*` are the legacy names for the primary/accent color.

const baseLight = {
  background: '#F4F7F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E7ECE9',
  borderStrong: '#D4DBD7',
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
  page: '#E5EBE8', // backdrop behind the centered app column on web
};

const baseDark = {
  background: '#0E1512',
  surface: '#161F1B',
  surfaceElevated: '#1E2A24',
  border: '#24302A',
  borderStrong: '#33403A',
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
  page: '#070C0A',
};

// Each accent supplies the primary trio for both schemes.
type AccentTrio = { gold: string; goldLight: string; goldDim: string };
export type AccentKey = 'green' | 'blue' | 'amber' | 'grape' | 'rose';

export const ACCENTS: { key: AccentKey; label: string; swatch: string }[] = [
  { key: 'green', label: 'Green', swatch: '#12B886' },
  { key: 'blue', label: 'Blue', swatch: '#1C7ED6' },
  { key: 'amber', label: 'Amber', swatch: '#F59F00' },
  { key: 'grape', label: 'Grape', swatch: '#7048E8' },
  { key: 'rose', label: 'Rose', swatch: '#E64980' },
];

const ACCENT_VALUES: Record<AccentKey, { light: AccentTrio; dark: AccentTrio }> = {
  green: {
    light: { gold: '#12B886', goldLight: '#0CA678', goldDim: '#E6FAF3' },
    dark: { gold: '#15C28E', goldLight: '#2BD9A4', goldDim: 'rgba(21,194,142,0.16)' },
  },
  blue: {
    light: { gold: '#1C7ED6', goldLight: '#1971C2', goldDim: '#E7F1FB' },
    dark: { gold: '#4DABF7', goldLight: '#74C0FC', goldDim: 'rgba(77,171,247,0.16)' },
  },
  amber: {
    light: { gold: '#F59F00', goldLight: '#E67700', goldDim: '#FFF7E6' },
    dark: { gold: '#FFC247', goldLight: '#FFD580', goldDim: 'rgba(245,159,0,0.18)' },
  },
  grape: {
    light: { gold: '#7048E8', goldLight: '#6741D9', goldDim: '#EEEBFB' },
    dark: { gold: '#9775FA', goldLight: '#B197FC', goldDim: 'rgba(151,117,250,0.16)' },
  },
  rose: {
    light: { gold: '#E64980', goldLight: '#D6336C', goldDim: '#FCE9F1' },
    dark: { gold: '#F783AC', goldLight: '#FAA2C1', goldDim: 'rgba(247,131,172,0.16)' },
  },
};

export type Palette = typeof baseLight & AccentTrio;

export const buildPalette = (scheme: 'light' | 'dark', accent: AccentKey): Palette => {
  const base = scheme === 'dark' ? baseDark : baseLight;
  return { ...base, ...ACCENT_VALUES[accent][scheme] };
};

export const lightColors = buildPalette('light', 'green');
export const darkColors = buildPalette('dark', 'green');

// Back-compat default (light/green). Live theming uses useColors().
export const Colors: Palette = lightColors;

export type ColorKey = keyof Palette;
