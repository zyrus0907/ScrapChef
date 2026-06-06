export { Colors } from './colors';
export { Typography } from './typography';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  full: 999,
} as const;

// Soft, light-theme shadows — gentle lift, no heavy dark halos.
export const Shadow = {
  gold: {
    shadowColor: '#12B886',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  subtle: {
    shadowColor: '#1E2D29',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
} as const;
