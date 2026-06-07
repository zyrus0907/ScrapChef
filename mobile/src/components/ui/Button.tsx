import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Typography, Radius, useColors, useThemedStyles, type Palette } from '../../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
}) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isDisabled = disabled || loading;
  const heights = { sm: 40, md: 52, lg: 60 };
  const fontSizes = { sm: 12, md: 14, lg: 16 };

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        style={[fullWidth && { width: '100%' }, style]}
      >
        {({ pressed }) => (
          <LinearGradient
            colors={isDisabled ? ['#D3DBD7', '#C7D0CB'] : pressed ? ['#0CA678', '#099268'] : ['#1CC58F', '#12B886']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.base, { height: heights[size], borderRadius: Radius.md }]}
          >
            {loading ? (
              <ActivityIndicator color={C.onPrimary} size="small" />
            ) : (
              <Text style={[styles.primaryLabel, { fontSize: fontSizes[size] }]}>{label}</Text>
            )}
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  const outlineStyle =
    variant === 'outline'
      ? { borderColor: C.borderStrong, borderWidth: 1 }
      : variant === 'danger'
      ? { borderColor: C.danger, borderWidth: 1 }
      : {};

  const labelColor =
    variant === 'danger' ? C.danger : variant === 'ghost' ? C.textSecondary : C.gold;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        outlineStyle,
        { height: heights[size], borderRadius: Radius.md, opacity: pressed || isDisabled ? 0.6 : 1 },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <Text style={[styles.label, { fontSize: fontSizes[size], color: labelColor }]}>{label}</Text>
      )}
    </Pressable>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryLabel: {
    color: C.onPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
