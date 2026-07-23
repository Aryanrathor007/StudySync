import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from './Avatar';
import { useTheme } from '../context';
import { useAuth } from '../context';
import { BorderRadius, FontSizes, FontWeights, Spacing, Shadows } from '../constants';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onPress?: () => void;
  onComment?: () => void;
}

export function PostCard({ post, onLike, onPress, onComment }: PostCardProps) {
  const { colors } = useTheme();
  const { user } = useAuth();

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

  const postTypeLabel = () => {
    switch (post.post_type) {
      case 'motivation':
        return 'Motivation';
      case 'announcement':
        return 'Announcement';
      default:
        return 'Study Update';
    }
  };

  const postTypeColor = () => {
    switch (post.post_type) {
      case 'motivation':
        return '#10B981';
      case 'announcement':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.surface }, Shadows.sm]}
    >
      <View style={styles.header}>
        <Avatar name={post.user?.full_name || 'User'} source={post.user?.avatar_url} size="sm" />
        <View style={styles.headerInfo}>
          <Text style={[styles.authorName, { color: colors.text }]}>
            {post.user?.full_name || 'Anonymous'}
          </Text>
          <View style={styles.headerMeta}>
            <Text style={[styles.community, { color: colors.textSecondary }]}>
              {post.community?.name}
            </Text>
            <Text style={[styles.dot, { color: colors.textTertiary }]}>·</Text>
            <Text style={[styles.time, { color: colors.textTertiary }]}>
              {timeAgo(post.created_at)}
            </Text>
          </View>
        </View>
        <View style={[styles.postTypeTag, { backgroundColor: postTypeColor() + '20' }]}>
          <Text style={[styles.postTypeText, { color: postTypeColor() }]}>
            {postTypeLabel()}
          </Text>
        </View>
      </View>

      <Text style={[styles.content, { color: colors.text }]}>
        {post.content}
      </Text>

      <View style={styles.footer}>
        <TouchableOpacity onPress={onLike} style={styles.actionButton}>
          <Text style={[styles.likeCount, { color: colors.primary }]}>
            {post.likes_count || 0} likes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onComment} style={styles.actionButton}>
          <Text style={[styles.commentCount, { color: colors.textSecondary }]}>
            Comment
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  authorName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  community: {
    fontSize: FontSizes.sm,
  },
  dot: {
    marginHorizontal: Spacing.xs,
  },
  time: {
    fontSize: FontSizes.sm,
  },
  postTypeTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  postTypeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  content: {
    fontSize: FontSizes.md,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: Spacing.xl,
  },
  likeCount: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  commentCount: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
});
