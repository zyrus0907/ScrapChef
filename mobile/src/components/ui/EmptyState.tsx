import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '✦', title, subtitle }) => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    fontSize: 40,
    color: C.gold,
    marginBottom: Spacing.lg,
    letterSpacing: 4,
  },
  title: {
    ...Typography.displaySmall,
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
