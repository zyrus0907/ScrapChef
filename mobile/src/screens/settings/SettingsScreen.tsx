import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationsStore } from '../../store/notifications.store';
import client from '../../api/client';
import { Card } from '../../components/ui/Card';
import {
  Radius,
  Spacing,
  Typography,
  useColors,
  useTheme,
  useThemedStyles,
  type Palette,
  type ThemeMode,
} from '../../theme';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light', label: 'Light', icon: '☀︎' },
  { mode: 'dark', label: 'Dark', icon: '☾' },
  { mode: 'system', label: 'System', icon: '⌣' },
];

export const SettingsScreen = () => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const { mode, setMode } = useTheme();
  const { user, logout } = useAuthStore();
  const { scan } = useNotificationsStore();
  const [conn, setConn] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');

  const checkConnection = async () => {
    setConn('checking');
    try {
      await client.get('/db-health');
      setConn('ok');
    } catch {
      setConn('fail');
    }
  };

  const scanNow = async () => {
    const created = await scan();
    Alert.alert('Expiry scan', created > 0 ? `Created ${created} new alert(s).` : 'No new alerts — you’re all caught up.');
  };

  const confirmLogout = () =>
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Appearance */}
      <Text style={styles.section}>APPEARANCE</Text>
      <Card style={styles.card}>
        <Text style={styles.rowLabel}>Theme</Text>
        <View style={styles.segment}>
          {THEME_OPTIONS.map((opt) => {
            const active = mode === opt.mode;
            return (
              <Pressable
                key={opt.mode}
                onPress={() => setMode(opt.mode)}
                style={[styles.segItem, active && styles.segItemActive]}
              >
                <Text style={[styles.segIcon, active && styles.segTextActive]}>{opt.icon}</Text>
                <Text style={[styles.segText, active && styles.segTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Account */}
      <Text style={styles.section}>ACCOUNT</Text>
      <Card style={styles.card}>
        <Row label="Name" value={user?.display_name ?? '—'} />
        <View style={styles.divider} />
        <Row label="Email" value={user?.email ?? '—'} />
      </Card>

      {/* Tools */}
      <Text style={styles.section}>TOOLS</Text>
      <Card style={styles.card}>
        <Pressable style={styles.actionRow} onPress={scanNow}>
          <Text style={styles.actionLabel}>Scan pantry for expiries now</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable style={styles.actionRow} onPress={checkConnection}>
          <Text style={styles.actionLabel}>Check backend connection</Text>
          <Text
            style={[
              styles.statusTag,
              conn === 'ok' && { color: C.success },
              conn === 'fail' && { color: C.danger },
            ]}
          >
            {conn === 'idle' ? 'Tap' : conn === 'checking' ? '…' : conn === 'ok' ? 'Connected ✓' : 'Failed'}
          </Text>
        </Pressable>
      </Card>

      {/* About */}
      <Text style={styles.section}>ABOUT</Text>
      <Card style={styles.card}>
        <Row label="App" value="ScrapChef" />
        <View style={styles.divider} />
        <Row label="Version" value={String(Constants.expoConfig?.version ?? '1.0.0')} />
        <View style={styles.divider} />
        <Row label="AI" value="Gemini (free tier)" />
      </Card>

      <Pressable style={styles.signOut} onPress={confirmLogout}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    scroll: { padding: Spacing.xl },
    section: {
      ...Typography.overline,
      color: C.textMuted,
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    card: { gap: 0 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    rowLabel: { ...Typography.bodyMedium, color: C.textSecondary },
    rowValue: { ...Typography.bodyMedium, color: C.textPrimary, maxWidth: '62%', textAlign: 'right' },
    divider: { height: 1, backgroundColor: C.border },
    segment: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
    segItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: C.border,
      gap: 4,
    },
    segItemActive: { backgroundColor: C.goldDim, borderColor: C.gold },
    segIcon: { fontSize: 18, color: C.textSecondary },
    segText: { ...Typography.labelSmall, color: C.textSecondary },
    segTextActive: { color: C.goldLight },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
    actionLabel: { ...Typography.bodyMedium, color: C.textPrimary },
    chevron: { fontSize: 22, color: C.textMuted },
    statusTag: { ...Typography.labelSmall, color: C.textMuted },
    signOut: {
      marginTop: Spacing.xl,
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: C.danger,
    },
    signOutText: { ...Typography.labelLarge, color: C.danger },
  });
