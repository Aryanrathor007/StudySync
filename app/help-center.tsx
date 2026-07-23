import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, HelpCircle, Clock, Users, Trophy, Timer, Settings, MessageCircle, Mail, BookOpen } from 'lucide-react-native';
import { useTheme } from '@/context';
import { FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I join a community?',
    answer: 'Go to the Community tab, browse the available communities (JEE, NEET, UPSC, etc.), and tap "Join" on any community you want to be part of. You can join multiple communities.',
  },
  {
    category: 'Study Timer',
    question: 'How does the study timer work?',
    answer: 'Go to the Timer tab and select "Study" mode. Tap "Start" to begin tracking your session. You can pause, resume, or stop at any time. When you stop, your session is automatically saved.',
  },
  {
    category: 'Study Timer',
    question: 'What is the Pomodoro technique?',
    answer: 'The Pomodoro technique involves studying in focused 25-minute intervals followed by short 5-minute breaks. Switch to "Pomodoro" mode in the Timer tab to use this feature.',
  },
  {
    category: 'Leaderboard',
    question: 'How are rankings calculated?',
    answer: 'Rankings are based on total study hours within the selected time period (daily, weekly, or monthly). The more you study, the higher your rank!',
  },
  {
    category: 'Streaks',
    question: 'How do I maintain a streak?',
    answer: 'Study at least once every day to maintain your streak. A streak counts consecutive days of studying. If you miss a day, your streak resets.',
  },
  {
    category: 'Account',
    question: 'How do I change my exam type?',
    answer: 'Go to Profile tab, tap "Edit Profile", select your new exam type, and save your changes. Your stats will transfer to the new community.',
  },
  {
    category: 'Account',
    question: 'Can I reset my progress?',
    answer: 'Currently, we don\'t support resetting progress. All study sessions are permanently recorded to ensure fair leaderboards.',
  },
];

export default function HelpCenterScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const categories = [...new Set(faqs.map(f => f.category))];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.iconSection}>
          <View style={[styles.iconBg, { backgroundColor: colors.primary + '20' }]}>
            <HelpCircle size={40} color={colors.primary} />
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Find answers to common questions
          </Text>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity style={[styles.quickLink, { backgroundColor: colors.surface }]}>
            <Clock size={24} color={colors.primary} />
            <Text style={[styles.quickLinkTitle, { color: colors.text }]}>Getting Started</Text>
            <Text style={[styles.quickLinkDesc, { color: colors.textSecondary }]}>Learn the basics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickLink, { backgroundColor: colors.surface }]}>
            <Timer size={24} color={colors.secondary} />
            <Text style={[styles.quickLinkTitle, { color: colors.text }]}>Timer Guide</Text>
            <Text style={[styles.quickLinkDesc, { color: colors.textSecondary }]}>Study & Pomodoro</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={[styles.faqTitle, { color: colors.text }]}>Frequently Asked Questions</Text>

          {categories.map((category, catIndex) => (
            <View key={catIndex} style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: colors.primary }]}>
                {category}
              </Text>
              {faqs.filter(f => f.category === category).map((faq, faqIndex) => (
                <View key={faqIndex} style={[styles.faqItem, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.question, { color: colors.text }]}>
                    {faq.question}
                  </Text>
                  <Text style={[styles.answer, { color: colors.textSecondary }]}>
                    {faq.answer}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>
            Need More Help?
          </Text>
          <View style={[styles.contactCard, { backgroundColor: colors.surface }]}>
            <View style={styles.contactItem}>
              <Mail size={20} color={colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.text }]}>Email Support</Text>
                <Text style={[styles.contactValue, { color: colors.textSecondary }]}>
                  support@studysync.app
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Study Tips */}
        <View style={styles.tipsSection}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>Study Tips</Text>
          <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
            <BookOpen size={20} color={colors.accent} />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.text }]}>
                Consistency is Key
              </Text>
              <Text style={[styles.tipDesc, { color: colors.textSecondary }]}>
                Study for at least 2-3 hours daily rather than cramming on weekends. Regular study helps with better retention.
              </Text>
            </View>
          </View>
          <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
            <Timer size={20} color={colors.secondary} />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.text }]}>
                Use Pomodoro Technique
              </Text>
              <Text style={[styles.tipDesc, { color: colors.textSecondary }]}>
                Break your study into 25-minute focused sessions with 5-minute breaks. This improves concentration and prevents burnout.
              </Text>
            </View>
          </View>
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
  subtitle: {
    fontSize: FontSizes.md,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  quickLinks: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickLink: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  quickLinkTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.sm,
  },
  quickLinkDesc: {
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
  faqSection: {
    paddingHorizontal: Spacing.xl,
  },
  faqTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.lg,
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.md,
  },
  faqItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  question: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  answer: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  contactSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  contactTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.md,
  },
  contactCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: Spacing.md,
  },
  contactLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  contactValue: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  tipsSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  tipsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  tipContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  tipTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: FontSizes.sm,
    lineHeight: 18,
  },
});
