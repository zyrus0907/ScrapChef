import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Typography } from '../theme';
import { formatExpiryLabel, getExpiryColor } from '../utils/format';

interface ExpiryBadgeProps {
  daysUntilExpiry?: number | null;
  isExpired: boolean;
}

export const ExpiryBadge: React.FC<ExpiryBadgeProps> = ({ daysUntilExpiry, isExpired }) => {
  const color = getExpiryColor(daysUntilExpiry, isExpired);
  const label = formatExpiryLabel(daysUntilExpiry, isExpired);

  if (!label || label === 'No expiry') return null;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}50` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: Radius.full,
  },
  text: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
});
