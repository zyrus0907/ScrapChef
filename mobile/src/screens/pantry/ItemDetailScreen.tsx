import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePantryStore } from '../../store/pantry.store';
import { pantryApi, PantryItem } from '../../api/pantry';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ExpiryBadge } from '../../components/ExpiryBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';
import { formatDate, formatCurrency, toNumber } from '../../utils/format';

export const ItemDetailScreen = ({ route, navigation }: any) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const { itemId } = route.params;
  const { consumeItem, wasteItem, deleteItem, fetchItems } = usePantryStore();
  const [item, setItem] = useState<PantryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');

  const useSome = async () => {
    if (!item) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid', 'Enter an amount greater than 0.');
      return;
    }
    try {
      const { data } = await pantryApi.consume(item.id, amt);
      await fetchItems();
      if (data.status !== 'active') {
        navigation.goBack();
      } else {
        setItem(data);
        setAmount('');
      }
    } catch {
      Alert.alert('Error', 'Could not update the item.');
    }
  };

  useEffect(() => {
    pantryApi.get(itemId).then(({ data }) => {
      setItem(data);
      setLoading(false);
    });
  }, [itemId]);

  if (loading || !item) return <LoadingSpinner />;

  const handleConsume = async () => {
    await consumeItem(item.id);
    navigation.goBack();
  };

  const handleWaste = () => {
    Alert.alert('Mark as Wasted', 'Are you sure? This will log the item as food waste.', [
      {
        text: 'Yes, wasted',
        style: 'destructive',
        onPress: async () => {
          await wasteItem(item.id);
          navigation.goBack();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Item', 'This will permanently remove the item.', [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(item.id);
          navigation.goBack();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const isActive = item.status === 'active';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        <ExpiryBadge daysUntilExpiry={item.days_until_expiry} isExpired={item.is_expired} />
        <StatusPill status={item.status} />
      </View>

      <Card style={styles.infoCard}>
        <DetailRow label="Quantity" value={`${item.quantity} ${item.unit}`} />
        {item.category ? <DetailRow label="Category" value={item.category} /> : null}
        {item.expiry_date ? <DetailRow label="Expires" value={formatDate(item.expiry_date)} /> : null}
        {item.purchase_date ? <DetailRow label="Purchased" value={formatDate(item.purchase_date)} /> : null}
        {item.purchase_price ? (
          <DetailRow label="Purchase Price" value={formatCurrency(item.purchase_price)} accent={C.gold} />
        ) : null}
        {item.notes ? <DetailRow label="Notes" value={item.notes} /> : null}
        <DetailRow label="Added" value={formatDate(item.created_at)} />
      </Card>

      {isActive ? (
        <Card style={styles.useCard}>
          <Text style={styles.useTitle}>Use some</Text>
          <Text style={styles.useSub}>
            {toNumber(item.quantity)} {item.unit} left
          </Text>
          <View style={styles.useRow}>
            <Input
              label="Amount used"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder={`e.g. ${toNumber(item.quantity) / 2}`}
              containerStyle={styles.useInput}
            />
            <Button label="Use" onPress={useSome} fullWidth={false} style={styles.useBtn} />
          </View>
        </Card>
      ) : null}

      {isActive ? (
        <View style={styles.actions}>
          <Button label="Mark Consumed" onPress={handleConsume} style={styles.actionBtn} />
          <Button
            label="Mark Wasted"
            onPress={handleWaste}
            variant="outline"
            style={styles.actionBtn}
          />
        </View>
      ) : null}

      <Button
        label="Edit Item"
        onPress={() => navigation.navigate('EditItem', { item })}
        variant="outline"
        style={styles.deleteBtn}
      />
      <Button label="Delete Item" onPress={handleDelete} variant="danger" style={styles.deleteBtn} />
    </ScrollView>
  );
};

const DetailRow = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) => {
  const detailStyles = useThemedStyles(makeDetailStyles);
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={[detailStyles.value, accent ? { color: accent } : {}]}>{value}</Text>
    </View>
  );
};

const StatusPill = ({ status }: { status: string }) => {
  const C = useColors();
  const statusStyles = useThemedStyles(makeStatusStyles);
  const colors: Record<string, string> = {
    active: C.success,
    consumed: C.gold,
    wasted: C.danger,
  };
  const color = colors[status] ?? C.textMuted;
  return (
    <View style={[statusStyles.pill, { backgroundColor: `${color}20`, borderColor: `${color}50` }]}>
      <Text style={[statusStyles.text, { color }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxl },
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  name: {
    ...Typography.displaySmall,
    color: C.textPrimary,
  },
  infoCard: { marginBottom: Spacing.xl },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionBtn: { flex: 1 },
  deleteBtn: { marginTop: Spacing.sm },
  useCard: { marginBottom: Spacing.md },
  useTitle: { ...Typography.titleMedium, color: C.textPrimary },
  useSub: { ...Typography.bodySmall, color: C.textSecondary, marginBottom: Spacing.sm },
  useRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-end' },
  useInput: { flex: 1, marginBottom: 0 },
  useBtn: { marginBottom: 0 },
});

const makeDetailStyles = (C: Palette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  label: { ...Typography.labelLarge, color: C.textSecondary },
  value: { ...Typography.bodyMedium, color: C.textPrimary, maxWidth: '60%', textAlign: 'right' },
});

const makeStatusStyles = (C: Palette) => StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: { ...Typography.caption, letterSpacing: 1 },
});
