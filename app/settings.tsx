import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Moon,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  User,
  Mail,
  Lock,
  Sun,
} from 'lucide-react-native';
import { useAuth, useTheme } from '@/context';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants';

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [streakReminder, setStreakReminder] = React.useState(true);
  const [studyReminder, setStudyReminder] = React.useState(true);

  const isDarkMode = theme === 'dark';

  type SettingItem = {
    icon: typeof User;
    label: string;
    onPress?: () => void;
    type?: 'toggle';
    value?: boolean;
    onToggle?: () => void;
  };

  const settingsGroups: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          onPress: () => router.push('/edit-profile'),
        },
        {
          icon: Mail,
          label: 'Change Email',
          onPress: () => router.push('/change-email'),
        },
        {
          icon: Lock,
          label: 'Change Password',
          onPress: () => router.push('/change-password'),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: isDarkMode ? Moon : Sun,
          label: 'Dark Mode',
          type: 'toggle',
          value: isDarkMode,
          onToggle: toggleTheme,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: () => setNotificationsEnabled(!notificationsEnabled),
        },
        {
          icon: Bell,
          label: 'Streak Reminder',
          type: 'toggle',
          value: streakReminder,
          onToggle: () => setStreakReminder(!streakReminder),
        },
        {
          icon: Bell,
          label: 'Study Reminder',
          type: 'toggle',
          value: studyReminder,
          onToggle: () => setStudyReminder(!studyReminder),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          onPress: () => router.push('/help-center'),
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          onPress: () => router.push('/privacy-policy'),
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      {settingsGroups.map((group, groupIndex) => (
        <View key={groupIndex} style={styles.group}>
          <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
            {group.title}
          </Text>
          <View style={[styles.groupContent, { backgroundColor: colors.surface }]}>
            {group.items.map((item, itemIndex) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={item.type === 'toggle' ? item.onToggle : item.onPress}
                  style={[
                    styles.item,
                    itemIndex < group.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={[styles.itemIcon, { backgroundColor: colors.primary + '20' }]}>
                    <IconComponent size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.itemLabel, { color: colors.text }]}>
                    {item.label}
                  </Text>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={item.value ? '#FFFFFF' : '#f4f3f4'}
                    />
                  ) : (
                    <ChevronRight size={20} color={colors.textTertiary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          StudySync v1.0.0
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  group: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  groupTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  groupContent: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  itemLabel: {
    flex: 1,
    fontSize: FontSizes.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: FontSizes.sm,
  },
});
