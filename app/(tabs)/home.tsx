import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  Flame,
  Trophy,
  Calendar,
  Target,
  Brain,
  Users,
  Zap,
  Settings,
} from 'lucide-react-native';
import { useAuth, useTheme } from '@/context';
import { supabase } from '@/lib/supabase';
import {
  Card,
  StatCard,
  ProgressBar,
  Avatar,
  EmptyState,
  LoadingSpinner,
} from '@/components';
import {
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants';
import { getGreeting, formatHours } from '@/lib/utils';
import type { UserStats } from '@/types';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(4); // default, will be overwritten by user's setting
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState(4);

  const loadStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get study sessions
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes, started_at')
        .eq('user_id', user.id);

      // Get pomodoro sessions
      const { data: pomodoros } = await supabase
        .from('pomodoro_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      let dailyHours = 0;
      let weeklyHours = 0;
      let monthlyHours = 0;
      let totalMinutes = 0;

      sessions?.forEach((session) => {
        const sessionDate = new Date(session.started_at);
        totalMinutes += session.duration_minutes;

        if (sessionDate >= today) {
          dailyHours += session.duration_minutes / 60;
        }
        if (sessionDate >= weekAgo) {
          weeklyHours += session.duration_minutes / 60;
        }
        if (sessionDate >= monthAgo) {
          monthlyHours += session.duration_minutes / 60;
        }
      });

      // Calculate streak
      const streak = await calculateStreak();

      // Calculate rank
      const rank = await calculateRank();

      // Fetch user's daily goal setting
      const { data: userData } = await supabase
        .from('users')
        .select('daily_goal_hours')
        .eq('id', user.id)
        .single();

      if (userData?.daily_goal_hours) {
        setDailyGoal(userData.daily_goal_hours);
        setTempGoal(userData.daily_goal_hours);
      }

      setStats({
        total_hours: totalMinutes / 60,
        daily_hours: dailyHours,
        weekly_hours: weeklyHours,
        monthly_hours: monthlyHours,
        current_streak: streak,
        pomodoro_count: pomodoros?.length || 0,
        rank,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const calculateStreak = async (): Promise<number> => {
    if (!user) return 0;

    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('started_at')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (!sessions || sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's a session today
    const todaySession = sessions.some((s) => {
      const sessionDate = new Date(s.started_at);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    if (!todaySession) {
      // Check yesterday
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const yesterdaySession = sessions.some((s) => {
        const sessionDate = new Date(s.started_at);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === yesterday.getTime();
      });

      if (!yesterdaySession) return 0;
    }

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const hasSession = sessions.some((s) => {
        const sessionDate = new Date(s.started_at);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });

      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  const calculateRank = async (): Promise<number> => {
    if (!user) return 0;

    const { data: allSessions } = await supabase
      .from('study_sessions')
      .select('user_id, duration_minutes');

    if (!allSessions || allSessions.length === 0) return 1;

    const userTotals: Record<string, number> = {};
    allSessions.forEach((s) => {
      userTotals[s.user_id] = (userTotals[s.user_id] || 0) + s.duration_minutes;
    });

    const sorted = Object.entries(userTotals).sort((a, b) => b[1] - a[1]);
    const rank = sorted.findIndex(([id]) => id === user.id) + 1;

    return rank || sorted.length + 1;
  };

  useEffect(() => {
    if (user) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [user, loadStats]);

  const greeting = getGreeting();
  const userName = user?.full_name?.split(' ')[0] || 'Student';

  const weeklyGoal = dailyGoal * 7;
  const progress = stats ? Math.min((stats.daily_hours / dailyGoal) * 100, 100) : 0;

  const saveDailyGoal = async (goalHours: number) => {
    if (!user) return;
    try {
      await supabase
        .from('users')
        .update({ daily_goal_hours: goalHours })
        .eq('id', user.id);
      setDailyGoal(goalHours);
      setTempGoal(goalHours);
      setShowGoalModal(false);
    } catch (err) {
      console.error('Error saving daily goal:', err);
    }
  };

  const quickActions = [
    {
      icon: Clock,
      label: 'Start Studying',
      route: '/timer',
      color: colors.primary,
    },
    {
      icon: Brain,
      label: 'Pomodoro',
      route: '/timer',
      color: colors.secondary,
    },
    {
      icon: Users,
      label: 'Community',
      route: '/community',
      color: colors.accent,
    },
    {
      icon: Trophy,
      label: 'Leaderboard',
      route: '/leaderboard',
      color: '#F59E0B',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadStats} />
        }
      >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {greeting}
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
        </View>
        <Avatar name={user?.full_name || undefined} source={user?.avatar_url} size="lg" />
      </View>

      {/* Daily Progress Card */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.progressCard}
      >
        <View style={styles.progressHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.progressTitle}>Daily Goal</Text>
              <TouchableOpacity
                onPress={() => setShowGoalModal(true)}
                style={styles.goalSettingsBtn}
              >
                <Settings size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.progressSubtitle}>
              {stats ? formatHours(stats.daily_hours) : '0h'} / {dailyGoal}h today
            </Text>
          </View>
          <Text style={styles.progressPercentage}>
            {progress.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </View>
        {stats?.current_streak && stats.current_streak > 0 ? (
          <View style={styles.streakContainer}>
            <Flame size={16} color="#FFFFFF" />
            <Text style={styles.streakText}>
              {stats.current_streak} day streak
            </Text>
          </View>
        ) : null}
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(action.route as any)}
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface },
            ]}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: action.color + '20' },
              ]}
            >
              <action.icon size={20} color={action.color} />
            </View>
            <Text
              style={[styles.actionText, { color: colors.text }]}
              numberOfLines={1}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Stats
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="This Week"
            value={stats?.weekly_hours || 0}
            format="hours"
            icon={<Clock size={24} color={colors.primary} />}
          />
          <StatCard
            title="This Month"
            value={stats?.monthly_hours || 0}
            format="hours"
            icon={<Calendar size={24} color={colors.secondary} />}
          />
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Hours"
            value={stats?.total_hours || 0}
            format="hours"
            icon={<Target size={24} color={colors.accent} />}
          />
          <StatCard
            title="Pomodoros"
            value={stats?.pomodoro_count || 0}
            format="none"
            icon={<Zap size={24} color={colors.accent} />}
          />
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Weekly Progress
        </Text>
        {stats ? (
          <Card style={styles.weeklyCard}>
            <ProgressBar
              progress={stats.weekly_hours}
              total={weeklyGoal}
              showLabel
            />
            <View style={styles.weeklyStats}>
              <View style={styles.weeklyStat}>
                <Clock size={16} color={colors.primary} />
                <Text style={[styles.weeklyText, { color: colors.textSecondary }]}>
                  {formatHours(stats.daily_hours)} today
                </Text>
              </View>
              <Text style={[styles.weeklyText, { color: colors.textSecondary }]}>
                Goal: {weeklyGoal}h
              </Text>
            </View>
          </Card>
        ) : (
          <EmptyState
            icon={<Target size={48} color={colors.textTertiary} />}
            title="No Stats Yet"
            message="Start studying to track your progress"
          />
        )}
      </View>

      {/* Streak Card */}
      {stats?.current_streak && stats.current_streak > 0 && (
        <View style={styles.section}>
          <Card style={styles.streakCard}>
            <View style={styles.streakCardContent}>
              <Flame size={32} color={colors.accent} />
              <View style={styles.streakTextContainer}>
                <Text style={[styles.streakTitle, { color: colors.text }]}>
                  {stats.current_streak} Day Streak
                </Text>
                <Text style={[styles.streakMessage, { color: colors.textSecondary }]}>
                  Keep going! You're doing great.
                </Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Tips Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Study Tips
        </Text>
        <Card style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Zap size={20} color={colors.accent} />
            <Text style={[styles.tipTitle, { color: colors.text }]}>
              Focus Tip
            </Text>
          </View>
          <Text style={[styles.tipMessage, { color: colors.textSecondary }]}>
            Remove distractions and set a clear goal for each study session.
            Try the Pomodoro technique for better focus!
          </Text>
        </Card>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>

    {/* Daily Goal Picker Modal */}
    <Modal
      visible={showGoalModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowGoalModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowGoalModal(false)}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Set Daily Goal</Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            How many hours do you want to study each day?
          </Text>

          <View style={styles.goalOptions}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
              <TouchableOpacity
                key={hours}
                onPress={() => saveDailyGoal(hours)}
                style={[
                  styles.goalOption,
                  {
                    backgroundColor: dailyGoal === hours ? colors.primary : colors.surfaceSecondary,
                    borderColor: dailyGoal === hours ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.goalOptionText,
                    { color: dailyGoal === hours ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {hours}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setShowGoalModal(false)}
            style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: 60,
  },
  greeting: {
    fontSize: FontSizes.md,
    marginBottom: 4,
  },
  userName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  progressCard: {
    marginHorizontal: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Shadows.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: '#FFFFFF',
  },
  progressSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  streakText: {
    fontSize: FontSizes.sm,
    color: '#FFFFFF',
    marginLeft: Spacing.xs,
    fontWeight: FontWeights.medium,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flex: 1,
    minWidth: '45%',
    ...Shadows.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  actionText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    flex: 1,
  },
  statsSection: {
    padding: Spacing.xl,
  },
  section: {
    padding: Spacing.xl,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  weeklyCard: {
    padding: Spacing.lg,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  weeklyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  weeklyText: {
    fontSize: FontSizes.sm,
  },
  streakCard: {
    marginTop: Spacing.xl,
  },
  streakCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakTextContainer: {
    marginLeft: Spacing.lg,
  },
  streakTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  streakMessage: {
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
  tipCard: {
    padding: Spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tipTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  tipMessage: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  goalSettingsBtn: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  goalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  goalOption: {
    width: 64,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  goalOptionText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  modalCloseBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
});
