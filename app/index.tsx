import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';
import { FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants';
import { useAuth, useTheme } from '@/context';
import { LoadingScreen } from '@/components';

export default function SplashScreen() {
  const { colors } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/auth/login');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/ChatGPT_Image_Jun_25,_2026_at_09_42_51_AM.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>StudySync</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Study Together, Succeed Together
        </Text>
      </View>
      <View style={styles.footer}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loadingBar}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    ...Shadows.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.lg,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    width: '60%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  loadingBar: {
    flex: 1,
    width: '100%',
  },
});
