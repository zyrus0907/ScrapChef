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
import { Colors, Radius, Spacing, Typography } from '../../theme';

const TABS = ['All', 'Active', 'Expiring', 'Consumed'] as const;
type Tab = typeof TABS[number];

export const PantryScreen = ({ navigation }: any) => {
  const { items, isLoading, fetchItems } = usePantryStore();
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
          placeholderTextColor={Colors.textMuted}
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PantryItemCard
            item={item}
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
          />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  search: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    color: Colors.textPrimary,
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
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.goldDim,
    borderColor: Colors.gold,
  },
  tabText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.gold,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.background,
    fontWeight: '300',
    lineHeight: 32,
  },
});
