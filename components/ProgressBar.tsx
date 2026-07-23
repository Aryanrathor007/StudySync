import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants';

interface ProgressBarProps {
  progress: number;
  total?: number;
  showLabel?: boolean;
  height?: number;
  color?: 'primary' | 'secondary' | 'accent';
}

export function ProgressBar({
  progress,
  total = 100,
  showLabel = false,
  height = 8,
}: ProgressBarProps) {
  const { colors } = useTheme();

  const percentage = Math.min((progress / total) * 100, 100);

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            {progress.toFixed(0)}/{total}
          </Text>
          <Text style={[styles.percentage, { color: colors.textSecondary }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
      )}
      <View style={[
        styles.track,
        {
          height,
          backgroundColor: colors.surfaceSecondary,
          borderRadius: height / 2,
        },
      ]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  track: {
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  percentage: {
    fontSize: FontSizes.sm,
  },
});
