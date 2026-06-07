import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RecipeMatch } from '../../api/recipes';
import { pantryApi } from '../../api/pantry';
import { usePantryStore } from '../../store/pantry.store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Radius, Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';
import { useColumns } from '../../utils/responsive';

export const RecipeDetailScreen = ({ route }: any) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const wide = useColumns() > 1;
  const { match }: { match: RecipeMatch } = route.params;
  const { recipe, match_percentage, coverage } = match;
  const missing_ingredients = coverage.filter((c) => !c.is_matched).map((c) => c.ingredient_name);
  const pct = Math.round(match_percentage * 100);
  const totalTime = recipe.total_time_minutes ?? (recipe.prep_time_minutes + recipe.cook_time_minutes);
  const steps = (recipe.instructions ?? '')
    .split(/\r?\n/)
    .map((s) => s.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter(Boolean);
  const { fetchItems } = usePantryStore();

  const cookIt = async () => {
    const names = coverage
      .filter((c) => c.is_matched)
      .map((c) => c.pantry_item_name || c.ingredient_name);
    try {
      const { data } = await pantryApi.cook(names);
      await fetchItems();
      Alert.alert(
        'Cooked! 🍳',
        data.consumed > 0
          ? `Used up ${data.consumed} pantry item${data.consumed === 1 ? '' : 's'}: ${data.names.join(', ')}.`
          : 'No matching active pantry items to use up.'
      );
    } catch {
      Alert.alert('Error', 'Could not update your pantry.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.name}>{recipe.name}</Text>

        <View style={styles.metaRow}>
          {totalTime > 0 ? <MetaChip label={`${totalTime} min`} /> : null}
          <MetaChip label={`${recipe.servings} servings`} />
          <MetaChip label={`${pct}% match`} accent />
        </View>

        {recipe.description ? (
          <Text style={styles.description}>{recipe.description}</Text>
        ) : null}
      </View>

      <Button
        label="Cook this — use up ingredients"
        onPress={cookIt}
        style={{ marginBottom: Spacing.lg }}
      />

      {recipe.tags && recipe.tags.length > 0 ? (
        <View style={styles.tags}>
          {recipe.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={wide ? styles.body2col : undefined}>
        <View style={wide ? styles.colIngredients : undefined}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <Card style={styles.ingredientsCard}>
            {recipe.ingredients.map((ing, idx) => {
              const isMissing = missing_ingredients.includes(ing.name);
              return (
                <View
                  key={idx}
                  style={[
                    styles.ingredientRow,
                    idx < recipe.ingredients.length - 1 && styles.ingredientBorder,
                  ]}
                >
                  <View style={styles.ingLeft}>
                    <View
                      style={[
                        styles.ingDot,
                        { backgroundColor: isMissing ? C.warning : C.success },
                      ]}
                    />
                    <Text style={[styles.ingName, isMissing && styles.ingMissing]}>
                      {ing.name}
                      {ing.is_optional ? ' (optional)' : ''}
                    </Text>
                  </View>
                  <Text style={styles.ingQuantity}>
                    {ing.quantity} {ing.unit}
                  </Text>
                </View>
              );
            })}
          </Card>
        </View>

        {steps.length > 0 ? (
          <View style={wide ? styles.colSteps : undefined}>
            <Text style={styles.sectionTitle}>Steps</Text>
            <Card style={styles.ingredientsCard}>
              {steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </Card>
          </View>
        ) : null}
      </View>

      {missing_ingredients.length > 0 ? (
        <View style={styles.missingBox}>
          <Text style={styles.missingTitle}>You still need</Text>
          {missing_ingredients.map((name) => (
            <Text key={name} style={styles.missingItem}>• {name}</Text>
          ))}
        </View>
      ) : (
        <View style={styles.completeBox}>
          <Text style={styles.completeText}>✦ You have everything for this recipe</Text>
        </View>
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
};

const MetaChip = ({ label, accent }: { label: string; accent?: boolean }) => {
  const metaStyles = useThemedStyles(makeMetaStyles);
  return (
    <View style={[metaStyles.chip, accent && metaStyles.accentChip]}>
      <Text style={[metaStyles.text, accent && metaStyles.accentText]}>{label}</Text>
    </View>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scroll: { padding: Spacing.xl },
  header: { marginBottom: Spacing.lg, gap: Spacing.sm },
  name: { ...Typography.displaySmall, color: C.textPrimary },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  description: {
    ...Typography.bodyMedium,
    color: C.textSecondary,
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.lg },
  tag: {
    backgroundColor: C.goldDim,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: { ...Typography.caption, color: C.goldLight },
  sectionTitle: { ...Typography.titleMedium, color: C.textPrimary, marginBottom: Spacing.sm },
  body2col: { flexDirection: 'row', gap: Spacing.xl, alignItems: 'flex-start' },
  colIngredients: { flex: 1 },
  colSteps: { flex: 1.3 },
  stepRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 8 },
  stepNum: { ...Typography.labelSmall, color: C.gold, width: 18 },
  stepText: { ...Typography.bodyMedium, color: C.textPrimary, flex: 1, lineHeight: 21 },
  ingredientsCard: { marginBottom: Spacing.lg, gap: 0 },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  ingredientBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  ingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  ingDot: { width: 6, height: 6, borderRadius: Radius.full },
  ingName: { ...Typography.bodyMedium, color: C.textPrimary, flex: 1 },
  ingMissing: { color: C.warning },
  ingQuantity: { ...Typography.bodySmall, color: C.textSecondary },
  missingBox: {
    backgroundColor: C.warningDim,
    borderWidth: 1,
    borderColor: C.warning,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  missingTitle: { ...Typography.labelLarge, color: C.warning, marginBottom: 4 },
  missingItem: { ...Typography.bodyMedium, color: C.textPrimary },
  completeBox: {
    backgroundColor: C.successDim,
    borderWidth: 1,
    borderColor: C.success,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  completeText: { ...Typography.labelLarge, color: C.success, letterSpacing: 0.5 },
});

const makeMetaStyles = (C: Palette) => StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: C.border,
  },
  accentChip: { borderColor: C.gold, backgroundColor: C.goldDim },
  text: { ...Typography.labelSmall, color: C.textSecondary },
  accentText: { color: C.gold },
});
