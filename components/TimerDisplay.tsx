import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context';
import { BorderRadius, FontSizes, FontWeights, Spacing, Shadows } from '../constants';
import { formatTime } from '../lib/utils';

interface TimerDisplayProps {
  seconds: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient';
  showLabel?: boolean;
  label?: string;
}

export function TimerDisplay({
  seconds,
  size = 'lg',
  variant = 'default',
  showLabel = false,
  label,
}: TimerDisplayProps) {
  const { colors } = useTheme();

  const sizes = {
    sm: { container: 80, fontSize: FontSizes.xl },
    md: { container: 120, fontSize: FontSizes.xxl },
    lg: { container: 200, fontSize: 52 },
  };

  const currentSize = sizes[size];
  const timeString = formatTime(seconds);

  if (variant === 'gradient') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientContainer,
            { width: currentSize.container, height: currentSize.container, borderRadius: currentSize.container / 2 },
          ]}
        >
          <Text style={[styles.time, { fontSize: currentSize.fontSize, color: '#FFFFFF' }]}>
            {timeString}
          </Text>
        </LinearGradient>
        {showLabel && (
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[
        styles.defaultContainer,
        {
          backgroundColor: colors.surface,
          width: currentSize.container,
          height: currentSize.container,
          borderRadius: currentSize.container / 2,
        },
        Shadows.lg,
      ]}>
        <Text style={[styles.time, { fontSize: currentSize.fontSize, color: colors.text }]}>
          {timeString}
        </Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  justifyContent: 'center',
  marginVertical: Spacing.lg,
  },
  gradientContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontWeight: FontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: Spacing.md,
    fontSize: FontSizes.sm,
  },
});
