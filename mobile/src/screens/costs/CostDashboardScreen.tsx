import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { costsApi, CostSummary, MonthlySnapshot } from '../../api/costs';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors, Spacing, Typography } from '../../theme';
import { formatCurrency, formatPercent, toNumber } from '../../utils/format';

// "2026-06" -> "Jun"
const monthLabel = (ym: string): string => {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = parseInt(ym.split('-')[1] ?? '0', 10);
  return names[m - 1] ?? ym;
};

const savingsRate = (saved: number, wasted: number): number => {
  const total = saved + wasted;
  return total > 0 ? saved / total : 0;
};

export const CostDashboardScreen = () => {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [history, setHistory] = useState<MonthlySnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([costsApi.summary(), costsApi.history(6)])
      .then(([s, h]) => {
        setSummary(s.data);
        setHistory(h.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading analytics" />;

  const saved = toNumber(summary?.total_saved);
  const wasted = toNumber(summary?.total_wasted);
  const rate = savingsRate(saved, wasted);
  const wRate = summary ? summary.waste_rate : 0;

  const maxVal = Math.max(
    ...history.map((h) => toNumber(h.total_saved) + toNumber(h.total_wasted)),
    1
  );

  const hasData = !!summary && (saved > 0 || wasted > 0 || summary.items_consumed > 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <LinearGradient colors={['#1A1400', Colors.background]} style={styles.headerGradient} />

      <Text style={styles.heading}>Cost Analytics</Text>
      <Text style={styles.sub}>Your kitchen economics</Text>

      {!hasData ? (
        <EmptyState
          icon="◎"
          title="No data yet"
          subtitle="Consume or waste pantry items and your savings will show up here."
        />
      ) : (
        <>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#2A1F00', '#1A1400']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.heroLabel}>SAVINGS RATE</Text>
              <Text style={styles.heroValue}>{formatPercent(rate)}</Text>
              <Text style={styles.heroSub}>of tracked value was consumed, not wasted</Text>

              <View style={styles.heroBar}>
                <View style={[styles.heroBarFill, { flex: Math.max(rate, 0.001) }]} />
                <View style={[styles.heroBarWaste, { flex: Math.max(1 - rate, 0.001) }]} />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statsGrid}>
            <StatBlock label="Saved" value={formatCurrency(saved)} accent={Colors.success} />
            <StatBlock label="Wasted" value={formatCurrency(wasted)} accent={Colors.danger} />
            <StatBlock label="Net Savings" value={formatCurrency(toNumber(summary?.net_savings))} />
            <StatBlock label="Waste Rate" value={formatPercent(wRate)} />
          </View>
        </>
      )}

      {history.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Recent Months</Text>
          <Card style={styles.chartCard}>
            {history.map((snap) => {
              const s = toNumber(snap.total_saved);
              const w = toNumber(snap.total_wasted);
              const savedH = (s / maxVal) * 80;
              const wasteH = (w / maxVal) * 80;
              return (
                <View key={snap.month} style={styles.chartCol}>
                  <Text style={styles.chartAmt}>{s + w > 0 ? formatCurrency(s + w) : '—'}</Text>
                  <View style={styles.barWrapper}>
                    {wasteH > 0 ? <View style={[styles.wasteBar, { height: Math.max(wasteH, 2) }]} /> : null}
                    {savedH > 0 ? <View style={[styles.savedBar, { height: Math.max(savedH, 2) }]} /> : null}
                  </View>
                  <Text style={styles.chartLabel}>{monthLabel(snap.month)}</Text>
                </View>
              );
            })}
          </Card>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>Saved</Text>
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

const StatBlock = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
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
  heroValue: { fontSize: 56, fontWeight: '100', color: Colors.gold, fontFamily: 'serif', lineHeight: 64 },
  heroSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.lg },
  heroBar: { height: 6, backgroundColor: Colors.surface, borderRadius: 999, flexDirection: 'row', overflow: 'hidden' },
  heroBarFill: { height: '100%', backgroundColor: Colors.success },
  heroBarWaste: { height: '100%', backgroundColor: Colors.danger },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.titleMedium, color: Colors.textPrimary, marginBottom: Spacing.md },
  chartCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chartCol: { flex: 1, alignItems: 'center', gap: 4 },
  chartAmt: { ...Typography.caption, color: Colors.textMuted, fontSize: 8 },
  barWrapper: { height: 80, justifyContent: 'flex-end', width: 24, gap: 2 },
  savedBar: { width: 24, backgroundColor: Colors.success, borderRadius: 4, opacity: 0.85 },
  wasteBar: { width: 24, backgroundColor: Colors.danger, borderRadius: 4, opacity: 0.85 },
  chartLabel: { ...Typography.caption, color: Colors.textSecondary, letterSpacing: 0.5 },
  legend: { flexDirection: 'row', gap: Spacing.lg, paddingHorizontal: Spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...Typography.bodySmall, color: Colors.textSecondary },
});

const statStyles = StyleSheet.create({
  card: { width: '48%', alignItems: 'center', paddingVertical: Spacing.md, gap: 4 },
  value: { fontSize: 20, fontWeight: '300', color: Colors.gold, fontFamily: 'serif' },
  label: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' },
});
