import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  showOnline?: boolean;
  isOnline?: boolean;
}

export function Avatar({
  source,
  name,
  size = 'md',
  style,
  showOnline = false,
  isOnline = false,
}: AvatarProps) {
  const { colors } = useTheme();

  const sizes = {
    sm: { container: 32, text: FontSizes.sm },
    md: { container: 48, text: FontSizes.md },
    lg: { container: 64, text: FontSizes.xl },
    xl: { container: 96, text: FontSizes.xxl },
  };

  const currentSize = sizes[size];
  const initials = name
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const containerStyle = {
    width: currentSize.container,
    height: currentSize.container,
    borderRadius: currentSize.container / 2,
  };

  return (
    <View style={[containerStyle, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, containerStyle]}
        />
      ) : (
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={[styles.placeholder, containerStyle]}
        >
          <Text style={[styles.initials, { fontSize: currentSize.text }]}>
            {initials}
          </Text>
        </LinearGradient>
      )}
      {showOnline && (
        <View style={[
          styles.onlineIndicator,
          {
            backgroundColor: isOnline ? colors.success : colors.textTertiary,
            width: currentSize.container / 4,
            height: currentSize.container / 4,
            borderRadius: currentSize.container / 8,
          },
        ]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {},
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
