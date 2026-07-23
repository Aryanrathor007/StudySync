import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Trophy, Star, Medal, Zap, Award, Flame, Timer, Users, Sunrise, Moon } from 'lucide-react-native';
import { useTheme } from '../context';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants';
import type { Achievement } from '../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  'trophy': Trophy,
  'star': Star,
  'medal': Medal,
  'zap': Zap,
  'award': Award,
  'flame': Flame,
  'timer': Timer,
  'users': Users,
  'sunrise': Sunrise,
  'moon': Moon,
  'footprints': Zap,
};

export function AchievementBadge({
  achievement,
  unlocked = false,
  size = 'md',
  showDetails = true,
}: AchievementBadgeProps) {
  const { colors } = useTheme();

  const sizes = {
    sm: { container: 48, icon: 22, text: FontSizes.xs },
    md: { container: 64, icon: 28, text: FontSizes.sm },
    lg: { container: 80, icon: 36, text: FontSizes.md },
  };

  const currentSize = sizes[size];
  const IconComponent = iconMap[achievement.icon || 'trophy'] || Trophy;
  const iconColor = unlocked ? '#FFFFFF' : colors.textTertiary;
  const containerBg = unlocked ? colors.accent : colors.surfaceSecondary;

  return (
    <View style={styles.container}>
      <View style={[
        styles.iconContainer,
        {
          width: currentSize.container,
          height: currentSize.container,
          borderRadius: currentSize.container / 2,
          backgroundColor: containerBg,
        },
        unlocked && styles.unlockedIcon,
      ]}>
        <IconComponent size={currentSize.icon} color={iconColor} />
      </View>
      {showDetails && (
        <View style={styles.details}>
          <Text style={[
            styles.name,
            { color: unlocked ? colors.text : colors.textSecondary },
            unlocked && styles.unlockedName,
          ]}>
            {achievement.name}
          </Text>
          <Text style={[styles.description, { color: colors.textTertiary }]}>
            {achievement.description}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  unlockedIcon: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  details: {
    alignItems: 'center',
  },
  name: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
  },
  unlockedName: {
    color: '#F59E0B',
  },
  description: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
