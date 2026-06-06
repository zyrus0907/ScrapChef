import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { assistantApi, ReceiptLine } from '../../api/assistant';
import { pickImageBase64 } from '../../utils/imagePicker';
import { usePantryStore } from '../../store/pantry.store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FoodImage } from '../../components/FoodImage';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Colors, Radius, Spacing, Typography } from '../../theme';
import { formatCurrency, toNumber } from '../../utils/format';

type Phase = 'idle' | 'parsing' | 'review' | 'adding';
type Line = ReceiptLine & { include: boolean; key: string };

export const ReceiptScanScreen = ({ navigation }: any) => {
  const { addItem } = usePantryStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [lines, setLines] = useState<Line[]>([]);
  const [available, setAvailable] = useState(true);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async () => {
    setError(null);
    const img = await pickImageBase64();
    if (!img) return;
    setPhase('parsing');
    try {
      const { data } = await assistantApi.parseReceipt(img.base64, img.mimeType);
      setAvailable(data.available);
      setStoreName(data.store_name ?? null);
      setLines(data.lines.map((l, i) => ({ ...l, include: true, key: String(i) })));
      setPhase('review');
    } catch {
      setError('Could not read that receipt. Try a clearer, well-lit photo.');
      setPhase('idle');
    }
  };

  const toggle = (key: string) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, include: !l.include } : l)));

  const chosen = lines.filter((l) => l.include);

  const addAll = async () => {
    setPhase('adding');
    for (const l of chosen) {
      try {
        await addItem({
          name: l.name,
          quantity: toNumber(l.quantity) || 1,
          unit: l.unit || 'unit',
          category: l.category || undefined,
          purchase_price: l.price != null ? toNumber(l.price) : undefined,
        });
      } catch {
        /* keep going */
      }
    }
    navigation.navigate('PantryList');
  };

  if (phase === 'parsing') return <LoadingSpinner message="Reading your receipt…" />;
  if (phase === 'adding') return <LoadingSpinner message={`Adding ${chosen.length} items…`} />;

  if (phase === 'review') {
    if (!available) {
      return <KeyNeeded navigation={navigation} />;
    }
    if (lines.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.bigEmoji}>🧾</Text>
          <Text style={styles.title}>No items found</Text>
          <Text style={styles.message}>Couldn't spot grocery items on that receipt. Try a clearer photo.</Text>
          <Button label="Try another photo" onPress={pick} />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <FlatList
          data={lines}
          keyExtractor={(l) => l.key}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.reviewHeader}>
              <Text style={styles.title}>Review items</Text>
              <Text style={styles.message}>
                {storeName ? `${storeName} · ` : ''}Tap to include or skip, then add them all.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={StyleSheet.flatten([styles.row, !item.include && styles.rowOff])} onPress={() => toggle(item.key)}>
              <FoodImage name={item.name} category={item.category || undefined} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, !item.include && styles.nameOff]} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.meta}>
                  {toNumber(item.quantity)} {item.unit}
                  {item.category ? ` · ${item.category}` : ''}
                </Text>
              </View>
              {item.price != null ? <Text style={styles.price}>{formatCurrency(item.price)}</Text> : null}
              <View style={[styles.check, item.include && styles.checkOn]}>
                {item.include ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
            </Card>
          )}
        />
        <View style={styles.footer}>
          <Button label={`Add ${chosen.length} item${chosen.length === 1 ? '' : 's'} to pantry`} onPress={addAll} disabled={chosen.length === 0} />
        </View>
      </View>
    );
  }

  // idle
  return (
    <View style={styles.centered}>
      <Text style={styles.bigEmoji}>🧾</Text>
      <Text style={styles.title}>Scan a receipt</Text>
      <Text style={styles.message}>
        Upload a photo of your grocery receipt and we'll pull every item and its price straight into your pantry.
      </Text>
      <Button label="Choose receipt photo" onPress={pick} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={() => navigation.navigate('AddItem')} style={styles.linkBtn}>
        <Text style={styles.link}>Add one item manually</Text>
      </Pressable>
    </View>
  );
};

const KeyNeeded = ({ navigation }: any) => (
  <View style={styles.centered}>
    <Text style={styles.bigEmoji}>🔑</Text>
    <Text style={styles.title}>AI key needed</Text>
    <Text style={styles.message}>
      Reading receipts uses Gemini AI. Add a free key (GEMINI_API_KEY) to the backend to turn this on. Until then you
      can add items by hand or by barcode.
    </Text>
    <Button label="Add manually" onPress={() => navigation.navigate('AddItem')} />
    <Pressable onPress={() => navigation.navigate('Scan')} style={styles.linkBtn}>
      <Text style={styles.link}>Scan a barcode instead</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  bigEmoji: { fontSize: 48 },
  title: { ...Typography.displaySmall, color: Colors.textPrimary, textAlign: 'center' },
  message: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
  error: { ...Typography.bodyMedium, color: Colors.danger, textAlign: 'center', marginTop: Spacing.sm },
  list: { padding: Spacing.xl, paddingBottom: 120 },
  reviewHeader: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  rowOff: { opacity: 0.5 },
  name: { ...Typography.titleSmall, color: Colors.textPrimary },
  nameOff: { textDecorationLine: 'line-through' },
  meta: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  price: { ...Typography.titleSmall, color: Colors.gold },
  check: { width: 24, height: 24, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  checkMark: { color: Colors.onPrimary, fontWeight: '700', fontSize: 14 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.xl, paddingTop: Spacing.md, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  linkBtn: { paddingVertical: Spacing.sm },
  link: { ...Typography.bodyMedium, color: Colors.gold },
});
