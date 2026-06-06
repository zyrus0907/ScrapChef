import { TextStyle } from 'react-native';

// Friendly, clean sans-serif (system font). Tight tracking on headings reads
// modern/premium without the old serif's heaviness.
export const Typography: Record<string, TextStyle> = {
  displayLarge: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  displayMedium: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  displaySmall: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  titleLarge: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  titleMedium: { fontSize: 16, fontWeight: '600', letterSpacing: -0.1 },
  titleSmall: { fontSize: 14, fontWeight: '600' },
  bodyLarge: { fontSize: 16, fontWeight: '400', letterSpacing: 0.1 },
  bodyMedium: { fontSize: 14, fontWeight: '400', letterSpacing: 0.1 },
  bodySmall: { fontSize: 12, fontWeight: '400', letterSpacing: 0.1 },
  labelLarge: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  labelSmall: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  caption: { fontSize: 11, fontWeight: '500', letterSpacing: 0.4 },
  overline: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
};
