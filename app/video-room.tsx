import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Video,
  Users,
  BookOpen,
  ExternalLink,
  Wifi,
  Clock,
} from 'lucide-react-native';
import { useAuth, useTheme } from '@/context';
import { FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants';

const ROOM_META: Record<
  string,
  { label: string; subject: string; gradient: [string, string]; emoji: string; color: string }
> = {
  JEE: {
    label: 'JEE Study Room',
    subject: 'Physics · Chemistry · Maths',
    gradient: ['#1E3A8A', '#2563EB'],
    color: '#3B82F6',
    emoji: '⚛️',
  },
  NEET: {
    label: 'NEET Study Room',
    subject: 'Biology · Physics · Chemistry',
    gradient: ['#064E3B', '#059669'],
    color: '#10B981',
    emoji: '🧬',
  },
  UPSC: {
    label: 'UPSC Study Room',
    subject: 'GS · Optional · CSAT',
    gradient: ['#7C2D12', '#C2410C'],
    color: '#F97316',
    emoji: '🏛️',
  },
  SSC: {
    label: 'SSC Study Room',
    subject: 'Quant · Reasoning · English',
    gradient: ['#4C1D95', '#6D28D9'],
    color: '#8B5CF6',
    emoji: '📋',
  },
  GATE: {
    label: 'GATE Study Room',
    subject: 'Engineering · CS · ECE',
    gradient: ['#0C4A6E', '#0369A1'],
    color: '#0EA5E9',
    emoji: '⚙️',
  },
  CAT: {
    label: 'CAT Study Room',
    subject: 'VARC · DILR · Quant',
    gradient: ['#78350F', '#B45309'],
    color: '#F59E0B',
    emoji: '📊',
  },
};

// Generate consistent fake participants per room
function genParticipants(exam: string, count: number) {
  const names = [
    'Rahul S', 'Priya M', 'Amit K', 'Sneha R', 'Vikram J',
    'Divya P', 'Arjun T', 'Meera B', 'Rohan V', 'Ananya C',
    'Karan D', 'Pooja N', 'Nikhil G', 'Isha H', 'Suresh L',
    'Neha A', 'Akash F', 'Kavya Q', 'Tarun W', 'Riya E',
  ];
  return names.slice(0, Math.min(count, names.length));
}

export default function VideoRoomScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { exam, name } = useLocalSearchParams<{ exam: string; name: string }>();
  const router = useRouter();

  const meta = ROOM_META[exam || 'JEE'] || ROOM_META['JEE'];
  const displayName = name || user?.full_name || 'Student';
  const jitsiRoom = `StudySync-${exam}-Official-2026`;
  const jitsiUrl = `https://meet.jit.si/${jitsiRoom}`;

  const [onlineCount, setOnlineCount] = useState(Math.floor(Math.random() * 12) + 4);
  const [studyTime, setStudyTime] = useState(0);
  const [isInRoom, setIsInRoom] = useState(false);
  const [micMuted, setMicMuted] = useState(true);

  const participants = genParticipants(exam || 'JEE', onlineCount);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((c) => Math.max(2, c + (Math.random() > 0.5 ? 1 : -1)));
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isInRoom) return;
    const interval = setInterval(() => setStudyTime((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [isInRoom]);

  const openVideoCall = () => {
    setIsInRoom(true);
    if (Platform.OS === 'web') {
      // Open Jitsi in a new browser tab — avoids X-Frame-Options restrictions
      (window as any).open(jitsiUrl, '_blank', 'noopener,noreferrer');
    } else {
      // On native, open in device browser
      Linking.openURL(jitsiUrl);
    }
  };

  const avatarColors = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header gradient */}
      <LinearGradient colors={meta.gradient} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.livePill}>
            <Wifi size={11} color="#22C55E" />
            <Text style={styles.livePillText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>{meta.emoji}</Text>
          <Text style={styles.headerTitle}>{meta.label}</Text>
          <Text style={styles.headerSubject}>{meta.subject}</Text>

          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{onlineCount} students studying now</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bodyContent}
      >
        {/* Room status card */}
        {isInRoom && (
          <View style={[styles.activeCard, { backgroundColor: '#22C55E15', borderColor: '#22C55E40' }]}>
            <View style={styles.activeRow}>
              <View style={styles.activeIndicator} />
              <Text style={[styles.activeText, { color: '#22C55E' }]}>You are in the room</Text>
              {studyTime > 0 && (
                <View style={styles.timerBadge}>
                  <Clock size={12} color="#22C55E" />
                  <Text style={[styles.timerText, { color: '#22C55E' }]}>{studyTime}m</Text>
                </View>
              )}
            </View>
            <Text style={[styles.activeHint, { color: colors.textSecondary }]}>
              The video call is open in a browser tab. Come back here to see who else is studying!
            </Text>
          </View>
        )}

        {/* Library seats — participant grid */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Who's studying now
            </Text>
          </View>

          <View style={styles.seatsGrid}>
            {participants.map((p, i) => (
              <View key={i} style={styles.seat}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: avatarColors[i % avatarColors.length] },
                  ]}
                >
                  <Text style={styles.avatarInitial}>{p[0]}</Text>
                </View>
                <Text style={[styles.seatName, { color: colors.textSecondary }]} numberOfLines={1}>
                  {p}
                </Text>
                <View style={styles.studyingDot} />
              </View>
            ))}

            {/* Your seat */}
            <View style={styles.seat}>
              <View style={[styles.avatar, { backgroundColor: meta.color, borderWidth: 2, borderColor: '#FFFFFF' }]}>
                <Text style={styles.avatarInitial}>{displayName[0]?.toUpperCase()}</Text>
              </View>
              <Text style={[styles.seatName, { color: meta.color, fontWeight: FontWeights.semibold }]} numberOfLines={1}>
                You
              </Text>
              {isInRoom && <View style={[styles.studyingDot, { backgroundColor: '#22C55E' }]} />}
            </View>
          </View>
        </View>

        {/* Rules card */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <BookOpen size={16} color={colors.textSecondary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Library Rules</Text>
          </View>
          {[
            'Keep mic muted — library silence helps everyone focus',
            'Camera on is encouraged — it builds accountability',
            'Use the chat for quick doubts',
            'Stay respectful and focused',
          ].map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: meta.color }]} />
              <Text style={[styles.ruleText, { color: colors.textSecondary }]}>{rule}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom action */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={openVideoCall}
          activeOpacity={0.85}
          style={styles.joinBtnWrapper}
        >
          <LinearGradient
            colors={meta.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.joinBtn}
          >
            {Platform.OS === 'web' ? (
              <ExternalLink size={20} color="#FFFFFF" />
            ) : (
              <Video size={20} color="#FFFFFF" />
            )}
            <Text style={styles.joinBtnText}>
              {isInRoom ? 'Rejoin Video Call' : 'Join Video Call'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {Platform.OS === 'web' && (
          <Text style={[styles.footerHint, { color: colors.textTertiary }]}>
            Opens in a new browser tab
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 56,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backBtn: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    gap: 5,
  },
  livePillText: {
    color: '#22C55E',
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  headerSubject: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  onlineText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  activeCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
  },
  activeText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    flex: 1,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  activeHint: {
    fontSize: FontSizes.sm,
    lineHeight: 18,
  },
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  seat: {
    alignItems: 'center',
    width: 56,
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  seatName: {
    fontSize: 10,
    textAlign: 'center',
    width: '100%',
  },
  studyingDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  ruleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  ruleText: {
    fontSize: FontSizes.sm,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: 36,
    borderTopWidth: 1,
  },
  joinBtnWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  footerHint: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
