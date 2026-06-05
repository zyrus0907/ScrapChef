import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  displayLarge: { fontSize: 36, fontWeight: '200', letterSpacing: 2, fontFamily: 'serif' },
  displayMedium: { fontSize: 28, fontWeight: '300', letterSpacing: 1.5, fontFamily: 'serif' },
  displaySmall: { fontSize: 22, fontWeight: '300', letterSpacing: 1, fontFamily: 'serif' },
  titleLarge: { fontSize: 18, fontWeight: '600', letterSpacing: 0.2 },
  titleMedium: { fontSize: 16, fontWeight: '600', letterSpacing: 0.15 },
  titleSmall: { fontSize: 14, fontWeight: '600', letterSpacing: 0.1 },
  bodyLarge: { fontSize: 16, fontWeight: '400', letterSpacing: 0.15 },
  bodyMedium: { fontSize: 14, fontWeight: '400', letterSpacing: 0.1 },
  bodySmall: { fontSize: 12, fontWeight: '400', letterSpacing: 0.2 },
  labelLarge: { fontSize: 13, fontWeight: '500', letterSpacing: 0.5 },
  labelSmall: { fontSize: 11, fontWeight: '500', letterSpacing: 0.8 },
  caption: { fontSize: 10, fontWeight: '400', letterSpacing: 1.2 },
  overline: { fontSize: 10, fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase' },
};
