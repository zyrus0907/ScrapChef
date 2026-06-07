import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PantryItem } from '../api/pantry';
import { Radius, Spacing, Typography, useColors, useThemedStyles, type Palette } from '../theme';
import { formatCurrency } from '../utils/format';
import { ExpiryBadge } from './ExpiryBadge';
import { FoodImage } from './FoodImage';
import { usePantryStore } from '../store/pantry.store';

interface PantryItemCardProps {
  item: PantryItem;
  onPress?: () => void;
}

export const PantryItemCard: React.FC<PantryItemCardProps> = ({ item, onPress }) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const { consumeItem, wasteItem } = usePantryStore();

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(item.name, 'What would you like to do?', [
      { text: 'Mark Consumed', onPress: () => consumeItem(item.id) },
      { text: 'Mark Wasted', style: 'destructive', onPress: () => wasteItem(item.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const isLowExpiry = item.days_until_expiry !== undefined && item.days_until_expiry !== null && item.days_until_expiry <= 3;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }, isLowExpiry && styles.urgentCard]}
    >
      <FoodImage
        imageUrl={item.image_url}
        name={item.name}
        category={item.category}
        size={68}
        radius={0}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <ExpiryBadge daysUntilExpiry={item.days_until_expiry} isExpired={item.is_expired} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.quantity}>
            {item.quantity} {item.unit}
          </Text>
          {item.category ? (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          ) : null}
        </View>
        {item.purchase_price ? (
          <Text style={styles.price}>{formatCurrency(item.purchase_price)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  urgentCard: {
    borderColor: `${C.warning}50`,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    ...Typography.titleMedium,
    color: C.textPrimary,
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quantity: {
    ...Typography.bodySmall,
    color: C.textSecondary,
  },
  categoryChip: {
    backgroundColor: C.goldDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryText: {
    ...Typography.caption,
    color: C.goldLight,
    letterSpacing: 0.5,
  },
  price: {
    ...Typography.bodySmall,
    color: C.textMuted,
  },
});
