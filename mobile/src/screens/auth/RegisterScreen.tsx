import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spacing, Typography, useColors, useThemedStyles, type Palette } from '../../theme';

export const RegisterScreen = ({ navigation }: any) => {
  const C = useColors();
  const styles = useThemedStyles(makeStyles);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Required', 'All fields are required.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Too short', 'Password must be at least 8 characters.');
      return;
    }
    clearError();
    await register(email.trim().toLowerCase(), password, name.trim());
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[C.goldDim, C.background, C.background]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Text style={styles.logo}>✦</Text>
            <Text style={styles.appName}>SMART PANTRY</Text>
          </View>

          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.subheading}>Join and start reducing waste</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Display Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Your name"
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="hello@example.com"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Min. 8 characters"
          />

          <Input
            label="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholder="Repeat password"
          />

          <Button
            label="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.cta}
          />

          <Pressable onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkAccent}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const makeStyles = (C: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  keyboardView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  brand: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: 28,
    color: C.gold,
    marginBottom: Spacing.xs,
  },
  appName: {
    ...Typography.overline,
    fontSize: 12,
    color: C.gold,
    letterSpacing: 5,
  },
  heading: {
    ...Typography.displaySmall,
    color: C.textPrimary,
    marginBottom: Spacing.xs,
  },
  subheading: {
    ...Typography.bodyMedium,
    color: C.textSecondary,
    marginBottom: Spacing.xl,
  },
  errorBox: {
    backgroundColor: C.dangerDim,
    borderWidth: 1,
    borderColor: C.danger,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: { ...Typography.bodySmall, color: C.danger },
  cta: { marginTop: Spacing.sm, marginBottom: Spacing.lg },
  link: { alignItems: 'center', paddingVertical: Spacing.sm },
  linkText: { ...Typography.bodyMedium, color: C.textSecondary },
  linkAccent: { color: C.gold, fontWeight: '600' },
});
