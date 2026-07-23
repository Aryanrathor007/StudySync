import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { Button, Input, LoadingScreen } from '@/components';
import { useAuth, useTheme } from '@/context';
import { BorderRadius, FontSizes, FontWeights, Spacing, Shadows } from '@/constants';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primaryLight, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/ChatGPT_Image_Jun_25,_2026_at_09_42_51_AM.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>StudySync</Text>
        </View>
        <Text style={styles.headerText}>Welcome Back</Text>
        <Text style={styles.headerSubtext}>Continue your learning journey</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.form}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <View style={[styles.iconInput, { backgroundColor: colors.surface }]}>
              <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                keyboardType="email-address"
                style={styles.inputInline}
              />
            </View>
            <View style={[styles.iconInput, { backgroundColor: colors.surface }]}>
              <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                style={styles.inputInline}
              />
            </View>
          </View>

          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          ) : null}

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
            icon={<ArrowRight size={20} color="#FFFFFF" />}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Don't have an account?
        </Text>
        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={[styles.signUpText, { color: colors.primary }]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    width: 52,
    height: 52,
  },
  brandName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
    marginLeft: Spacing.md,
  },
  headerText: {
    fontSize: 32,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  headerSubtext: {
    fontSize: FontSizes.lg,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  form: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  inputContainer: {
    marginTop: Spacing.lg,
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  inputInline: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  error: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
  },
  forgotPasswordText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: FontSizes.md,
    marginRight: Spacing.xs,
  },
  signUpText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
});
