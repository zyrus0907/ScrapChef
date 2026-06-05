import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { costsApi, CostSummary, MonthlySnapshot } from '../../api/costs';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Colors, Spacing, Typography } from '../../theme';
import { formatCurrency, formatPercent, getMonthName } from '../../utils/format';

export const CostDashboardScreen = () => {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [history, setHistory] = useState<MonthlySnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([costsApi.summary(), costsApi.history(6)]).then(([s, h]) => {
      setSummary(s.data);
      setHistory(h.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner message="Loading analytics" />;

  const maxPurchased = Math.max(...history.map((h) => h.total_purchased), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <LinearGradient
        colors={['#1A1400', Colors.background]}
        style={styles.headerGradient}
      />

      <Text style={styles.heading}>Cost Analytics</Text>
      <Text style={styles.sub}>Your kitchen economics</Text>

      {summary ? (
        <>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#2A1F00', '#1A1400']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.heroLabel}>SAVINGS RATE</Text>
              <Text style={styles.heroValue}>{formatPercent(summary.savings_rate)}</Text>
              <Text style={styles.heroSub}>of food purchased was consumed</Text>

              <View style={styles.heroBar}>
                <View
                  style={[
                    styles.heroBarFill,
                    { width: `${Math.round(summary.savings_rate * 100)}%` },
                  ]}
                />
                <View
                  style={[
                    styles.heroBarWaste,
                    { width: `${Math.round(summary.waste_rate * 100)}%` },
                  ]}
                />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statsGrid}>
            <StatBlock label="Total Purchased" value={formatCurrency(summary.total_purchased)} />
            <StatBlock
              label="Consumed Value"
              value={formatCurrency(summary.total_consumed_value)}
              accent={Colors.success}
            />
            <StatBlock
              label="Wasted Value"
              value={formatCurrency(summary.total_wasted_value)}
              accent={Colors.danger}
            />
            <StatBlock label="Items Consumed" value={String(summary.items_consumed)} />
          </View>
        </>
      ) : null}

      {history.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>6-Month History</Text>
          <Card style={styles.chartCard}>
            {history.map((snap) => {
              const barH = snap.total_purchased > 0
                ? (snap.total_purchased / maxPurchased) * 80
                : 2;
              const wasteH = snap.total_purchased > 0
                ? (snap.wasted_value / maxPurchased) * 80
                : 0;
              return (
                <View key={`${snap.year}-${snap.month}`} style={styles.chartCol}>
                  <Text style={styles.chartAmt}>
                    {snap.total_purchased > 0 ? formatCurrency(snap.total_purchased) : '—'}
                  </Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height: barH }]}>
                      {wasteH > 0 ? (
                        <View style={[styles.wasteOverlay, { height: wasteH }]} />
                      ) : null}
                    </View>
                  </View>
                  <Text style={styles.chartLabel}>
                    {getMonthName(snap.month)}
                  </Text>
                </View>
              );
            })}
          </Card>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.gold }]} />
              <Text style={styles.legendText}>Purchased</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
              <Text style={styles.legendText}>Wasted</Text>
            </View>
          </View>
        </>
      ) : null}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
};

const StatBlock = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) => (
  <Card style={statStyles.card}>
    <Text style={[statStyles.value, accent ? { color: accent } : {}]}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
  </Card>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  scroll: { padding: Spacing.xl },
  heading: { ...Typography.displaySmall, color: Colors.textPrimary, marginBottom: 4 },
  sub: { ...Typography.bodyMedium, color: Colors.textSecondary, marginBottom: Spacing.lg },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  heroGradient: { padding: Spacing.xl },
  heroLabel: { ...Typography.overline, color: Colors.goldLight, marginBottom: 4 },
  heroValue: {
    fontSize: 56,
    fontWeight: '100',
    color: Colors.gold,
    fontFamily: 'serif',
    lineHeight: 64,
  },
  heroSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.lg },
  heroBar: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 999,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  heroBarFill: { height: '100%', backgroundColor: Colors.gold },
  heroBarWaste: { height: '100%', backgroundColor: Colors.danger },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  chartCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartAmt: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 8,
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    width: 24,
  },
  bar: {
    width: 24,
    backgroundColor: Colors.gold,
    borderRadius: 4,
    overflow: 'hidden',
    opacity: 0.8,
    justifyContent: 'flex-end',
  },
  wasteOverlay: {
    width: '100%',
    backgroundColor: Colors.danger,
    opacity: 0.8,
  },
  chartLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...Typography.bodySmall, color: Colors.textSecondary },
});

const statStyles = StyleSheet.create({
  card: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '300',
    color: Colors.gold,
    fontFamily: 'serif',
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
