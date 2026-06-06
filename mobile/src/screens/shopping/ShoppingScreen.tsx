import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useShoppingStore } from '../../store/shopping.store';
import { shoppingApi } from '../../api/shopping';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Colors, Radius, Spacing, Typography } from '../../theme';
import { toNumber } from '../../utils/format';

export const ShoppingScreen = ({ navigation }: any) => {
  const { lists, suggestions, isLoading, fetchLists, fetchSuggestions, createList } =
    useShoppingStore();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = () => {
    fetchLists();
    fetchSuggestions();
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const handleCreate = async () => {
    const name = newName.trim() || 'Shopping list';
    setCreating(true);
    const list = await createList(name);
    setCreating(false);
    setNewName('');
    if (list) navigation.navigate('ShoppingListDetail', { listId: list.id, title: list.name });
  };

  const addSuggestionToList = async (listId: string, s: { name: string; unit: string; suggested_quantity: number | string }) => {
    await shoppingApi.addItem(listId, {
      name: s.name,
      quantity: toNumber(s.suggested_quantity) || 1,
      unit: s.unit,
    });
    fetchLists();
  };

  if (isLoading && lists.length === 0) return <LoadingSpinner message="Loading lists" />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={lists}
      keyExtractor={(l) => l.id}
      onRefresh={load}
      refreshing={isLoading}
      ListHeaderComponent={
        <View>
          <View style={styles.createRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="New list"
                placeholder="e.g. Weekly shop"
                value={newName}
                onChangeText={setNewName}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
          </View>
          <Button label="Create List" onPress={handleCreate} loading={creating} size="sm" />

          {suggestions.length > 0 ? (
            <View style={styles.suggestBlock}>
              <Text style={styles.sectionTitle}>RESTOCK SUGGESTIONS</Text>
              <Text style={styles.sectionHint}>Items you've run out of</Text>
              {suggestions.map((s) => (
                <Card key={s.name} style={styles.suggestCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestName}>{s.name}</Text>
                    <Text style={styles.suggestMeta}>
                      {toNumber(s.suggested_quantity)} {s.unit} · ran out
                    </Text>
                  </View>
                  {lists.length > 0 ? (
                    <Pressable
                      style={styles.addBtn}
                      onPress={() => addSuggestionToList(lists[0].id, s)}
                    >
                      <Text style={styles.addBtnText}>+ {lists[0].name}</Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.suggestMeta}>create a list first</Text>
                  )}
                </Card>
              ))}
            </View>
          ) : null}

          <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>YOUR LISTS</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Card
          style={styles.listCard}
          onPress={() =>
            navigation.navigate('ShoppingListDetail', { listId: item.id, title: item.name })
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.listName}>{item.name}</Text>
            <Text style={styles.listMeta}>
              {item.total_items} item{item.total_items === 1 ? '' : 's'}
              {item.is_complete && item.total_items > 0 ? ' · complete ✓' : ''}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>
      )}
      ListEmptyComponent={
        <EmptyState icon="◫" title="No lists yet" subtitle="Create your first shopping list above." />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 100, flexGrow: 1 },
  createRow: { marginBottom: Spacing.sm },
  sectionTitle: { ...Typography.overline, color: Colors.gold, marginBottom: 2, marginTop: Spacing.lg },
  sectionHint: { ...Typography.bodySmall, color: Colors.textMuted, marginBottom: Spacing.sm },
  suggestBlock: { marginTop: Spacing.sm },
  suggestCard: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  suggestName: { ...Typography.titleSmall, color: Colors.textPrimary },
  suggestMeta: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  addBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.gold,
    backgroundColor: Colors.goldDim,
  },
  addBtnText: { ...Typography.labelSmall, color: Colors.gold },
  listCard: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  listName: { ...Typography.titleMedium, color: Colors.textPrimary },
  listMeta: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 28, color: Colors.textMuted, fontWeight: '300' },
});
