export const Colors = {
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1E1E1E',
  border: 'rgba(196, 150, 42, 0.15)',
  borderStrong: 'rgba(196, 150, 42, 0.40)',
  gold: '#C4962A',
  goldLight: '#D4AF6A',
  goldDim: 'rgba(196, 150, 42, 0.10)',
  cream: '#F2E8D5',
  textPrimary: '#F2E8D5',
  textSecondary: '#8A8A8A',
  textMuted: '#555555',
  success: '#4CAF50',
  successDim: 'rgba(76, 175, 80, 0.12)',
  warning: '#FF9F0A',
  warningDim: 'rgba(255, 159, 10, 0.12)',
  danger: '#FF453A',
  dangerDim: 'rgba(255, 69, 58, 0.12)',
  info: '#64B5F6',
  overlay: 'rgba(0,0,0,0.7)',
} as const;

export type ColorKey = keyof typeof Colors;
