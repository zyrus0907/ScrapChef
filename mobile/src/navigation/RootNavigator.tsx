import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { Sidebar } from './Sidebar';
import { navigationRef } from './navigationRef';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useColors, useTheme } from '../theme';

export const DESKTOP_BREAKPOINT = 900;

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const C = useColors();
  const { scheme } = useTheme();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('Home');

  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;

  const navigationTheme = {
    dark: scheme === 'dark',
    colors: {
      primary: C.gold,
      background: C.background,
      card: C.surface,
      text: C.textPrimary,
      border: C.border,
      notification: C.gold,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '900' as const },
    },
  };

  useEffect(() => {
    hydrate();
  }, []);

  const syncActive = () => {
    const root = navigationRef.getRootState?.();
    const r = root?.routes?.[root.index ?? 0];
    if (r?.name) setActiveTab(r.name);
  };

  if (isLoading) {
    return <LoadingSpinner message="ScrapChef" />;
  }

  const content = (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} onReady={syncActive} onStateChange={syncActive}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );

  if (isDesktop && isAuthenticated) {
    return (
      <View style={styles.desktopRow}>
        <Sidebar active={activeTab} />
        <View style={[styles.content, { backgroundColor: C.background }]}>{content}</View>
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  desktopRow: { flex: 1, flexDirection: 'row' },
  // Content fills all remaining width, flush against the sidebar — no gaps.
  content: { flex: 1 },
});
