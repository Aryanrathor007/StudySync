import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, Lock, User as UserIcon, Bell, Mail, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/context';
import { FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const sections = [
    {
      icon: UserIcon,
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, such as when you create an account, update your profile, or use StudySync features. This includes your name, email address, exam type, and study session data.',
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: 'We use the information we collect to provide, maintain, and improve our services. This includes tracking your study sessions, calculating your rankings on leaderboards, and personalizing your experience.',
    },
    {
      icon: Bell,
      title: 'Data Sharing',
      content: 'We may share your information with third parties only in limited circumstances: with your consent, to comply with legal obligations, or to protect our rights and the safety of our users.',
    },
    {
      icon: Mail,
      title: 'Marketing Communications',
      content: 'With your consent, we may send you promotional communications about StudySync features, updates, and tips. You can opt out of these communications at any time through your settings.',
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
    },
    {
      icon: AlertCircle,
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal information. You can also export your data or close your account at any time through the app settings.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.iconSection}>
          <View style={[styles.iconBg, { backgroundColor: colors.primary + '20' }]}>
            <Shield size={40} color={colors.primary} />
          </View>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            Last updated: June 24, 2026
          </Text>
        </View>

        <View style={styles.intro}>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            At StudySync, we take your privacy seriously. This policy explains what information we collect, how we use it, and your rights regarding your data.
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '20' }]}>
                <section.icon size={20} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {section.content}
            </Text>
          </View>
        ))}

        <View style={styles.contact}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>
            Contact Us
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <Text style={[styles.contactEmail, { color: colors.primary }]}>
              privacy@studysync.app
            </Text>
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
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
    paddingVertical: Spacing.xl,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
  },
  intro: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  introText: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
  section: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    flex: 1,
  },
  sectionContent: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  contact: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  contactTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  contactText: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  contactEmail: {
    fontWeight: FontWeights.semibold,
  },
});
