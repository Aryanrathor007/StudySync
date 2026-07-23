import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context';
import { BorderRadius, FontSizes, FontWeights, Spacing, Shadows } from '../constants';
import { formatHours } from '../lib/utils';
import { Avatar } from './Avatar';

interface LeaderboardItemProps {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  hours: number;
  streak: number;
  isCurrentUser?: boolean;
  communityId?: string;
  onPress?: () => void;
}

export function LeaderboardItem({
  rank,
  name,
  avatarUrl,
  hours,
  streak,
  isCurrentUser = false,
  onPress,
}: LeaderboardItemProps) {
  const { colors } = useTheme();

  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return { backgroundColor: '#FFD700', color: '#000000' };
      case 2:
        return { backgroundColor: '#C0C0C0', color: '#000000' };
      case 3:
        return { backgroundColor: '#CD7F32', color: '#FFFFFF' };
      default:
        return { backgroundColor: colors.surfaceSecondary, color: colors.text };
    }
  };

  const rankStyle = getRankStyle();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        isCurrentUser && { borderWidth: 1.5, borderColor: colors.primary },
        Shadows.sm,
      ]}
    >
      <View style={[styles.rankBadge, { backgroundColor: rankStyle.backgroundColor }]}>
        <Text style={[styles.rankText, { color: rankStyle.color }]}>{rank}</Text>
      </View>
      <Avatar source={avatarUrl} name={name} size="md" />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {name}
          {isCurrentUser && ' (You)'}
        </Text>
        <Text style={[styles.streak, { color: colors.textSecondary }]}>
          {streak} day streak
        </Text>
      </View>
      <View style={styles.stats}>
        <Text style={[styles.hours, { color: colors.primary }]}>
          {formatHours(hours)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.xl,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: 2,
  },
  streak: {
    fontSize: FontSizes.sm,
  },
  stats: {
    alignItems: 'flex-end',
  },
  hours: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
});
