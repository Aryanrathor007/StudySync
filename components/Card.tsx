import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context';
import { BorderRadius, Spacing, Shadows } from '../constants';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'gradient' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  noPadding?: boolean;
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'md',
  noPadding = false,
}: CardProps) {
  const { colors } = useTheme();

  const paddingStyles = {
    none: 0,
    sm: Spacing.sm,
    md: Spacing.lg,
    lg: Spacing.xl,
  };

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          { padding: noPadding ? 0 : paddingStyles[padding] },
          styles.gradientCard,
          style,
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.surface,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: colors.border,
        padding: noPadding ? 0 : paddingStyles[padding],
      },
      Shadows.md,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
  },
  gradientCard: {
    borderRadius: BorderRadius.xl,
  },
});
