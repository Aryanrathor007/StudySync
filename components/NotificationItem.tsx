import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Flame, Trophy, Users, Clock } from 'lucide-react-native';
import { useTheme } from '../context';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants';
import type { Notification } from '../types';
import { BellRing } from 'lucide-react-native';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (notification.type) {
      case 'streak':
        return <Flame size={20} color={colors.accent} />;
      case 'achievement':
        return <Trophy size={20} color={colors.accent} />;
      case 'rank':
        return <Trophy size={20} color={colors.primary} />;
      case 'friend':
        return <Users size={20} color={colors.secondary} />;
      case 'reminder':
        return <Clock size={20} color={colors.primary} />;
      default:
        return <Bell size={20} color={colors.textSecondary} />;
    }
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: notification.read ? colors.surface : colors.surfaceSecondary },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: notification.read ? colors.background : colors.surface }]}>
        {getIcon()}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{notification.title}</Text>
        {notification.message && (
          <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
            {notification.message}
          </Text>
        )}
        <Text style={[styles.time, { color: colors.textTertiary }]}>
          {timeAgo(notification.created_at)}
        </Text>
      </View>
      {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: 4,
  },
  message: {
    fontSize: FontSizes.sm,
    marginBottom: 4,
  },
  time: {
    fontSize: FontSizes.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: Spacing.sm,
  },
});
