import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Brain,
  ChevronRight,
  Zap,
  BookOpen,
  Lightbulb,
} from 'lucide-react-native';
import { useAuth, useTheme } from '@/context';
import { Card, ProgressBar, LoadingSpinner } from '@/components';
import { FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants';
import { supabase } from '@/lib/supabase';

interface StudyPattern {
  day: string;
  avg_hours: number;
  peak_time: string;
}

interface SuggestedPlan {
  title: string;
  description: string;
  hours: number;
  icon: React.ReactNode;
  color: string;
}

interface WeeklyPlan {
  day: string;
  focus: string;
  hours: number;
  completed: boolean;
}

export default function PlannerScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false); // Start immediately, load progressively
  const [patterns, setPatterns] = useState<StudyPattern[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedPlan[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>([]);
  const [adaptiveGoal, setAdaptiveGoal] = useState(4);

  useEffect(() => {
    if (user) {
      loadPlannerData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadPlannerData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load last 30 days of sessions
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes, started_at')
        .eq('user_id', user.id)
        .gte('started_at', thirtyDaysAgo.toISOString());

      // Load user's daily goal
      const { data: userData } = await supabase
        .from('users')
        .select('daily_goal_hours')
        .eq('id', user.id)
        .single();

      const goal = userData?.daily_goal_hours || 4;
      setAdaptiveGoal(goal);

      if (sessions && sessions.length > 0) {
        // Analyze patterns by day of week
        const dayStats: Record<string, { total: number; count: number; hours: number[] }> = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        sessions.forEach((s) => {
          const date = new Date(s.started_at);
          const dayName = days[date.getDay()];
          const hour = date.getHours();
          if (!dayStats[dayName]) {
            dayStats[dayName] = { total: 0, count: 0, hours: [] };
          }
          dayStats[dayName].total += s.duration_minutes;
          dayStats[dayName].count++;
          dayStats[dayName].hours.push(hour);
        });

        const patternsData: StudyPattern[] = days.map((day) => {
          const stats = dayStats[day] || { total: 0, count: 0, hours: [] };
          const avgHours = stats.count > 0 ? stats.total / 60 / stats.count : 0;
          const hourCounts: Record<number, number> = {};
          stats.hours.forEach((h) => {
            hourCounts[h] = (hourCounts[h] || 0) + 1;
          });
          const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
          const peakTime = peakHour ? formatHour(parseInt(peakHour[0])) : 'Morning';
          return { day, avg_hours: avgHours, peak_time: peakTime };
        });
        setPatterns(patternsData);

        // Generate adaptive suggestions
        const totalWeekHours = Object.values(dayStats).reduce((sum, d) => sum + d.total / 60, 0);
        const avgDaily = totalWeekHours / 7;
        const weakDay = patternsData.sort((a, b) => a.avg_hours - b.avg_hours)[0];
        const strongDay = patternsData.sort((a, b) => b.avg_hours - a.avg_hours)[0];

        const suggestionsData: SuggestedPlan[] = [
          {
            title: `Boost ${weakDay.day}`,
            description: `Your weakest day. Schedule ${Math.max(1, goal - weakDay.avg_hours).toFixed(1)}h focus session.`,
            hours: Math.max(1, goal - weakDay.avg_hours),
            icon: <Target size={24} color="#EF4444" />,
            color: '#EF4444',
          },
          {
            title: `Maintain ${strongDay.day}`,
            description: `Your strongest day! Keep the momentum with consistent sessions.`,
            hours: strongDay.avg_hours,
            icon: <TrendingUp size={24} color="#22C55E" />,
            color: '#22C55E',
          },
          {
            title: 'Peak Focus Time',
            description: `You study best around ${patternsData[0].peak_time}. Block that time!`,
            hours: goal * 0.6,
            icon: <Brain size={24} color="#3B82F6" />,
            color: '#3B82F6',
          },
        ];
        setSuggestions(suggestionsData);

        // Generate weekly plan
        const focusAreas = ['Physics - Mechanics', 'Chemistry - Organic', 'Mathematics - Calculus', 'Physics - Electromagnetism', 'Chemistry - Inorganic', 'Mock Test & Review', 'Revision & Weak Areas'];
        const weeklyPlanData: WeeklyPlan[] = days.map((day, i) => ({
          day,
          focus: focusAreas[i % focusAreas.length],
          hours: i === 6 ? goal * 0.8 : goal, // Sunday lighter
          completed: false,
        }));
        setWeeklyPlan(weeklyPlanData);
      } else {
        // Default patterns for new users
        const defaultPatterns: StudyPattern[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => ({
          day,
          avg_hours: 0,
          peak_time: 'Morning',
        }));
        setPatterns(defaultPatterns);
        setSuggestions([
          {
            title: 'Start Your Journey',
            description: `Aim for ${goal}h daily. Begin with shorter sessions and build up.`,
            hours: goal,
            icon: <Zap size={24} color={colors.primary} />,
            color: colors.primary,
          },
        ]);
      }
    } catch (err) {
      console.error('Error loading planner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatHour = (hour: number): string => {
    if (hour < 6) return 'Night';
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 21) return 'Evening';
    return 'Night';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Adaptive Planner</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Personalized study recommendations based on your patterns
        </Text>
      </View>

      {/* Daily Goal Card */}
      <View style={styles.section}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.goalCard}
        >
          <View style={styles.goalHeader}>
            <Target size={24} color="#FFFFFF" />
            <Text style={styles.goalLabel}>Your Adaptive Daily Goal</Text>
          </View>
          <Text style={styles.goalValue}>{adaptiveGoal}h</Text>
          <Text style={styles.goalHint}>Based on your performance and exam timeline</Text>
        </LinearGradient>
      </View>

      {/* Weekly Insights */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Insights</Text>
        <Card style={styles.insightsCard}>
          <View style={styles.patternGrid}>
            {patterns.slice(0, 7).map((pattern, i) => (
              <View key={i} style={styles.patternItem}>
                <Text style={[styles.patternDay, { color: colors.text }]}>{pattern.day}</Text>
                <View
                  style={[
                    styles.patternBar,
                    {
                      height: Math.max(4, pattern.avg_hours * 12),
                      backgroundColor: pattern.avg_hours >= adaptiveGoal * 0.5 ? colors.success : colors.warning,
                    },
                  ]}
                />
                <Text style={[styles.patternHours, { color: colors.textSecondary }]}>
                  {pattern.avg_hours > 0 ? `${pattern.avg_hours.toFixed(1)}h` : '-'}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Adaptive Suggestions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Smart Suggestions</Text>
        {suggestions.map((suggestion, i) => (
          <TouchableOpacity key={i} activeOpacity={0.7}>
            <Card style={[styles.suggestionCard, { backgroundColor: suggestion.color + '10' }]}>
              <View style={styles.suggestionIcon}>{suggestion.icon}</View>
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionTitle, { color: suggestion.color }]}>{suggestion.title}</Text>
                <Text style={[styles.suggestionDesc, { color: colors.textSecondary }]}>{suggestion.description}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weekly Schedule */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Suggested Weekly Plan</Text>
        {weeklyPlan.map((plan, i) => (
          <Card key={i} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={[styles.planDay, { color: colors.text, fontWeight: FontWeights.semibold }]}>{plan.day}</Text>
              <View style={[styles.planHours, { backgroundColor: plan.completed ? colors.success + '20' : colors.surfaceSecondary }]}>
                <Text style={[styles.planHoursText, { color: plan.completed ? colors.success : colors.textSecondary }]}>
                  {plan.hours.toFixed(1)}h
                </Text>
              </View>
            </View>
            <Text style={[styles.planFocus, { color: colors.textSecondary }]}>{plan.focus}</Text>
          </Card>
        ))}
      </View>

      {/* Pro Tips */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Focus Tips</Text>
        <Card style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Lightbulb size={24} color={colors.accent} />
            <Text style={[styles.tipTitle, { color: colors.text }]}>Adaptive Planning</Text>
          </View>
          <Text style={[styles.tipMessage, { color: colors.textSecondary }]}>
            Your plan evolves based on your actual study patterns. Study consistently for 1-2 weeks to unlock personalized insights!
          </Text>
        </Card>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg },
  title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold },
  subtitle: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, marginBottom: Spacing.md },
  goalCard: { padding: Spacing.xl, borderRadius: BorderRadius.xl, ...Shadows.lg },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  goalLabel: { color: '#FFFFFF', fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  goalValue: { fontSize: 48, fontWeight: FontWeights.bold, color: '#FFFFFF', marginBottom: Spacing.xs },
  goalHint: { color: 'rgba(255,255,255,0.7)', fontSize: FontSizes.sm },
  insightsCard: { padding: Spacing.xl },
  patternGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  patternItem: { alignItems: 'center', flex: 1 },
  patternDay: { fontSize: FontSizes.xs, marginBottom: Spacing.sm },
  patternBar: { width: 20, borderRadius: 10, minHeight: 4 },
  patternHours: { fontSize: 10, marginTop: Spacing.xs },
  suggestionCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, marginBottom: Spacing.sm },
  suggestionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  suggestionContent: { flex: 1 },
  suggestionTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, marginBottom: 2 },
  suggestionDesc: { fontSize: FontSizes.sm },
  planCard: { padding: Spacing.lg, marginBottom: Spacing.sm },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  planDay: { fontSize: FontSizes.md },
  planHours: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  planHoursText: { fontSize: FontSizes.xs, fontWeight: FontWeights.medium },
  planFocus: { fontSize: FontSizes.sm },
  tipCard: { padding: Spacing.xl },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  tipTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  tipMessage: { fontSize: FontSizes.sm, lineHeight: 20 },
});
