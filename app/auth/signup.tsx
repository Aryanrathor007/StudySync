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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { Button, Input, LoadingScreen } from '@/components';
import { useAuth, useTheme } from '@/context';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants';

const EXAM_TYPES = [
  { id: 'JEE', label: 'JEE', icon: '🎓' },
  { id: 'NEET', label: 'NEET', icon: '🩺' },
  { id: 'UPSC', label: 'UPSC', icon: '🏛️' },
  { id: 'SSC', label: 'SSC', icon: '💼' },
  { id: 'GATE', label: 'GATE', icon: '⚙️' },
  { id: 'CAT', label: 'CAT', icon: '📊' },
  { id: 'Other', label: 'Other', icon: '📚' },
];

export default function SignupScreen() {
  const { colors } = useTheme();
  const { signUp, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [examType, setExamType] = useState('JEE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp(email, password, fullName, examType);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
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
        <Text style={styles.headerText}>Create Account</Text>
        <Text style={styles.headerSubtext}>Join StudySync Community</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.form}
      >
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.inputContainer}>
            <View style={[styles.iconInput, { backgroundColor: colors.surface }]}>
              <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <Input
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full name"
                autoCapitalize="words"
                style={styles.inputInline}
              />
            </View>
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
            <View style={[styles.iconInput, { backgroundColor: colors.surface }]}>
              <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
                style={styles.inputInline}
              />
            </View>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Select Your Exam</Text>
          <View style={styles.examGrid}>
            {EXAM_TYPES.map((exam) => (
              <TouchableOpacity
                key={exam.id}
                onPress={() => setExamType(exam.id)}
                style={[
                  styles.examButton,
                  { backgroundColor: colors.surface },
                  examType === exam.id && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text style={styles.examIcon}>{exam.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          ) : null}

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            style={styles.signupButton}
            icon={<ArrowRight size={20} color="#FFFFFF" />}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Already have an account?
        </Text>
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={[styles.loginText, { color: colors.primary }]}>
            Sign In
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
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerText: {
    fontSize: 28,
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
    paddingTop: Spacing.lg,
  },
  inputContainer: {
    marginTop: Spacing.sm,
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  inputInline: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  examButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    minWidth: 90,
  },
  examIcon: {
    fontSize: 20,
  },
  error: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  signupButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  footerText: {
    fontSize: FontSizes.md,
    marginRight: Spacing.xs,
  },
  loginText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
});
