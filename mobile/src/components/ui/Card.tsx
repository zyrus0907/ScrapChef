import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Radius, Shadow, useColors, useThemedStyles, type Palette } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  gold?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, gold = false }) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const content = (
    <View
      style={[
        styles.card,
        gold && styles.goldCard,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const makeStyles = (C: Palette) => StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    ...Shadow.subtle,
  },
  goldCard: {
    borderColor: C.borderStrong,
    ...Shadow.gold,
  },
});
