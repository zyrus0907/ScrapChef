import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RecipeMatch } from '../api/recipes';
import { Card } from './ui/Card';
import { FoodImage } from './FoodImage';
import { Colors, Radius, Spacing, Typography } from '../theme';

interface RecipeCardProps {
  match: RecipeMatch;
  onPress: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ match, onPress }) => {
  const { recipe, match_percentage, coverage, expiry_boost } = match;
  const missing_ingredients = coverage.filter((c) => !c.is_matched).map((c) => c.ingredient_name);
  const pct = Math.round(match_percentage * 100);
  const hasExpiryBoost = expiry_boost > 0;

  const matchColor =
    pct === 100 ? Colors.success : pct >= 80 ? Colors.gold : pct >= 60 ? Colors.warning : Colors.textMuted;

  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <Card onPress={onPress} style={styles.card} gold={pct === 100}>
      <View style={styles.header}>
        <FoodImage name={recipe.name} category={recipe.cuisine} size={52} radius={Radius.md} style={styles.thumb} />
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={2}>{recipe.name}</Text>
          {hasExpiryBoost ? (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.matchCircle, { borderColor: matchColor }]}>
          <Text style={[styles.matchPct, { color: matchColor }]}>{pct}</Text>
          <Text style={[styles.matchSuffix, { color: matchColor }]}>%</Text>
        </View>
      </View>

      {recipe.description ? (
        <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.metaRow}>
          {totalTime > 0 ? (
            <Text style={styles.meta}>⏱ {totalTime} min</Text>
          ) : null}
          <Text style={styles.meta}>◯ {recipe.servings} servings</Text>
        </View>

        {missing_ingredients.length > 0 ? (
          <Text style={styles.missing}>
            Missing: {missing_ingredients.slice(0, 2).join(', ')}
            {missing_ingredients.length > 2 ? ` +${missing_ingredients.length - 2}` : ''}
          </Text>
        ) : (
          <Text style={styles.complete}>All ingredients on hand</Text>
        )}
      </View>

      {recipe.tags && recipe.tags.length > 0 ? (
        <View style={styles.tags}>
          {recipe.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  thumb: {
    marginRight: Spacing.md,
  },
  titleRow: {
    flex: 1,
    marginRight: Spacing.md,
    gap: 4,
  },
  name: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
  },
  urgentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.dangerDim,
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  urgentText: {
    ...Typography.caption,
    color: Colors.danger,
    letterSpacing: 1,
  },
  matchCircle: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  matchPct: {
    fontSize: 16,
    fontWeight: '700',
  },
  matchSuffix: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  footer: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  meta: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  missing: {
    ...Typography.bodySmall,
    color: Colors.warning,
  },
  complete: {
    ...Typography.bodySmall,
    color: Colors.success,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.goldDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.goldLight,
  },
});
