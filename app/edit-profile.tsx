import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Camera } from 'lucide-react-native';
import { useAuth, useTheme } from '@/context';
import { Input, Button, Avatar } from '@/components';
import { FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants';
import { supabase } from '@/lib/supabase';

const EXAM_TYPES = [
  { id: 'JEE', label: 'JEE' },
  { id: 'NEET', label: 'NEET' },
  { id: 'UPSC', label: 'UPSC' },
  { id: 'SSC', label: 'SSC' },
  { id: 'GATE', label: 'GATE' },
  { id: 'CAT', label: 'CAT' },
  { id: 'Other', label: 'Other' },
];

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [examType, setExamType] = useState(user?.exam_type || 'Other');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        exam_type: examType,
      });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
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
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer}>
            <Avatar name={fullName || 'User'} source={user?.avatar_url} size="xl" />
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
            Tap to change photo
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

          <Text style={[styles.label, { color: colors.text }]}>Select Your Exam</Text>
          <View style={styles.examGrid}>
            {EXAM_TYPES.map((exam) => (
              <TouchableOpacity
                key={exam.id}
                onPress={() => setExamType(exam.id)}
                style={[
                  styles.examButton,
                  { backgroundColor: colors.surface },
                  examType === exam.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.examText,
                    { color: examType === exam.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {exam.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.emailSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Email Address
            </Text>
            <View style={[styles.emailDisplay, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.emailText, { color: colors.text }]}>
                {user?.email}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/change-email')}>
              <Text style={[styles.changeLink, { color: colors.primary }]}>
                Change Email
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/change-password')}
            style={[styles.passwordSection, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.passwordLabel, { color: colors.text }]}>
              Change Password
            </Text>
            <Text style={[styles.passwordHint, { color: colors.textSecondary }]}>
              Update your password
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Save Changes" onPress={handleSave} loading={loading} />
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  avatarHint: {
    marginTop: Spacing.md,
    fontSize: FontSizes.sm,
  },
  form: {
    padding: Spacing.xl,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  examButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  examText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  emailSection: {
    marginTop: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  emailDisplay: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  emailText: {
    fontSize: FontSizes.md,
  },
  changeLink: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    marginTop: Spacing.sm,
  },
  passwordSection: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  passwordLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  passwordHint: {
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
});
