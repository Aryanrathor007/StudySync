import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  ChevronRight,
  Plus,
  Send,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth, useTheme } from '@/context';
import {
  Card,
  Input,
  Button,
  Avatar,
  EmptyState,
  LoadingSpinner,
} from '@/components';
import {
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from '@/constants';
import type { Community, Post } from '@/types';

const COMMUNITY_ICONS: Record<string, string> = {
  JEE: '🎓',
  NEET: '🩺',
  UPSC: '🏛️',
  SSC: '💼',
  GATE: '⚙️',
  CAT: '📊',
  Other: '📚',
};

interface PostWithUser extends Omit<Post, 'user' | 'community'> {
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  community?: {
    id: string;
    name: string;
  } | null;
}

export default function CommunityScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      loadPosts(selectedCommunity);
    }
  }, [selectedCommunity]);

  const loadCommunities = async () => {
    setLoading(true);
    try {
      // Load all communities
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .order('name');

      if (communityError) throw communityError;
      if (communityData) {
        setCommunities(communityData);
      }

      // Load user's joined communities
      if (user) {
        const { data: memberData, error: memberError } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', user.id);

        if (memberError) throw memberError;
        if (memberData) {
          const joinedIds = memberData.map(m => m.community_id);
          setJoinedCommunities(joinedIds);
          // Auto-select first joined community
          if (joinedIds.length > 0 && !selectedCommunity) {
            setSelectedCommunity(joinedIds[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error loading communities:', err);
      Alert.alert('Error', 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (communityId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(id, full_name, avatar_url),
          community:communities(id, name)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error loading posts:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCommunities();
    if (selectedCommunity) {
      await loadPosts(selectedCommunity);
    }
    setRefreshing(false);
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) {
      Alert.alert('Please login to join communities');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          user_id: user.id,
          community_id: communityId,
        });

      if (error) throw error;

      setJoinedCommunities((prev) => [...prev, communityId]);
      setSelectedCommunity(communityId);
      Alert.alert('Success', 'You have joined the community!');
    } catch (err: any) {
      console.error('Error joining community:', err);
      Alert.alert('Error', err.message || 'Failed to join community');
    }
  };

  const leaveCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .match({ user_id: user.id, community_id: communityId });

      if (error) throw error;

      setJoinedCommunities((prev) => prev.filter((id) => id !== communityId));
      if (selectedCommunity === communityId) {
        setSelectedCommunity(joinedCommunities.find((id) => id !== communityId) || null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to leave community');
    }
  };

  const createPost = async () => {
    if (!user || !selectedCommunity || !newPostContent.trim()) return;

    setPosting(true);
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        community_id: selectedCommunity,
        content: newPostContent.trim(),
        post_type: 'update',
      });

      if (error) throw error;

      setNewPostContent('');
      setShowPostModal(false);
      loadPosts(selectedCommunity);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const getCommunityById = useCallback(
    (id: string) => communities.find((c) => c.id === id),
    [communities]
  );

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  // Community List View (when no community is selected)
  if (!selectedCommunity || joinedCommunities.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Communities</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join a community to connect with peers
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {communities.map((community) => {
            const isJoined = joinedCommunities.includes(community.id);
            return (
              <TouchableOpacity
                key={community.id}
                onPress={() => isJoined && setSelectedCommunity(community.id)}
                style={[
                  styles.communityCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.communityInfo}>
                  <Text style={styles.communityIcon}>
                    {COMMUNITY_ICONS[community.name] || '📚'}
                  </Text>
                  <View style={styles.communityDetails}>
                    <Text style={[styles.communityName, { color: colors.text }]}>
                      {community.name}
                    </Text>
                    <Text style={[styles.communityDesc, { color: colors.textSecondary }]}>
                      {community.description || 'Join to connect with peers'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => (isJoined ? null : joinCommunity(community.id))}
                  style={[
                    styles.joinButton,
                    {
                      backgroundColor: isJoined
                        ? colors.surfaceSecondary
                        : colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.joinButtonText,
                      { color: isJoined ? colors.textSecondary : '#FFFFFF' },
                    ]}
                  >
                    {isJoined ? 'Joined' : 'Join'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // Community Feed View
  const currentCommunity = getCommunityById(selectedCommunity);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setSelectedCommunity(null)}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>
            ← All Communities
          </Text>
        </TouchableOpacity>
        <View style={styles.communityHeader}>
          <Text style={styles.communityIcon}>
            {COMMUNITY_ICONS[currentCommunity?.name || ''] || '📚'}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {currentCommunity?.name}
          </Text>
        </View>
      </View>

      {/* Community Tabs */}
      <View style={styles.tabs}>
        {joinedCommunities.map((id) => {
          const c = getCommunityById(id);
          if (!c) return null;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setSelectedCommunity(id)}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    selectedCommunity === id ? colors.primary : colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedCommunity === id ? '#FFFFFF' : colors.text },
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.postCard}>
            <View style={styles.postHeader}>
              <Avatar
                name={item.user?.full_name || 'User'}
                source={item.user?.avatar_url}
                size="sm"
              />
              <View style={styles.postHeaderInfo}>
                <Text style={[styles.postAuthor, { color: colors.text }]}>
                  {item.user?.full_name || 'Anonymous'}
                </Text>
                <Text style={[styles.postTime, { color: colors.textTertiary }]}>
                  {formatTimeAgo(item.created_at)}
                </Text>
              </View>
            </View>
            <Text style={[styles.postContent, { color: colors.text }]}>
              {item.content}
            </Text>
            <View style={styles.postFooter}>
              <Text style={[styles.postLikes, { color: colors.textSecondary }]}>
                {item.likes_count || 0} likes
              </Text>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.postsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Users size={48} color={colors.textTertiary} />}
            title="No posts yet"
            message="Be the first to share an update!"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button for New Post */}
      <TouchableOpacity
        onPress={() => setShowPostModal(!showPostModal)}
        style={styles.floatingButton}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.fab}
        >
          <Plus size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* New Post Modal */}
      {showPostModal && (
        <View style={[styles.postModal, { backgroundColor: colors.background }]}>
          <Card style={styles.postModalCard}>
            <Text style={[styles.postModalTitle, { color: colors.text }]}>
              Create Post
            </Text>
            <Input
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholder="Share your study progress..."
              multiline
              numberOfLines={4}
            />
            <View style={styles.postModalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowPostModal(false);
                  setNewPostContent('');
                }}
                variant="ghost"
                style={styles.cancelBtn}
              />
              <Button
                title={posting ? 'Posting...' : 'Post'}
                onPress={createPost}
                disabled={!newPostContent.trim() || posting}
                icon={<Send size={16} color="#FFFFFF" />}
              />
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginTop: Spacing.xs,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  communityIcon: {
    fontSize: 32,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  communityDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  communityName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  communityDesc: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  joinButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
  },
  joinButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  postsList: {
    padding: Spacing.xl,
    paddingBottom: 150,
  },
  postCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  postHeaderInfo: {
    marginLeft: Spacing.sm,
  },
  postAuthor: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  postTime: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  postContent: {
    fontSize: FontSizes.md,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  postLikes: {
    fontSize: FontSizes.sm,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.xl,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  postModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: 120,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Shadows.lg,
  },
  postModalCard: {
    padding: 0,
  },
  postModalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.md,
  },
  postModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 0,
  },
});
