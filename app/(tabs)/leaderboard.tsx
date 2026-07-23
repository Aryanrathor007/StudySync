import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Flame, Clock } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth, useTheme } from '@/context';
import { Card, Avatar, LoadingSpinner } from '@/components';
import {
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants';

type TimeFilter = 'daily' | 'weekly' | 'monthly';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_hours: number;
  streak: number;
  rank: number;
}

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [filter, setFilter] = useState<TimeFilter>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [userStats, setUserStats] = useState({ hours: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);

    try {
      const now = new Date();
      const startDate = new Date();

      if (filter === 'daily') {
        startDate.setHours(0, 0, 0, 0);
      } else if (filter === 'weekly') {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setMonth(startDate.getMonth() - 1);
      }

      // Get all study sessions within the time period
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('user_id, duration_minutes, started_at')
        .gte('started_at', startDate.toISOString());

      if (sessionsError) throw sessionsError;

      if (!sessions || sessions.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      // Calculate totals per user
      const userTotals: Record<string, number> = {};
      sessions.forEach((s) => {
        userTotals[s.user_id] = (userTotals[s.user_id] || 0) + (s.duration_minutes || 0);
      });

      // Get user profiles
      const userIds = Object.keys(userTotals);
      const { data: profiles, error: profilesError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Calculate streaks for each user
      const streaks: Record<string, number> = {};
      for (const userId of userIds) {
        const { data: userSessions } = await supabase
          .from('study_sessions')
          .select('started_at')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(30);

        if (userSessions && userSessions.length > 0) {
          let streak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const hasSession = userSessions.some((s) => {
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
          streaks[userId] = streak;
        } else {
          streaks[userId] = 0;
        }
      }

      // Build leaderboard
      const entries: LeaderboardEntry[] = (profiles || []).map((p) => ({
        user_id: p.id,
        full_name: p.full_name || 'Anonymous',
        avatar_url: p.avatar_url,
        total_hours: (userTotals[p.id] || 0) / 60,
        streak: streaks[p.id] || 0,
        rank: 0,
      }));

      entries.sort((a, b) => b.total_hours - a.total_hours);
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaderboard(entries);

      // Get current user's rank and stats
      const myEntry = entries.find((e) => e.user_id === user?.id);
      if (myEntry) {
        setUserRank(myEntry.rank);
        setUserStats({ hours: myEntry.total_hours, streak: myEntry.streak });
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const topThree = leaderboard.slice(0, 3);
  const restOfList = leaderboard.slice(3);

  const getFilterLabel = () => {
    switch (filter) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Leaderboard</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {getFilterLabel()}
        </Text>
      </View>

      {/* Time Filter */}
      <View style={styles.filters}>
        {(['daily', 'weekly', 'monthly'] as TimeFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterBtn,
              { backgroundColor: colors.surface },
              filter === f && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? '#FFFFFF' : colors.text },
              ]}
            >
              {f === 'daily' ? 'Today' : f === 'weekly' ? 'Week' : 'Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <View style={styles.topThree}>
          {/* 2nd Place */}
          {topThree[1] && (
            <View style={styles.topPlayer}>
              <Avatar
                name={topThree[1].full_name}
                source={topThree[1].avatar_url}
                size="lg"
              />
              <View
                style={[styles.rankBadge, { backgroundColor: '#C0C0C0' }]}
              >
                <Text style={styles.rankBadgeText}>2</Text>
              </View>
              <Text
                style={[styles.topPlayerName, { color: colors.text }]}
                numberOfLines={1}
              >
                {topThree[1].full_name}
              </Text>
              <Text style={[styles.topPlayerHours, { color: colors.primary }]}>
                {topThree[1].total_hours.toFixed(1)}h
              </Text>
            </View>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <View style={[styles.topPlayer, styles.topPlayer1]}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.crown}
              >
                <Trophy size={20} color="#FFFFFF" />
              </LinearGradient>
              <Avatar
                name={topThree[0].full_name}
                source={topThree[0].avatar_url}
                size="xl"
              />
              <View
                style={[styles.rankBadge, styles.rankBadge1, { backgroundColor: '#FFD700' }]}
              >
                <Text style={styles.rankBadgeText}>1</Text>
              </View>
              <Text
                style={[styles.topPlayerName, { color: colors.text }]}
                numberOfLines={1}
              >
                {topThree[0].full_name}
              </Text>
              <Text style={[styles.topPlayerHours, { color: colors.primary }]}>
                {topThree[0].total_hours.toFixed(1)}h
              </Text>
            </View>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <View style={styles.topPlayer}>
              <Avatar
                name={topThree[2].full_name}
                source={topThree[2].avatar_url}
                size="lg"
              />
              <View
                style={[styles.rankBadge, { backgroundColor: '#CD7F32' }]}
              >
                <Text style={styles.rankBadgeText}>3</Text>
              </View>
              <Text
                style={[styles.topPlayerName, { color: colors.text }]}
                numberOfLines={1}
              >
                {topThree[2].full_name}
              </Text>
              <Text style={[styles.topPlayerHours, { color: colors.primary }]}>
                {topThree[2].total_hours.toFixed(1)}h
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Your Rank Card */}
      <View style={styles.myRank}>
        <Card style={styles.myRankCard}>
          <View style={styles.myRankContent}>
            <Trophy size={24} color={colors.accent} />
            <View style={styles.myRankInfo}>
              <Text style={[styles.myRankLabel, { color: colors.textSecondary }]}>
                Your Rank
              </Text>
              <Text style={[styles.myRankValue, { color: colors.text }]}>
                #{userRank || '--'}
              </Text>
            </View>
            <View style={styles.myRankStats}>
              <View style={styles.myRankStat}>
                <Clock size={16} color={colors.primary} />
                <Text style={[styles.myRankStatText, { color: colors.text }]}>
                  {userStats.hours.toFixed(1)}h
                </Text>
              </View>
              <View style={styles.myRankStat}>
                <Flame size={16} color={colors.accent} />
                <Text style={[styles.myRankStatText, { color: colors.text }]}>
                  {userStats.streak} streak
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Rest of Leaderboard */}
      <FlatList
        data={restOfList}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.listItem,
              { backgroundColor: colors.surface },
              item.user_id === user?.id && { borderWidth: 2, borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.listRank, { color: colors.textSecondary }]}>
              {item.rank}
            </Text>
            <Avatar name={item.full_name} source={item.avatar_url} size="md" />
            <View style={styles.listInfo}>
              <Text style={[styles.listName, { color: colors.text }]}>
                {item.full_name}
                {item.user_id === user?.id ? ' (You)' : ''}
              </Text>
              <View style={styles.listStreak}>
                <Flame size={12} color={colors.accent} />
                <Text style={[styles.listStreakText, { color: colors.textSecondary }]}>
                  {item.streak} day streak
                </Text>
              </View>
            </View>
            <Text style={[styles.listHours, { color: colors.primary }]}>
              {item.total_hours.toFixed(1)}h
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          leaderboard.length === 0 ? (
            <View style={styles.emptyState}>
              <Trophy size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Data Yet
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                Start studying to appear on the leaderboard
              </Text>
            </View>
          ) : null
        }
      />
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
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginTop: Spacing.xs,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  topPlayer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  topPlayer1: {
    flex: 1.3,
  },
  crown: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -10,
    zIndex: 10,
  },
  rankBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: '30%',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge1: {
    top: 45,
  },
  rankBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: '#000',
  },
  topPlayerName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  topPlayerHours: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  myRank: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  myRankCard: {
    padding: Spacing.lg,
  },
  myRankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  myRankInfo: {
    flex: 1,
  },
  myRankLabel: {
    fontSize: FontSizes.sm,
  },
  myRankValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  myRankStats: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  myRankStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  myRankStatText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  list: {
    padding: Spacing.xl,
    paddingBottom: 100,
    gap: Spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  listRank: {
    width: 30,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  listInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  listName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  listStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  listStreakText: {
    fontSize: FontSizes.xs,
  },
  listHours: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.lg,
  },
  emptyMessage: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
