import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context';
import { Button } from '@/components';
import { useRouter } from 'expo-router';
import { Home, AlertCircle } from 'lucide-react-native';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <AlertCircle size={48} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Page Not Found</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <Button
        title="Go Home"
        onPress={() => router.replace('/')}
        icon={<Home size={20} color="#FFFFFF" />}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    maxWidth: 300,
  },
  button: {
    minWidth: 160,
  },
});
