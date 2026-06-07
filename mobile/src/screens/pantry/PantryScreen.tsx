import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { usePantryStore } from '../../store/pantry.store';
import { PantryItemCard } from '../../components/PantryItemCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Radius, Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';
import { useColumns } from '../../utils/responsive';

const TABS = ['All', 'Active', 'Expiring', 'Consumed'] as const;
type Tab = typeof TABS[number];

export const PantryScreen = ({ navigation }: any) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const { items, isLoading, fetchItems } = usePantryStore();
  const columns = useColumns();
  const [activeTab, setActiveTab] = useState<Tab>('Active');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items
    .filter((item) => {
      if (activeTab === 'Active') return item.status === 'active';
      if (activeTab === 'Expiring')
        return (
          item.status === 'active' &&
          item.days_until_expiry !== undefined &&
          item.days_until_expiry !== null &&
          item.days_until_expiry <= 7
        );
      if (activeTab === 'Consumed') return item.status === 'consumed';
      return true;
    })
    .filter((item) =>
      search.trim() ? item.name.toLowerCase().includes(search.trim().toLowerCase()) : true
    );

  if (isLoading && items.length === 0) {
    return <LoadingSpinner message="Loading pantry" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search items..."
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <Pressable
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        key={columns}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={columns > 1 ? styles.gridCell : undefined}>
            <PantryItemCard
              item={item}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={search ? 'No results' : 'Nothing here yet'}
            subtitle={
              search
                ? 'Try a different search term'
                : activeTab === 'Active'
                ? 'Tap + to add your first item'
                : 'Items will appear here once logged'
            }
          />
        }
        onRefresh={fetchItems}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddItem')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  searchRow: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  search: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    color: C.textPrimary,
    ...Typography.bodyMedium,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: {
    backgroundColor: C.goldDim,
    borderColor: C.gold,
  },
  tabText: {
    ...Typography.labelSmall,
    color: C.textSecondary,
  },
  tabTextActive: {
    color: C.gold,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
    flexGrow: 1,
  },
  gridRow: { gap: Spacing.sm },
  gridCell: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 28,
    color: C.onPrimary,
    fontWeight: '300',
    lineHeight: 32,
  },
});
