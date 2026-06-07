import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useColors, useTheme } from '../theme';

// On wide web screens, frame the app as a centered max-width column over a
// page backdrop so it reads like a web app instead of a stretched phone screen.
const WebFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const C = useColors();
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={[styles.webOuter, { backgroundColor: C.page }]}>
      <View style={[styles.webInner, { backgroundColor: C.background, borderColor: C.border }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  webOuter: { flex: 1, alignItems: 'center' },
  webInner: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    // RN-web maps these to a soft box-shadow.
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
});

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const C = useColors();
  const { scheme } = useTheme();

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

  if (isLoading) {
    return <LoadingSpinner message="Smart Pantry" />;
  }

  return (
    <WebFrame>
      <NavigationContainer theme={navigationTheme}>
        {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </WebFrame>
  );
};
