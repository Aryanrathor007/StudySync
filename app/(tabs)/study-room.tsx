import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Video,
  Users,
  BookOpen,
  FlaskConical,
  Building2,
  Briefcase,
  Cpu,
  BarChart3,
  GraduationCap,
  Wifi,
} from 'lucide-react-native';
import { useAuth, useTheme } from '@/context';
import { FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants';

const EXAM_ROOMS = [
  {
    id: 'JEE',
    label: 'JEE Room',
    subtitle: 'Physics • Chemistry • Maths',
    description: 'Joint Entrance Examination preparation',
    icon: GraduationCap,
    gradient: ['#1E40AF', '#3B82F6'],
    accent: '#60A5FA',
    emoji: '⚛️',
  },
  {
    id: 'NEET',
    label: 'NEET Room',
    subtitle: 'Biology • Physics • Chemistry',
    description: 'National Eligibility cum Entrance Test',
    icon: FlaskConical,
    gradient: ['#065F46', '#10B981'],
    accent: '#34D399',
    emoji: '🧬',
  },
  {
    id: 'UPSC',
    label: 'UPSC Room',
    subtitle: 'GS • Optional • CSAT',
    description: 'Civil Services Examination',
    icon: Building2,
    gradient: ['#7C2D12', '#EA580C'],
    accent: '#FB923C',
    emoji: '🏛️',
  },
  {
    id: 'SSC',
    label: 'SSC Room',
    subtitle: 'Quant • Reasoning • English',
    description: 'Staff Selection Commission',
    icon: Briefcase,
    gradient: ['#4C1D95', '#7C3AED'],
    accent: '#A78BFA',
    emoji: '📋',
  },
  {
    id: 'GATE',
    label: 'GATE Room',
    subtitle: 'Engineering • CS • ECE',
    description: 'Graduate Aptitude Test in Engineering',
    icon: Cpu,
    gradient: ['#164E63', '#0891B2'],
    accent: '#22D3EE',
    emoji: '⚙️',
  },
  {
    id: 'CAT',
    label: 'CAT Room',
    subtitle: 'VARC • DILR • QA',
    description: 'Common Admission Test',
    icon: BarChart3,
    gradient: ['#78350F', '#D97706'],
    accent: '#FCD34D',
    emoji: '📊',
  },
];

export default function StudyRoomScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [onlineCounts, setOnlineCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Simulate random online counts for each room
    const counts: Record<string, number> = {};
    EXAM_ROOMS.forEach((room) => {
      counts[room.id] = Math.floor(Math.random() * 20) + 2;
    });
    setOnlineCounts(counts);

    const interval = setInterval(() => {
      setOnlineCounts((prev) => {
        const updated = { ...prev };
        EXAM_ROOMS.forEach((room) => {
          const delta = Math.floor(Math.random() * 3) - 1;
          updated[room.id] = Math.max(1, (updated[room.id] || 2) + delta);
        });
        return updated;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleEnterRoom = (examId: string) => {
    if (Platform.OS === 'web') {
      router.push(`/video-room?exam=${examId}&name=${encodeURIComponent(user?.full_name || 'Student')}`);
    } else {
      router.push(`/video-room?exam=${examId}&name=${encodeURIComponent(user?.full_name || 'Student')}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Study Rooms</Text>
              <Text style={styles.headerSub}>Study together, like a library</Text>
            </View>
            <View style={styles.liveBadge}>
              <Wifi size={12} color="#22C55E" />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>
                {Object.values(onlineCounts).reduce((a, b) => a + b, 0)}
              </Text>
              <Text style={styles.statLabel}>Students Online</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{EXAM_ROOMS.length}</Text>
              <Text style={styles.statLabel}>Active Rooms</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>24/7</Text>
              <Text style={styles.statLabel}>Always Open</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Pick your exam room and study with peers
        </Text>

        {EXAM_ROOMS.map((room) => {
          const IconComponent = room.icon;
          const online = onlineCounts[room.id] || 0;

          return (
            <TouchableOpacity
              key={room.id}
              onPress={() => handleEnterRoom(room.id)}
              activeOpacity={0.9}
              style={styles.roomCard}
            >
              <LinearGradient
                colors={room.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.roomGradient}
              >
                {/* Top row */}
                <View style={styles.roomTop}>
                  <View style={styles.roomEmojiBox}>
                    <Text style={styles.roomEmoji}>{room.emoji}</Text>
                  </View>
                  <View style={styles.onlinePill}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>{online} online</Text>
                  </View>
                </View>

                {/* Room info */}
                <View style={styles.roomInfo}>
                  <Text style={styles.roomLabel}>{room.label}</Text>
                  <Text style={styles.roomSubtitle}>{room.subtitle}</Text>
                  <Text style={styles.roomDesc}>{room.description}</Text>
                </View>

                {/* Participant avatars row */}
                <View style={styles.avatarRow}>
                  {Array.from({ length: Math.min(online, 5) }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.avatarDot,
                        { backgroundColor: room.accent, marginLeft: i === 0 ? 0 : -8 },
                      ]}
                    />
                  ))}
                  {online > 5 && (
                    <View style={[styles.avatarMore, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <Text style={styles.avatarMoreText}>+{online - 5}</Text>
                    </View>
                  )}
                </View>

                {/* Enter button */}
                <TouchableOpacity
                  onPress={() => handleEnterRoom(room.id)}
                  style={[styles.enterBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                >
                  <Video size={16} color="#FFFFFF" />
                  <Text style={styles.enterBtnText}>Enter Room</Text>
                </TouchableOpacity>

                {/* Decorative circles */}
                <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
                <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        <View style={styles.notice}>
          <BookOpen size={16} color={colors.textTertiary} />
          <Text style={[styles.noticeText, { color: colors.textTertiary }]}>
            Keep your mic on mute to create a focused library atmosphere. Camera optional.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    gap: 4,
    marginTop: 8,
  },
  liveBadgeText: {
    color: '#22C55E',
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  roomCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  roomGradient: {
    padding: Spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  roomTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  roomEmojiBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomEmoji: {
    fontSize: 28,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  onlineText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  roomInfo: {
    marginBottom: Spacing.lg,
  },
  roomLabel: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roomSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  roomDesc: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarMore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMoreText: {
    fontSize: FontSizes.xs,
    color: '#FFFFFF',
    fontWeight: FontWeights.bold,
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  enterBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  decorCircle1: {
    width: 120,
    height: 120,
    top: -40,
    right: -30,
  },
  decorCircle2: {
    width: 80,
    height: 80,
    bottom: -20,
    right: 60,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  noticeText: {
    fontSize: FontSizes.sm,
    flex: 1,
    lineHeight: 18,
  },
});
