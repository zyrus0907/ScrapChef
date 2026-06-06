import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { usePantryStore } from '../../store/pantry.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FoodImage } from '../../components/FoodImage';
import { Colors, Radius, Spacing, Typography } from '../../theme';

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Snacks', 'Other'];

export const AddItemScreen = ({ navigation, route }: any) => {
  const { addItem, isLoading } = usePantryStore();
  const prefill = route?.params?.prefill ?? {};

  const [name, setName] = useState(prefill.name ?? '');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState(prefill.category ?? '');
  const [expiryDate, setExpiryDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [notes, setNotes] = useState('');
  const barcode: string | undefined = prefill.barcode;
  const imageUrl: string | undefined = prefill.imageUrl;
  const brand: string | undefined = prefill.brand;
  const scanned = !!barcode;

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Item name is required.');
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid', 'Quantity must be a positive number.');
      return;
    }

    try {
      await addItem({
        name: name.trim(),
        quantity: qty,
        unit: unit.trim() || 'unit',
        category: category.trim() || undefined,
        barcode: barcode || undefined,
        image_url: imageUrl || undefined,
        expiry_date: expiryDate.trim() || undefined,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to add item. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>New Item</Text>
        <Text style={styles.sub}>Add to your pantry</Text>

        {scanned ? (
          <View style={styles.scannedCard}>
            <FoodImage imageUrl={imageUrl} name={name} category={category} size={64} />
            <View style={{ flex: 1 }}>
              <View style={styles.scannedTag}>
                <Text style={styles.scannedTagText}>✓ SCANNED</Text>
              </View>
              <Text style={styles.scannedName} numberOfLines={2}>
                {name || 'Product found — name it below'}
              </Text>
              {brand ? <Text style={styles.scannedBrand}>{brand}</Text> : null}
            </View>
          </View>
        ) : null}

        <Input
          label="Item Name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Cherry Tomatoes"
          autoCapitalize="words"
        />

        <View style={styles.row}>
          <Input
            label="Quantity *"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholder="1"
            containerStyle={styles.half}
          />
          <Input
            label="Unit"
            value={unit}
            onChangeText={setUnit}
            placeholder="kg, L, pack..."
            containerStyle={styles.half}
          />
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

        <Input
          label="Expiry Date"
          value={expiryDate}
          onChangeText={setExpiryDate}
          placeholder="YYYY-MM-DD"
          hint="Leave empty if not applicable"
        />

        <Input
          label="Purchase Price"
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          keyboardType="decimal-pad"
          placeholder="0.00"
          hint="Used for cost tracking"
        />

        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          multiline
          numberOfLines={3}
        />

        <Button label="Add to Pantry" onPress={handleAdd} loading={isLoading} style={styles.cta} />
        <Button label="Cancel" onPress={() => navigation.goBack()} variant="ghost" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  heading: {
    ...Typography.displaySmall,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sub: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  half: { flex: 1 },
  scannedCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  scannedTag: { alignSelf: 'flex-start', marginBottom: 4 },
  scannedTagText: { ...Typography.caption, color: Colors.goldLight, letterSpacing: 1 },
  scannedName: { ...Typography.titleMedium, color: Colors.textPrimary },
  scannedBrand: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  sectionLabel: {
    ...Typography.overline,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    marginBottom: 0,
  },
  cta: { marginTop: Spacing.md, marginBottom: Spacing.sm },
});
