import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { navigate } from './navigationRef';
import { useNotificationsStore } from '../store/notifications.store';
import { Spacing, Typography, useColors, useThemedStyles, type Palette } from '../theme';

const ITEMS: { key: string; label: string; icon: string }[] = [
  { key: 'Home', label: 'Home', icon: '⌂' },
  { key: 'Pantry', label: 'Pantry', icon: '◫' },
  { key: 'Recipes', label: 'Recipes', icon: '✦' },
  { key: 'Shopping', label: 'Shopping', icon: '◰' },
  { key: 'Costs', label: 'Costs', icon: '◎' },
];

export const Sidebar = ({ active }: { active: string }) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const unread = useNotificationsStore((s) => s.unread);

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <Text style={styles.brandMark}>✦</Text>
        <Text style={styles.brandText}>SCRAPCHEF</Text>
      </View>

      <View style={styles.nav}>
        {ITEMS.map((item) => {
          const isActive = active === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => navigate(item.key)}
              style={[styles.item, isActive && styles.itemActive]}
            >
              <Text style={[styles.icon, isActive && styles.labelActive]}>{item.icon}</Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => navigate('Home', { screen: 'Notifications' })}
          style={styles.item}
        >
          <Text style={styles.icon}>◔</Text>
          <Text style={styles.label}>Alerts</Text>
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          onPress={() => navigate('Home', { screen: 'Settings' })}
          style={styles.item}
        >
          <Text style={styles.icon}>⚙︎</Text>
          <Text style={styles.label}>Settings</Text>
        </Pressable>
      </View>
    </View>
  );
};

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    sidebar: {
      width: 232,
      backgroundColor: C.surface,
      borderRightWidth: 1,
      borderRightColor: C.border,
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.md,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    brandMark: { fontSize: 20, color: C.gold },
    brandText: { ...Typography.overline, fontSize: 13, letterSpacing: 4, color: C.gold },
    nav: { gap: 4, flex: 1 },
    footer: { gap: 4, borderTopWidth: 1, borderTopColor: C.border, paddingTop: Spacing.md },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: 12,
      paddingHorizontal: Spacing.md,
      borderRadius: 12,
    },
    itemActive: { backgroundColor: C.goldDim },
    icon: { fontSize: 18, color: C.textSecondary, width: 22, textAlign: 'center' },
    label: { ...Typography.titleSmall, color: C.textSecondary },
    labelActive: { color: C.goldLight },
    badge: {
      marginLeft: 'auto',
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: C.danger,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  });
