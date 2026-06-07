import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Typography, useColors, useThemedStyles, type Palette } from '../../theme';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={C.gold} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.background,
    gap: 16,
  },
  text: {
    ...Typography.labelLarge,
    color: C.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
