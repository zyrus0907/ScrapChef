import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RecipeMatch } from '../../api/recipes';
import { Card } from '../../components/ui/Card';
import { Colors, Radius, Spacing, Typography } from '../../theme';

export const RecipeDetailScreen = ({ route }: any) => {
  const { match }: { match: RecipeMatch } = route.params;
  const { recipe, match_percentage, coverage } = match;
  const missing_ingredients = coverage.filter((c) => !c.is_matched).map((c) => c.ingredient_name);
  const pct = Math.round(match_percentage * 100);
  const totalTime = recipe.total_time_minutes ?? (recipe.prep_time_minutes + recipe.cook_time_minutes);

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

      {recipe.tags && recipe.tags.length > 0 ? (
        <View style={styles.tags}>
          {recipe.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      ) : null}

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
                    { backgroundColor: isMissing ? Colors.warning : Colors.success },
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

const MetaChip = ({ label, accent }: { label: string; accent?: boolean }) => (
  <View style={[metaStyles.chip, accent && metaStyles.accentChip]}>
    <Text style={[metaStyles.text, accent && metaStyles.accentText]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl },
  header: { marginBottom: Spacing.lg, gap: Spacing.sm },
  name: { ...Typography.displaySmall, color: Colors.textPrimary },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  description: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.lg },
  tag: {
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: { ...Typography.caption, color: Colors.goldLight },
  sectionTitle: { ...Typography.titleMedium, color: Colors.textPrimary, marginBottom: Spacing.sm },
  ingredientsCard: { marginBottom: Spacing.lg, gap: 0 },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  ingredientBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  ingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  ingDot: { width: 6, height: 6, borderRadius: Radius.full },
  ingName: { ...Typography.bodyMedium, color: Colors.textPrimary, flex: 1 },
  ingMissing: { color: Colors.warning },
  ingQuantity: { ...Typography.bodySmall, color: Colors.textSecondary },
  missingBox: {
    backgroundColor: Colors.warningDim,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  missingTitle: { ...Typography.labelLarge, color: Colors.warning, marginBottom: 4 },
  missingItem: { ...Typography.bodyMedium, color: Colors.textPrimary },
  completeBox: {
    backgroundColor: Colors.successDim,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  completeText: { ...Typography.labelLarge, color: Colors.success, letterSpacing: 0.5 },
});

const metaStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accentChip: { borderColor: Colors.gold, backgroundColor: Colors.goldDim },
  text: { ...Typography.labelSmall, color: Colors.textSecondary },
  accentText: { color: Colors.gold },
});
