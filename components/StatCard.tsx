import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context';
import { BorderRadius, FontSizes, FontWeights, Spacing, Shadows } from '../constants';
import { formatHours, formatDuration } from '../lib/utils';
import type { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  format?: 'hours' | 'duration' | 'none';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  format = 'none',
}: StatCardProps) {
  const { colors } = useTheme();

  let displayValue: string;
  if (format === 'hours' && typeof value === 'number') {
    displayValue = formatHours(value);
  } else if (format === 'duration' && typeof value === 'number') {
    displayValue = formatDuration(value);
  } else {
    displayValue = String(value);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, Shadows.md]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
        <View style={{ position: 'absolute' }}>
          {icon}
        </View>
      </View>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{displayValue}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    minWidth: 100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
