import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePantryStore } from '../../store/pantry.store';
import { useAuthStore } from '../../store/auth.store';
import { PantryItemCard } from '../../components/PantryItemCard';
import { Card } from '../../components/ui/Card';
import { Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';
import { useColumns } from '../../utils/responsive';

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const HomeScreen = ({ navigation }: any) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const { user } = useAuthStore();
  const { items, expiringSoon, fetchItems, fetchExpiringSoon } = usePantryStore();

  useEffect(() => {
    fetchItems();
    fetchExpiringSoon(5);
  }, []);

  const activeItems = items.filter((i) => i.status === 'active');
  const expiredItems = activeItems.filter((i) => i.is_expired);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[C.goldDim, C.background]}
        style={styles.headerGradient}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{GREETING()},</Text>
          <Text style={styles.userName}>{user?.display_name ?? 'Chef'}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="In Pantry" value={activeItems.length} />
          <StatCard label="Expiring" value={expiringSoon.length} accent={C.warning} />
          <StatCard label="Expired" value={expiredItems.length} accent={C.danger} />
        </View>

        {expiringSoon.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Use Soon</Text>
              <View style={styles.urgentPill}>
                <Text style={styles.urgentPillText}>{expiringSoon.length} items</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>These items expire within 5 days</Text>
            {expiringSoon.slice(0, 3).map((item) => (
              <PantryItemCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('Pantry')}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <QuickAction
              icon="🧾"
              label="Scan Receipt"
              onPress={() => navigation.navigate('Pantry', { screen: 'ReceiptScan' })}
            />
            <QuickAction
              icon="⊞"
              label="Scan Item"
              onPress={() => navigation.navigate('Pantry', { screen: 'Scan' })}
            />
            <QuickAction
              icon="✦"
              label="Leftover Chef"
              onPress={() => navigation.navigate('LeftoverChef')}
            />
            <QuickAction
              icon="◰"
              label="Shopping"
              onPress={() => navigation.navigate('Shopping')}
            />
            <QuickAction
              icon="◎"
              label="Analytics"
              onPress={() => navigation.navigate('Costs')}
            />
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
};

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statValue, { color: accent ?? C.gold }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
};

const QuickAction = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) => {
  const styles = useThemedStyles(makeStyles);
  const wide = useColumns() > 1;
  return (
    <Card
      onPress={onPress}
      style={StyleSheet.flatten([styles.quickAction, wide && styles.quickActionWide])}
      gold
    >
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </Card>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.bodyLarge,
    color: C.textSecondary,
  },
  userName: {
    ...Typography.displayMedium,
    color: C.textPrimary,
    marginBottom: 4,
  },
  date: {
    ...Typography.labelSmall,
    color: C.textMuted,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: C.gold,
  },
  statLabel: {
    ...Typography.caption,
    color: C.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: C.textPrimary,
  },
  urgentPill: {
    backgroundColor: C.warningDim,
    borderWidth: 1,
    borderColor: C.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  urgentPillText: {
    ...Typography.caption,
    color: C.warning,
    letterSpacing: 0.5,
  },
  sectionSub: {
    ...Typography.bodySmall,
    color: C.textMuted,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickAction: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  quickActionWide: { flexBasis: '18%' },
  quickIcon: {
    fontSize: 22,
    color: C.gold,
  },
  quickLabel: {
    ...Typography.labelSmall,
    color: C.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bottomPad: { height: Spacing.xxl },
});
