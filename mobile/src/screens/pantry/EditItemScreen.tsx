import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { pantryApi, PantryItem } from '../../api/pantry';
import { usePantryStore } from '../../store/pantry.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';
import { toNumber } from '../../utils/format';

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Snacks', 'Other'];

export const EditItemScreen = ({ navigation, route }: any) => {
  const styles = useThemedStyles(makeStyles);
  const { fetchItems } = usePantryStore();
  const item: PantryItem = route.params.item;

  const [quantity, setQuantity] = useState(String(toNumber(item.quantity)));
  const [unit, setUnit] = useState(item.unit ?? '');
  const [category, setCategory] = useState(item.category && item.category !== 'uncategorised' ? item.category : '');
  const [expiryDate, setExpiryDate] = useState(item.expiry_date ?? '');
  const [purchasePrice, setPurchasePrice] = useState(item.purchase_price != null ? String(toNumber(item.purchase_price)) : '');
  const [notes, setNotes] = useState(item.notes ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid', 'Quantity must be a positive number.');
      return;
    }
    setSaving(true);
    try {
      await pantryApi.update(item.id, {
        quantity: qty,
        unit: unit.trim() || 'unit',
        category: category.trim() || undefined,
        expiry_date: expiryDate.trim() || undefined,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
        notes: notes.trim() || undefined,
      });
      await fetchItems();
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Edit {item.name}</Text>
        <Text style={styles.sub}>Update the details</Text>

        <View style={styles.row}>
          <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" containerStyle={styles.half} />
          <Input label="Unit" value={unit} onChangeText={setUnit} placeholder="kg, L, pack..." containerStyle={styles.half} />
        </View>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              label={cat}
              onPress={() => setCategory(category === cat ? '' : cat)}
              variant={category === cat ? 'primary' : 'outline'}
              size="sm"
              fullWidth={false}
              style={styles.chip}
            />
          ))}
        </View>

        <Input label="Expiry Date" value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" hint="Leave empty if not applicable" />
        <Input label="Purchase Price" value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="decimal-pad" placeholder="0.00" hint="Used for cost tracking" />
        <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional notes..." multiline numberOfLines={3} />

        <Button label="Save Changes" onPress={save} loading={saving} style={styles.cta} />
        <Button label="Cancel" onPress={() => navigation.goBack()} variant="ghost" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxl },
    heading: { ...Typography.displaySmall, color: C.textPrimary, marginBottom: 4 },
    sub: { ...Typography.bodyMedium, color: C.textSecondary, marginBottom: Spacing.xl },
    row: { flexDirection: 'row', gap: Spacing.md },
    half: { flex: 1 },
    sectionLabel: { ...Typography.overline, color: C.textSecondary, marginBottom: Spacing.sm },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
    chip: { marginBottom: 0 },
    cta: { marginTop: Spacing.md, marginBottom: Spacing.sm },
  });
