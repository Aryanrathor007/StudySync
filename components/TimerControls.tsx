import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, Square } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context';
import { BorderRadius, Spacing, Shadows } from '../constants';
import type { TimerState } from '../lib/hooks/useStudyTimer';
import type { PomodoroPhase } from '../lib/hooks/usePomodoro';

interface TimerControlsProps {
  state: TimerState | PomodoroPhase;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  size?: 'md' | 'lg';
}

export function TimerControls({
  state,
  onStart,
  onPause,
  onResume,
  onStop,
  size = 'lg',
}: TimerControlsProps) {
  const { colors } = useTheme();

  const sizes = {
    md: { main: 56, secondary: 44, iconSize: 24 },
    lg: { main: 72, secondary: 56, iconSize: 32 },
  };

  const currentSize = sizes[size];

  const isRunning = state === 'running' || state === 'focus' || state === 'break';
  const isPaused = state === 'paused';
  const isIdle = state === 'idle';

  return (
    <View style={styles.container}>
      {isIdle && (
        <TouchableOpacity onPress={onStart} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.mainButton,
              {
                width: currentSize.main,
                height: currentSize.main,
                borderRadius: currentSize.main / 2,
              },
            ]}
          >
            <Play size={currentSize.iconSize} color="#FFFFFF" fill="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {isRunning && (
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={onStop}
            activeOpacity={0.8}
            style={[
              styles.secondaryButton,
              {
                width: currentSize.secondary,
                height: currentSize.secondary,
                borderRadius: currentSize.secondary / 2,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Square size={currentSize.iconSize - 4} color={colors.error} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onPause} activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.mainButton,
                {
                  width: currentSize.main,
                  height: currentSize.main,
                  borderRadius: currentSize.main / 2,
                },
              ]}
            >
              <Pause size={currentSize.iconSize} color="#FFFFFF" fill="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {isPaused && (
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={onStop}
            activeOpacity={0.8}
            style={[
              styles.secondaryButton,
              {
                width: currentSize.secondary,
                height: currentSize.secondary,
                borderRadius: currentSize.secondary / 2,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Square size={currentSize.iconSize - 4} color={colors.error} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onResume} activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.mainButton,
                {
                  width: currentSize.main,
                  height: currentSize.main,
                  borderRadius: currentSize.main / 2,
                },
              ]}
            >
              <Play size={currentSize.iconSize} color="#FFFFFF" fill="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxl,
  },
  mainButton: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
});
