import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotificationsStore } from '../store/notifications.store';
import { Colors, Typography } from '../theme';

export const HeaderBell = () => {
  const navigation = useNavigation<any>();
  const { unread, fetchUnread } = useNotificationsStore();

  useEffect(() => {
    fetchUnread();
    const unsub = navigation.addListener('focus', fetchUnread);
    return unsub;
  }, [navigation]);

  return (
    <Pressable
      onPress={() => navigation.navigate('Notifications')}
      hitSlop={10}
      style={styles.wrap}
    >
      <Text style={styles.bell}>◔</Text>
      {unread > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: { marginRight: 16, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  bell: { fontSize: 20, color: Colors.gold },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { ...Typography.caption, color: '#fff', fontSize: 9, fontWeight: '700' },
});
