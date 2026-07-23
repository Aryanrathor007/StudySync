import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  LogOut,
  Clock,
  Flame,
  Trophy,
  Target,
  Calendar,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  Edit3,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth, useTheme } from '@/context';
import {
  Card,
  Avatar,
  StatCard,
  AchievementBadge,
  ProgressBar,
} from '@/components';
import {
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants';
import { formatHours } from '@/lib/utils';
import type { Achievement } from '@/types';

interface UserStats {
  total_hours: number;
  daily_hours: number;
  weekly_hours: number;
  monthly_hours: number;
  current_streak: number;
  pomodoro_count: number;
  rank: number;
  daily_goal_hours: number;
}

interface WeeklyReport {
  total_hours: number;
  sessions_count: number;
  avg_daily: number;
  best_day: { day: string; hours: number } | null;
  trend: 'up' | 'down' | 'same';
  trend_value: number;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

const EXAM_DATES: Record<string, { date: string; name: string }> = {
  'JEE': { date: '2027-01-15', name: 'JEE Main 2027' },
  'NEET': { date: '2027-05-04', name: 'NEET 2027' },
  'UPSC': { date: '2027-05-25', name: 'UPSC CSE 2027' },
  'GATE': { date: '2027-02-07', name: 'GATE 2027' },
  'CAT': { date: '2027-11-26', name: 'CAT 2027' },
  'SSC': { date: '2027-04-15', name: 'SSC CGL 2027' },
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<(Achievement & { unlocked: boolean })[]>([]);
  const [examDate, setExamDate] = useState<string | null>(null);
  const [examName, setExamName] = useState<string>('JEE Main');
  const [showExamModal, setShowExamModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load all data in ONE parallel call
  const loadAllData = useCallback(async () => {
    if (!user) return;

    try {
      // SINGLE parallel batch - all queries run simultaneously
      const [
        sessionsRes,
        pomodorosRes,
        userRes,
        allSessionsRes,
        achievementsRes,
        userAchievementsRes,
      ] = await Promise.all([
        supabase.from('study_sessions').select('duration_minutes, started_at').eq('user_id', user.id),
        supabase.from('pomodoro_sessions').select('id').eq('user_id', user.id).eq('completed', true),
        supabase.from('users').select('daily_goal_hours, exam_date, exam_name, exam_type').eq('id', user.id).single(),
        supabase.from('study_sessions').select('user_id, duration_minutes, started_at'),
        supabase.from('achievements').select('*'),
        supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', user.id),
      ]);

      const sessions = sessionsRes.data || [];
      const pomodoros = pomodorosRes.data || [];
      const userData = userRes.data;
      const allSessions = allSessionsRes.data || [];
      const achievements = achievementsRes.data || [];
      const userAchieveData = userAchievementsRes.data || [];

      // Calculate all stats in memory (no extra API calls)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      let dailyHours = 0;
      let weeklyHours = 0;
      let monthlyHours = 0;
      let totalMinutes = 0;

      const weekAgoForReport = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      let thisWeekMinutes = 0;
      let lastWeekMinutes = 0;
      let thisWeekCount = 0;
      const dayTotals: Record<string, number> = {};

      sessions.forEach((session) => {
        const sessionDate = new Date(session.started_at);
        totalMinutes += session.duration_minutes;

        if (sessionDate >= today) dailyHours += session.duration_minutes / 60;
        if (sessionDate >= weekAgo) weeklyHours += session.duration_minutes / 60;
        if (sessionDate >= monthAgo) monthlyHours += session.duration_minutes / 60;

        // Weekly report calculations
        if (sessionDate >= weekAgoForReport) {
          thisWeekMinutes += session.duration_minutes;
          thisWeekCount++;
          const day = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });
          dayTotals[day] = (dayTotals[day] || 0) + session.duration_minutes / 60;
        } else if (sessionDate >= twoWeeksAgo) {
          lastWeekMinutes += session.duration_minutes;
        }
      });

      // Calculate streak
      const sortedSessions = [...sessions].sort((a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      );
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        checkDate.setHours(0, 0, 0, 0);
        const hasSession = sortedSessions.some((s) => {
          const sd = new Date(s.started_at);
          sd.setHours(0, 0, 0, 0);
          return sd.getTime() === checkDate.getTime();
        });
        if (hasSession) streak++;
        else if (i > 0) break;
      }

      // Calculate rank
      const userTotals: Record<string, number> = {};
      allSessions.forEach((s) => {
        userTotals[s.user_id] = (userTotals[s.user_id] || 0) + s.duration_minutes;
      });
      const sorted = Object.entries(userTotals).sort((a, b) => b[1] - a[1]);
      const rank = sorted.findIndex(([id]) => id === user.id) + 1 || sorted.length + 1;

      const dailyGoal = userData?.daily_goal_hours || 4;

      setStats({
        total_hours: totalMinutes / 60,
        daily_hours: dailyHours,
        weekly_hours: weeklyHours,
        monthly_hours: monthlyHours,
        current_streak: streak,
        pomodoro_count: pomodoros.length,
        rank,
        daily_goal_hours: dailyGoal,
      });

      // Weekly report
      const thisWeekHours = thisWeekMinutes / 60;
      const lastWeekHours = lastWeekMinutes / 60;
      const bestDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];

      setWeeklyReport({
        total_hours: thisWeekHours,
        sessions_count: thisWeekCount,
        avg_daily: thisWeekHours / 7,
        best_day: bestDay ? { day: bestDay[0], hours: bestDay[1] } : null,
        trend: thisWeekHours > lastWeekHours ? 'up' : thisWeekHours < lastWeekHours ? 'down' : 'same',
        trend_value: Math.abs(thisWeekHours - lastWeekHours),
      });

      // Achievements
      const unlockedIds = userAchieveData.map((ua: any) => ua.achievement_id);
      setAllAchievements(achievements.map((a) => ({ ...a, unlocked: unlockedIds.includes(a.id) })));
      setUserAchievements(userAchieveData);

      // Exam date
      if (userData?.exam_date) {
        setExamDate(userData.exam_date);
        setExamName(userData.exam_name || 'My Exam');
      } else if (userData?.exam_type && EXAM_DATES[userData.exam_type]) {
        setExamDate(EXAM_DATES[userData.exam_type].date);
        setExamName(EXAM_DATES[userData.exam_type].name);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const updateExamDate = async (date: string, name: string) => {
    if (!user) return;
    await supabase.from('users').update({ exam_date: date, exam_name: name }).eq('id', user.id);
    setExamDate(date);
    setExamName(name);
    setShowExamModal(false);
  };

  const getDaysUntilExam = () => {
    if (!examDate) return null;
    const exam = new Date(examDate);
    const now = new Date();
    const diff = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const userName = user?.full_name || 'Student';
  const userExam = user?.exam_type || 'Other';
  const daysUntilExam = getDaysUntilExam();

  const SkeletonCard = () => (
    <View style={[styles.skeletonCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.skeletonRow, { backgroundColor: colors.surfaceSecondary }]} />
      <View style={[styles.skeletonShort, { backgroundColor: colors.surfaceSecondary }]} />
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBg}
        />
        <View style={styles.headerContent}>
          <Avatar name={userName} source={user?.avatar_url} size="xl" showOnline isOnline />
          <Text style={styles.userName} numberOfLines={2}>{userName}</Text>
          <View style={[styles.examBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <Text style={styles.examBadgeText}>{userExam}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={[styles.headerBtn, { backgroundColor: colors.surface }]}
          >
            <Settings size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Exam Countdown */}
      {daysUntilExam !== null ? (
        <TouchableOpacity onPress={() => setShowExamModal(true)} style={styles.countdownSection}>
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.countdownCard}
          >
            <View style={styles.countdownHeader}>
              <CalendarDays size={20} color="#FFFFFF" />
              <Text style={styles.countdownLabel}>{examName}</Text>
              <Edit3 size={14} color="rgba(255,255,255,0.6)" />
            </View>
            <View style={styles.countdownValueRow}>
              <Text style={styles.countdownValue}>{daysUntilExam}</Text>
              <Text style={styles.countdownUnit}>days left</Text>
            </View>
            <ProgressBar progress={Math.max(0, 365 - daysUntilExam)} total={365} showLabel={false} />
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setShowExamModal(true)} style={styles.addExamBtn}>
          <Card style={styles.addExamCard}>
            <CalendarDays size={24} color={colors.primary} />
            <Text style={[styles.addExamText, { color: colors.text }]}>Add Exam Countdown</Text>
            <Text style={[styles.addExamHint, { color: colors.textSecondary }]}>Set your target exam date</Text>
          </Card>
        </TouchableOpacity>
      )}

      {/* Quick Stats */}
      <View style={styles.statsOverview}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats ? formatHours(stats.total_hours) : '--'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Hours</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats?.current_streak ?? '--'}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>#{stats?.rank ?? '--'}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rank</Text>
        </View>
      </View>

      {/* Weekly Report Card */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Report Card</Text>
        {weeklyReport ? (
          <Card style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportTrend}>
                {weeklyReport.trend === 'up' && <TrendingUp size={24} color="#22C55E" />}
                {weeklyReport.trend === 'down' && <TrendingDown size={24} color="#EF4444" />}
                {weeklyReport.trend === 'same' && <Minus size={24} color={colors.textSecondary} />}
              </View>
              <View>
                <Text style={[styles.reportTrendText, { color: colors.text }]}>
                  {weeklyReport.trend === 'up' ? 'Great progress!' : weeklyReport.trend === 'down' ? 'Keep pushing!' : 'Steady!'}
                </Text>
                <Text style={[styles.reportTrendSub, { color: colors.textSecondary }]}>
                  {weeklyReport.trend !== 'same' ? `${weeklyReport.trend_value.toFixed(1)}h ${weeklyReport.trend === 'up' ? 'more' : 'less'} than last week` : 'Same as last week'}
                </Text>
              </View>
            </View>

            <View style={styles.reportGrid}>
              <View style={styles.reportStat}>
                <Text style={[styles.reportStatValue, { color: colors.primary }]}>{weeklyReport.total_hours.toFixed(1)}h</Text>
                <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>Total</Text>
              </View>
              <View style={styles.reportStat}>
                <Text style={[styles.reportStatValue, { color: colors.secondary }]}>{weeklyReport.sessions_count}</Text>
                <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>Sessions</Text>
              </View>
              <View style={styles.reportStat}>
                <Text style={[styles.reportStatValue, { color: colors.accent }]}>{weeklyReport.avg_daily.toFixed(1)}h</Text>
                <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>Avg/Day</Text>
              </View>
            </View>

            {weeklyReport.best_day && (
              <View style={[styles.bestDayRow, { backgroundColor: colors.surfaceSecondary }]}>
                <Trophy size={16} color={colors.accent} />
                <Text style={[styles.bestDayText, { color: colors.text }]}>
                  Best: {weeklyReport.best_day.day} ({weeklyReport.best_day.hours.toFixed(1)}h)
                </Text>
              </View>
            )}
          </Card>
        ) : <SkeletonCard />}
      </View>

      {/* Weekly Progress */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Progress</Text>
        {stats ? (
          <Card style={styles.progressCard}>
            <ProgressBar progress={stats.weekly_hours} total={(stats.daily_goal_hours || 4) * 7} showLabel />
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Clock size={16} color={colors.primary} />
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  {formatHours(stats.daily_hours)} today
                </Text>
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>Goal: {(stats.daily_goal_hours || 4) * 7}h</Text>
            </View>
          </Card>
        ) : <SkeletonCard />}
      </View>

      {/* Stats Grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard title="Today" value={stats?.daily_hours || 0} format="hours" icon={<Clock size={24} color={colors.primary} />} />
          <StatCard title="This Week" value={stats?.weekly_hours || 0} format="hours" icon={<Calendar size={24} color={colors.secondary} />} />
        </View>
        <View style={styles.statsGrid}>
          <StatCard title="Pomodoros" value={stats?.pomodoro_count || 0} format="none" icon={<Zap size={24} color={colors.accent} />} />
          <StatCard title="Achievements" value={userAchievements.length} format="none" icon={<Trophy size={24} color={colors.accent} />} />
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
          {allAchievements.length > 0 ? (
            allAchievements.slice(0, 8).map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} unlocked={achievement.unlocked} size="md" />
            ))
          ) : (
            <Text style={[styles.noData, { color: colors.textSecondary }]}>Start studying to unlock achievements!</Text>
          )}
        </ScrollView>
      </View>

      {/* Streak Card */}
      {stats?.current_streak && stats.current_streak > 0 && (
        <View style={styles.section}>
          <Card style={styles.streakCard}>
            <View style={styles.streakCardContent}>
              <Flame size={32} color={colors.accent} />
              <View style={styles.streakTextContainer}>
                <Text style={[styles.streakTitle, { color: colors.text }]}>{stats.current_streak} Day Streak!</Text>
                <Text style={[styles.streakMessage, { color: colors.textSecondary }]}>Keep going! You're doing great.</Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Sign Out */}
      <View style={styles.menu}>
        <TouchableOpacity onPress={handleSignOut} style={[styles.menuItem, { backgroundColor: colors.surface }]}>
          <View style={[styles.menuIcon, { backgroundColor: colors.error + '20' }]}>
            <LogOut size={20} color={colors.error} />
          </View>
          <Text style={[styles.menuText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 120 }} />

      {/* Exam Date Modal */}
      <Modal visible={showExamModal} transparent animationType="fade" onRequestClose={() => setShowExamModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowExamModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set Exam Countdown</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Choose your target exam</Text>
            {Object.entries(EXAM_DATES).map(([key, val]) => (
              <TouchableOpacity key={key} onPress={() => updateExamDate(val.date, val.name)} style={[styles.examOption, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.examOptionText, { color: colors.text }]}>{val.name}</Text>
                <Text style={[styles.examOptionDate, { color: colors.textSecondary }]}>{val.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { position: 'relative', marginBottom: 60 },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerContent: { alignItems: 'center', marginTop: 80 },
  userName: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: '#FFFFFF', marginTop: Spacing.md, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, textAlign: 'center', paddingHorizontal: Spacing.lg },
  examBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, marginTop: Spacing.sm },
  examBadgeText: { color: '#FFFFFF', fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  headerActions: { position: 'absolute', top: 50, right: Spacing.xl, flexDirection: 'row', gap: Spacing.md },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  countdownSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  countdownCard: { padding: Spacing.xl, borderRadius: BorderRadius.xl, ...Shadows.lg },
  countdownHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  countdownLabel: { color: '#FFFFFF', fontSize: FontSizes.md, fontWeight: FontWeights.semibold, flex: 1 },
  countdownValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginBottom: Spacing.lg },
  countdownValue: { fontSize: 56, fontWeight: FontWeights.bold, color: '#FFFFFF' },
  countdownUnit: { fontSize: FontSizes.lg, color: 'rgba(255,255,255,0.8)' },
  addExamBtn: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  addExamCard: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
  addExamText: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold },
  addExamHint: { fontSize: FontSizes.sm },
  statsOverview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl, gap: Spacing.lg },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: FontWeights.bold },
  statLabel: { fontSize: FontSizes.sm, marginTop: 2 },
  statDivider: { width: 1, height: 40 },
  section: { padding: Spacing.xl, paddingTop: 0, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, marginBottom: Spacing.md },
  reportCard: { padding: Spacing.xl },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  reportTrend: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  reportTrendText: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold },
  reportTrendSub: { fontSize: FontSizes.sm },
  reportGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.lg },
  reportStat: { alignItems: 'center' },
  reportStatValue: { fontSize: 28, fontWeight: FontWeights.bold },
  reportStatLabel: { fontSize: FontSizes.sm, marginTop: 2 },
  bestDayRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.lg },
  bestDayText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  progressCard: { padding: Spacing.lg },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  progressStat: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  progressText: { fontSize: FontSizes.sm },
  noData: { textAlign: 'center', paddingVertical: Spacing.lg },
  statsGrid: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  achievementsScroll: { paddingVertical: Spacing.sm },
  streakCard: { marginTop: Spacing.md },
  streakCardContent: { flexDirection: 'row', alignItems: 'center' },
  streakTextContainer: { marginLeft: Spacing.lg },
  streakTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  streakMessage: { fontSize: FontSizes.sm, marginTop: 4 },
  menu: { paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg },
  menuIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  menuText: { fontSize: FontSizes.md, fontWeight: FontWeights.medium },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  modalContent: { width: '100%', maxWidth: 320, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.lg },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, textAlign: 'center', marginBottom: Spacing.sm },
  modalSubtitle: { fontSize: FontSizes.sm, textAlign: 'center', marginBottom: Spacing.xl },
  examOption: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  examOptionText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  examOptionDate: { fontSize: FontSizes.sm, marginTop: 2 },
  skeletonCard: { padding: Spacing.xl, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  skeletonRow: { height: 20, borderRadius: 4, marginBottom: Spacing.sm },
  skeletonShort: { height: 16, borderRadius: 4, width: '60%' },
});
