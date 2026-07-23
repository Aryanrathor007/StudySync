import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useAuth, useTheme } from '@/context';
import { Input, Button } from '@/components';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function ChangeEmailScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = async () => {
    if (!newEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newEmail === user?.email) {
      Alert.alert('Error', 'New email must be different from current email');
      return;
    }

    setLoading(true);
    try {
      // First verify password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password,
      });

      if (signInError) {
        Alert.alert('Error', 'Incorrect password');
        setLoading(false);
        return;
      }

      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) throw updateError;

      // Update user table
      const { error: profileError } = await supabase
        .from('users')
        .update({ email: newEmail })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      Alert.alert(
        'Success',
        'A confirmation email has been sent to your new email address. Please confirm to complete the change.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Change Email</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.iconSection}>
          <View style={[styles.iconBg, { backgroundColor: colors.primary + '20' }]}>
            <Mail size={32} color={colors.primary} />
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.currentEmail}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Current Email
            </Text>
            <View style={[styles.emailBox, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.emailText, { color: colors.text }]}>
                {user?.email}
              </Text>
            </View>
          </View>

          <Input
            label="New Email Address"
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="Enter new email"
            keyboardType="email-address"
          />

          <Input
            label="Current Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            You will receive a confirmation email at your new address.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Update Email"
          onPress={handleChangeEmail}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  content: {
    flex: 1,
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    padding: Spacing.xl,
  },
  currentEmail: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  emailBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  emailText: {
    fontSize: FontSizes.md,
  },
  hint: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
});
