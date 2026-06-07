import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { recipesApi, RecipeMatch } from '../../api/recipes';
import { RecipeCard } from '../../components/RecipeCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Radius, Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';

const MODES = [
  { key: 'strict', label: 'Perfect Match', icon: '✦', sub: 'All ingredients on hand' },
  { key: 'near', label: 'Near Match', icon: '◎', sub: 'Missing 1–2 items' },
  { key: 'scraps', label: 'Use Scraps', icon: '◈', sub: 'Max pantry usage' },
  { key: 'expiry', label: 'Save Before Expiry', icon: '!', sub: 'Rescue expiring items' },
] as const;

type ModeKey = typeof MODES[number]['key'];

export const RecipesScreen = ({ navigation }: any) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const [activeMode, setActiveMode] = useState<ModeKey>('strict');
  const [results, setResults] = useState<RecipeMatch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load(activeMode);
  }, [activeMode]);

  const load = async (mode: ModeKey) => {
    setLoading(true);
    try {
      let data: RecipeMatch[] = [];
      if (mode === 'strict') ({ data } = await recipesApi.matchStrict());
      else if (mode === 'near') ({ data } = await recipesApi.matchNear());
      else if (mode === 'scraps') ({ data } = await recipesApi.matchScraps());
      else ({ data } = await recipesApi.matchExpiryRescue());
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const currentMode = MODES.find((m) => m.key === activeMode)!;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modeBar}
      >
        {MODES.map((mode) => {
          const isActive = mode.key === activeMode;
          return (
            <Pressable
              key={mode.key}
              style={[styles.modeTab, isActive && styles.modeTabActive]}
              onPress={() => setActiveMode(mode.key)}
            >
              <Text style={[styles.modeIcon, isActive && styles.modeIconActive]}>{mode.icon}</Text>
              <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>{mode.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.modeDescription}>
        <Text style={styles.modeDescText}>{currentMode.sub}</Text>
        {!loading ? (
          <Text style={styles.count}>{results.length} recipes</Text>
        ) : null}
      </View>

      {loading ? (
        <LoadingSpinner message="Finding recipes" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.recipe.id}
          renderItem={({ item }) => (
            <RecipeCard
              match={item}
              onPress={() => navigation.navigate('RecipeDetail', { match: item })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="◎"
              title="No recipes found"
              subtitle="Add more items to your pantry to unlock recipe matches"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  modeBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  modeTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    minWidth: 110,
    gap: 4,
  },
  modeTabActive: {
    backgroundColor: C.goldDim,
    borderColor: C.gold,
  },
  modeIcon: {
    fontSize: 16,
    color: C.textMuted,
  },
  modeIconActive: {
    color: C.gold,
  },
  modeLabel: {
    ...Typography.labelSmall,
    color: C.textSecondary,
    textAlign: 'center',
  },
  modeLabelActive: {
    color: C.gold,
  },
  modeDescription: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  modeDescText: {
    ...Typography.bodySmall,
    color: C.textMuted,
    fontStyle: 'italic',
  },
  count: {
    ...Typography.labelSmall,
    color: C.textSecondary,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
});
