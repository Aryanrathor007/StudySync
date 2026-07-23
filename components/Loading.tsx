import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../constants';
import { useTheme } from '../context';

export function LoadingScreen() {
  const { colors } = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logo}
      >
        <Text style={styles.logoText}>SS</Text>
      </LinearGradient>
      <Text style={[styles.title, { color: colors.text }]}>StudySync</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
    </View>
  );
}

export function LoadingSpinner({ size = 'large' }: { size?: 'small' | 'large' }) {
  const { colors } = useTheme();

  return (
    <ActivityIndicator size={size} color={colors.primary} />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoText: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  spinner: {
    marginTop: Spacing.xl,
  },
});
