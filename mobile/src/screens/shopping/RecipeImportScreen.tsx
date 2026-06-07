import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { assistantApi, ParsedIngredient } from '../../api/assistant';
import { shoppingApi } from '../../api/shopping';
import { useShoppingStore } from '../../store/shopping.store';
import { pickImageBase64 } from '../../utils/imagePicker';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Radius, Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';
import { toNumber } from '../../utils/format';

type Phase = 'idle' | 'parsing' | 'review' | 'adding';
type Ing = ParsedIngredient & { include: boolean; key: string };

export const RecipeImportScreen = ({ navigation }: any) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const { lists, fetchLists, createList } = useShoppingStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('Imported recipe');
  const [ingredients, setIngredients] = useState<Ing[]>([]);
  const [available, setAvailable] = useState(true);
  const [targetList, setTargetList] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const parse = async (body: { text?: string; image_base64?: string; mime_type?: string }) => {
    setError(null);
    setPhase('parsing');
    try {
      const { data } = await assistantApi.parseRecipe(body);
      setAvailable(data.available);
      setTitle(data.title || 'Imported recipe');
      setIngredients(data.ingredients.map((i, idx) => ({ ...i, include: true, key: String(idx) })));
      setPhase('review');
    } catch {
      setError('Could not read that recipe. Try clearer text or a sharper photo.');
      setPhase('idle');
    }
  };

  const importPhoto = async () => {
    const img = await pickImageBase64();
    if (!img) return;
    parse({ image_base64: img.base64, mime_type: img.mimeType });
  };

  const toggle = (key: string) =>
    setIngredients((xs) => xs.map((x) => (x.key === key ? { ...x, include: !x.include } : x)));

  const chosen = ingredients.filter((i) => i.include);

  const addAll = async () => {
    setPhase('adding');
    let listId = targetList;
    let listTitle = title;
    if (!listId) {
      const created = await createList(title.slice(0, 110) || 'Recipe');
      if (!created) {
        setError('Could not create a list.');
        setPhase('review');
        return;
      }
      listId = created.id;
      listTitle = created.name;
    } else {
      listTitle = lists.find((l) => l.id === listId)?.name ?? title;
    }
    for (const ing of chosen) {
      try {
        await shoppingApi.addItem(listId, {
          name: ing.name,
          quantity: toNumber(ing.quantity) || 1,
          unit: ing.unit || 'pcs',
        });
      } catch {
        /* keep going */
      }
    }
    navigation.replace('ShoppingListDetail', { listId, title: listTitle });
  };

  if (phase === 'parsing') return <LoadingSpinner message="Reading the recipe…" />;
  if (phase === 'adding') return <LoadingSpinner message="Adding ingredients…" />;

  if (phase === 'review' && !available) {
    return (
      <View style={styles.centered}>
        <Text style={styles.bigEmoji}>🔑</Text>
        <Text style={styles.title}>AI key needed</Text>
        <Text style={styles.message}>
          Reading recipes uses Gemini AI. Add a free key (GEMINI_API_KEY) to the backend to enable it.
        </Text>
        <Button label="Back" onPress={() => setPhase('idle')} />
      </View>
    );
  }

  if (phase === 'review') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>Pick the ingredients to add, then choose a list.</Text>

        {ingredients.map((ing) => (
          <Card key={ing.key} style={StyleSheet.flatten([styles.row, !ing.include && styles.rowOff])} onPress={() => toggle(ing.key)}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, !ing.include && styles.nameOff]}>{ing.name}</Text>
              {ing.quantity || ing.unit ? (
                <Text style={styles.meta}>
                  {ing.quantity ? toNumber(ing.quantity) : ''} {ing.unit || ''}
                </Text>
              ) : null}
            </View>
            <View style={[styles.check, ing.include && styles.checkOn]}>
              {ing.include ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
          </Card>
        ))}

        <Text style={styles.sectionLabel}>ADD TO</Text>
        <View style={styles.chips}>
          <Pressable
            onPress={() => setTargetList(null)}
            style={[styles.chip, targetList === null && styles.chipOn]}
          >
            <Text style={[styles.chipText, targetList === null && styles.chipTextOn]}>＋ New list</Text>
          </Pressable>
          {lists.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => setTargetList(l.id)}
              style={[styles.chip, targetList === l.id && styles.chipOn]}
            >
              <Text style={[styles.chipText, targetList === l.id && styles.chipTextOn]}>{l.name}</Text>
            </Pressable>
          ))}
        </View>

        <Button
          label={`Add ${chosen.length} ingredient${chosen.length === 1 ? '' : 's'}`}
          onPress={addAll}
          disabled={chosen.length === 0}
          style={{ marginTop: Spacing.lg }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    );
  }

  // idle
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.bigEmoji}>🍳</Text>
      <Text style={styles.title}>Import a recipe</Text>
      <Text style={styles.message}>Paste a recipe, or upload a photo of one — we'll pull out the ingredients.</Text>

      <Input
        label="Recipe text"
        value={text}
        onChangeText={setText}
        placeholder="Paste ingredients or the full recipe…"
        multiline
        numberOfLines={6}
        containerStyle={{ marginTop: Spacing.md }}
      />
      <Button label="Import from text" onPress={() => parse({ text })} disabled={!text.trim()} />

      <View style={styles.orRow}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      <Button label="Upload recipe photo" variant="outline" onPress={importPhoto} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxl },
  centered: { flex: 1, backgroundColor: C.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  bigEmoji: { fontSize: 44, textAlign: 'center' },
  title: { ...Typography.displaySmall, color: C.textPrimary, textAlign: 'center' },
  message: { ...Typography.bodyMedium, color: C.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
  error: { ...Typography.bodyMedium, color: C.danger, textAlign: 'center', marginTop: Spacing.sm },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: C.border },
  orText: { ...Typography.labelSmall, color: C.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  rowOff: { opacity: 0.5 },
  name: { ...Typography.titleSmall, color: C.textPrimary },
  nameOff: { textDecorationLine: 'line-through' },
  meta: { ...Typography.bodySmall, color: C.textSecondary, marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: C.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: C.gold, borderColor: C.gold },
  checkMark: { color: C.onPrimary, fontWeight: '700', fontSize: 14 },
  sectionLabel: { ...Typography.overline, color: C.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: C.border },
  chipOn: { backgroundColor: C.goldDim, borderColor: C.gold },
  chipText: { ...Typography.labelSmall, color: C.textSecondary },
  chipTextOn: { color: C.goldLight },
});
