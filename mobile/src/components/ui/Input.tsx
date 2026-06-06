import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle, Pressable } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  containerStyle,
  rightIcon,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? Colors.danger
    : focused
    ? Colors.gold
    : Colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor }]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.overline,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    height: 52,
    color: Colors.textPrimary,
    ...Typography.bodyLarge,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  error: {
    ...Typography.bodySmall,
    color: Colors.danger,
    marginTop: 4,
  },
  hint: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
