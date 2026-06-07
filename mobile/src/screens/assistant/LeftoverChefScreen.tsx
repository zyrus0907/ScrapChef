import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { assistantApi, GeneratedRecipe } from '../../api/assistant';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { FoodImage } from '../../components/FoodImage';
import { Radius, Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';

export const LeftoverChefScreen = () => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [provider, setProvider] = useState<string | null>(null);
  const [considered, setConsidered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiringOnly, setExpiringOnly] = useState(true);
  const [hasRun, setHasRun] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await assistantApi.leftoverChef({
        // Always consider the whole pantry; the toggle just prioritises
        // soon-to-expire items (filtering to only-expiring could return nothing).
        expiring_only: false,
        prioritise_expiring: expiringOnly,
        max_recipes: 3,
      });
      setRecipes(data.recipes);
      setProvider(data.provider);
      setConsidered(data.ingredients_considered);
      setHasRun(true);
    } catch (e: any) {
      const msg = e.response?.data?.error?.message ?? 'Could not generate recipes. Add pantry items first.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={[C.goldDim, C.background]} style={styles.headerGradient} />
      <Text style={styles.heading}>Leftover Chef</Text>
      <Text style={styles.sub}>Turn what you have into something to cook</Text>

      <Pressable style={styles.toggleRow} onPress={() => setExpiringOnly((v) => !v)}>
        <View style={[styles.toggle, expiringOnly && styles.toggleOn]}>
          {expiringOnly ? <Text style={styles.toggleMark}>✓</Text> : null}
        </View>
        <Text style={styles.toggleLabel}>Focus on items expiring soon</Text>
      </Pressable>

      <Button label={hasRun ? 'Regenerate' : 'Cook From My Pantry'} onPress={generate} loading={loading} />

      {provider ? (
        <Text style={styles.providerNote}>
          {considered} ingredient{considered === 1 ? '' : 's'} considered ·{' '}
          {provider === 'stub' ? 'offline suggestion (add an AI key for tailored recipes)' : `powered by ${provider}`}
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ height: Spacing.lg }} />

      {recipes.map((r, idx) => (
        <Card key={`${r.name}-${idx}`} style={styles.recipeCard} gold={r.uses_expiring_items}>
          <View style={styles.recipeHeader}>
            <FoodImage name={r.name} size={56} radius={Radius.md} />
            <View style={{ flex: 1 }}>
              <Text style={styles.recipeName}>{r.name}</Text>
              {r.uses_expiring_items ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>USES EXPIRING</Text>
                </View>
              ) : null}
            </View>
          </View>
          <Text style={styles.recipeDesc}>{r.description}</Text>
          <Text style={styles.meta}>~{r.estimated_time_minutes} min</Text>

          <Text style={styles.subhead}>FROM YOUR PANTRY</Text>
          <Text style={styles.chips}>{r.ingredients_used.join(' · ') || '—'}</Text>

          {r.additional_ingredients.length > 0 ? (
            <>
              <Text style={styles.subhead}>YOU'LL ALSO NEED</Text>
              <Text style={styles.chipsMuted}>{r.additional_ingredients.join(' · ')}</Text>
            </>
          ) : null}

          <Text style={styles.subhead}>STEPS</Text>
          {r.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Card>
      ))}

      {hasRun && recipes.length === 0 && !error ? (
        <EmptyState icon="✦" title="No recipes" subtitle="Try turning off the expiring-only filter, or add more pantry items." />
      ) : null}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 160 },
  content: { padding: Spacing.xl },
  heading: { ...Typography.displaySmall, color: C.textPrimary, marginBottom: 4 },
  sub: { ...Typography.bodyMedium, color: C.textSecondary, marginBottom: Spacing.lg },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  toggle: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: C.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: C.gold, borderColor: C.gold },
  toggleMark: { color: C.onPrimary, fontWeight: '700', fontSize: 13 },
  toggleLabel: { ...Typography.bodyMedium, color: C.textSecondary },
  providerNote: { ...Typography.bodySmall, color: C.textMuted, marginTop: Spacing.sm, textAlign: 'center' },
  error: { ...Typography.bodyMedium, color: C.danger, marginTop: Spacing.md, textAlign: 'center' },
  recipeCard: { marginBottom: Spacing.md },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  recipeName: { ...Typography.titleLarge, color: C.textPrimary },
  badge: { alignSelf: 'flex-start', marginTop: 4, backgroundColor: C.warningDim, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  badgeText: { ...Typography.caption, color: C.warning, letterSpacing: 1 },
  recipeDesc: { ...Typography.bodyMedium, color: C.textSecondary, marginTop: Spacing.xs },
  meta: { ...Typography.labelSmall, color: C.gold, marginTop: Spacing.sm },
  subhead: { ...Typography.overline, color: C.textMuted, marginTop: Spacing.md, marginBottom: Spacing.xs },
  chips: { ...Typography.bodyMedium, color: C.textPrimary },
  chipsMuted: { ...Typography.bodyMedium, color: C.textSecondary },
  stepRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  stepNum: { ...Typography.labelSmall, color: C.gold, width: 16 },
  stepText: { ...Typography.bodyMedium, color: C.textPrimary, flex: 1, lineHeight: 20 },
});
