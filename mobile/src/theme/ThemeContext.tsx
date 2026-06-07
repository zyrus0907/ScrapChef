import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccentKey, buildPalette, Palette } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';
const MODE_KEY = '@sp/theme_mode';
const ACCENT_KEY = '@sp/theme_accent';

interface ThemeContextValue {
  mode: ThemeMode;
  scheme: 'light' | 'dark';
  accent: AccentKey;
  colors: Palette;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [accent, setAccentState] = useState<AccentKey>('green');
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    AsyncStorage.multiGet([MODE_KEY, ACCENT_KEY]).then((pairs) => {
      const m = pairs[0][1];
      const a = pairs[1][1];
      if (m === 'light' || m === 'dark' || m === 'system') setModeState(m);
      if (a === 'green' || a === 'blue' || a === 'amber' || a === 'grape' || a === 'rose') {
        setAccentState(a);
      }
    });
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light')
    );
    return () => sub.remove();
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(MODE_KEY, m).catch(() => {});
  };
  const setAccent = (a: AccentKey) => {
    setAccentState(a);
    AsyncStorage.setItem(ACCENT_KEY, a).catch(() => {});
  };

  const scheme: 'light' | 'dark' = mode === 'system' ? systemScheme : mode;
  const colors = useMemo(() => buildPalette(scheme, accent), [scheme, accent]);

  const value = useMemo(
    () => ({ mode, scheme, accent, colors, setMode, setAccent }),
    [mode, scheme, accent, colors]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const useColors = (): Palette => useTheme().colors;

export function useThemedStyles<T>(factory: (c: Palette) => T): T {
  const colors = useColors();
  return useMemo(() => factory(colors), [colors]);
}
