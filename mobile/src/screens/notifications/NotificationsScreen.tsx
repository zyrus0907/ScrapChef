import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNotificationsStore } from '../../store/notifications.store';
import { AppNotification } from '../../api/notifications';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Radius, Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';
import { formatDate } from '../../utils/format';

const typeColor = (type: string, C: Palette): string => {
  if (type === 'expired') return C.danger;
  if (type === 'expiring_soon') return C.warning;
  return C.info;
};

const typeIcon = (type: string): string => {
  if (type === 'expired') return '⊘';
  if (type === 'expiring_soon') return '◷';
  return '✦';
};

export const NotificationsScreen = () => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const { items, isLoading, fetch, markRead, markAllRead, scan } = useNotificationsStore();

  useEffect(() => {
    fetch();
  }, []);

  const onPressItem = (n: AppNotification) => {
    if (!n.is_read) markRead(n.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Pressable onPress={() => scan()} hitSlop={8}>
          <Text style={styles.actionText}>SCAN NOW</Text>
        </Pressable>
        <Pressable onPress={markAllRead} hitSlop={8}>
          <Text style={styles.actionText}>MARK ALL READ</Text>
        </Pressable>
      </View>

      {isLoading && items.length === 0 ? (
        <LoadingSpinner message="Loading" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          onRefresh={fetch}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <Card
              style={StyleSheet.flatten([styles.card, !item.is_read && styles.cardUnread])}
              onPress={() => onPressItem(item)}
            >
              <Text style={[styles.icon, { color: typeColor(item.type, C) }]}>{typeIcon(item.type)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, !item.is_read && styles.titleUnread]}>{item.title}</Text>
                {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              </View>
              {!item.is_read ? <View style={styles.dot} /> : null}
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="◷"
              title="All clear"
              subtitle="Expiry alerts will appear here. Tap SCAN NOW to check your pantry."
            />
          }
        />
      )}
    </View>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  actionText: { ...Typography.labelSmall, color: C.gold, letterSpacing: 1.5 },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  cardUnread: { borderColor: C.borderStrong },
  icon: { fontSize: 20, marginTop: 2 },
  title: { ...Typography.titleSmall, color: C.textSecondary },
  titleUnread: { color: C.textPrimary },
  body: { ...Typography.bodySmall, color: C.textSecondary, marginTop: 2, lineHeight: 18 },
  date: { ...Typography.caption, color: C.textMuted, marginTop: Spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold, marginTop: 6 },
});
