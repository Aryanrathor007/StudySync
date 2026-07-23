import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { UserStats, UserAchievement, Achievement } from '../../types';

export function useStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<(UserAchievement & { achievement: Achievement })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchStats();
    fetchAchievements();
  }, [userId]);

  const fetchStats = async () => {
    if (!userId) return;

    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('duration_minutes, started_at')
      .eq('user_id', userId);

    const { data: pomodoros } = await supabase
      .from('pomodoro_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', true);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    let dailyHours = 0;
    let weeklyHours = 0;
    let monthlyHours = 0;
    let totalMinutes = 0;

    sessions?.forEach(session => {
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

    const streak = await calculateStreak();
    const rank = await calculateRank();

    setStats({
      total_hours: totalMinutes / 60,
      daily_hours: dailyHours,
      weekly_hours: weeklyHours,
      monthly_hours: monthlyHours,
      current_streak: streak,
      pomodoro_count: pomodoros?.length || 0,
      rank,
    });

    setLoading(false);
  };

  const calculateStreak = async (): Promise<number> => {
    if (!userId) return 0;

    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (!sessions || sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const hasSession = sessions.some(s => {
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
    if (!userId) return 0;

    const { data: allSessions } = await supabase
      .from('study_sessions')
      .select('user_id, duration_minutes');

    if (!allSessions) return 0;

    const userTotals: Record<string, number> = {};
    allSessions.forEach(s => {
      userTotals[s.user_id] = (userTotals[s.user_id] || 0) + s.duration_minutes;
    });

    const sorted = Object.entries(userTotals).sort((a, b) => b[1] - a[1]);
    const rank = sorted.findIndex(([id]) => id === userId) + 1;

    return rank || 0;
  };

  const fetchAchievements = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', userId);

    setAchievements(data || []);
  };

  const refetch = () => {
    fetchStats();
    fetchAchievements();
  };

  return {
    stats,
    achievements,
    loading,
    refetch,
  };
}
