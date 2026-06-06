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
import { Colors, Spacing, Typography } from '../../theme';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    clearError();
    await login(email.trim().toLowerCase(), password);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1400', Colors.background, Colors.background]}
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
            <Text style={styles.tagline}>Your kitchen, curated.</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in to continue</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

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
            secureTextEntry={!showPassword}
            autoComplete="password"
            placeholder="••••••••"
            rightIcon={
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showHide}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
              </Pressable>
            }
          />

          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.cta}
          />

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.link}>
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkAccent}>Create one</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
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
    fontSize: 32,
    color: Colors.gold,
    marginBottom: Spacing.sm,
  },
  appName: {
    ...Typography.overline,
    fontSize: 13,
    color: Colors.gold,
    letterSpacing: 6,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  heading: {
    ...Typography.displaySmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subheading: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  errorBox: {
    backgroundColor: Colors.dangerDim,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
  },
  cta: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  showHide: {
    ...Typography.caption,
    color: Colors.gold,
    letterSpacing: 1,
  },
  link: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  linkText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  linkAccent: {
    color: Colors.gold,
    fontWeight: '600',
  },
});
