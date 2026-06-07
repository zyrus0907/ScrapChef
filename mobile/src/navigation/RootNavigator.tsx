import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useColors, useTheme } from '../theme';

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
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
