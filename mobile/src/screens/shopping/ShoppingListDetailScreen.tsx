import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { shoppingApi, ShoppingList, ShoppingListItem } from '../../api/shopping';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Radius, Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';
import { toNumber } from '../../utils/format';

export const ShoppingListDetailScreen = ({ route, navigation }: any) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const { listId } = route.params;
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState('pcs');

  const load = async () => {
    try {
      const { data } = await shoppingApi.getList(listId);
      setList(data);
      navigation.setOptions({ title: data.name });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [listId]);

  const addItem = async () => {
    if (!name.trim()) return;
    const { data } = await shoppingApi.addItem(listId, {
      name: name.trim(),
      quantity: toNumber(qty) || 1,
      unit: unit.trim() || 'pcs',
    });
    setList(data);
    setName('');
    setQty('1');
  };

  const toggle = async (item: ShoppingListItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { data } = await shoppingApi.toggleItem(listId, item.id);
    setList(data);
  };

  const remove = async (item: ShoppingListItem) => {
    const { data } = await shoppingApi.removeItem(listId, item.id);
    setList(data);
  };

  if (loading) return <LoadingSpinner message="Loading list" />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={list?.items ?? []}
      keyExtractor={(i) => i.id}
      ListHeaderComponent={
        <View style={styles.addRow}>
          <View style={{ flex: 2 }}>
            <Input label="Item" placeholder="e.g. milk" value={name} onChangeText={setName} containerStyle={{ marginBottom: Spacing.sm }} />
          </View>
          <View style={styles.smallRow}>
            <View style={{ flex: 1 }}>
              <Input label="Qty" value={qty} onChangeText={setQty} keyboardType="numeric" containerStyle={{ marginBottom: Spacing.sm }} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Unit" value={unit} onChangeText={setUnit} containerStyle={{ marginBottom: Spacing.sm }} />
            </View>
          </View>
          <Button label="Add Item" onPress={addItem} size="sm" />
          <Text style={styles.sectionTitle}>ITEMS</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Card style={styles.itemCard}>
          <Pressable style={styles.check} onPress={() => toggle(item)}>
            <View style={[styles.checkbox, item.is_purchased && styles.checkboxOn]}>
              {item.is_purchased ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemName, item.is_purchased && styles.itemDone]}>{item.name}</Text>
            <Text style={styles.itemMeta}>
              {toNumber(item.quantity)} {item.unit}
              {item.source === 'suggested' ? ' · suggested' : ''}
            </Text>
          </View>
          <Pressable onPress={() => remove(item)} hitSlop={8}>
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        </Card>
      )}
      ListEmptyComponent={
        <EmptyState icon="◫" title="Empty list" subtitle="Add items above to get started." />
      }
    />
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: Spacing.xl, paddingBottom: 100, flexGrow: 1 },
  addRow: { marginBottom: Spacing.md },
  smallRow: { flexDirection: 'row', gap: Spacing.sm },
  sectionTitle: { ...Typography.overline, color: C.gold, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  itemCard: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.md },
  check: {},
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: C.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: C.gold, borderColor: C.gold },
  checkmark: { color: C.onPrimary, fontSize: 14, fontWeight: '700' },
  itemName: { ...Typography.titleSmall, color: C.textPrimary },
  itemDone: { textDecorationLine: 'line-through', color: C.textMuted },
  itemMeta: { ...Typography.bodySmall, color: C.textSecondary, marginTop: 2 },
  remove: { fontSize: 16, color: C.textMuted, paddingHorizontal: Spacing.xs },
});
