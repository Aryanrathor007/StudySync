import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import {
  Timer as TimerIcon,
  Coffee,
  Zap,
  Save,
  Music,
  Volume2,
  VolumeX,
  Settings,
  Play,
  Pause,
} from 'lucide-react-native';
import { useAuth, useTheme } from '@/context';
import { Card, LoadingSpinner } from '@/components';
import { FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants';
import { supabase } from '@/lib/supabase';

type TimerMode = 'study' | 'pomodoro';
type PomodoroPhase = 'idle' | 'focus' | 'break';
type StudyState = 'idle' | 'running' | 'paused';

const LOFI_PRESETS = [
  { name: 'Lofi Hip Hop', url: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { name: 'Chill Beats', url: 'https://www.youtube.com/embed/5qap5aO4i9A' },
  { name: 'Study Music', url: 'https://www.youtube.com/embed/xNN7iTA_WjQ' },
  { name: 'Jazz Hop', url: 'https://www.youtube.com/embed/Dx5SQ9J5p4U' },
  { name: 'Ambient', url: 'https://www.youtube.com/embed/MNZjM-bJvR0' },
];

export default function TimerScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Study Timer State
  const [studySeconds, setStudySeconds] = useState(0);
  const [studyState, setStudyState] = useState<StudyState>('idle');
  const [studySessionStart, setStudySessionStart] = useState<Date | null>(null);
  const studyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Pomodoro Timer State
  const [mode, setMode] = useState<TimerMode>('study');
  const [pomodoroFocusMinutes, setPomodoroFocusMinutes] = useState(25);
  const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState(5);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('idle');
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const pomodoroIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Lofi Beats State
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [selectedLofi, setSelectedLofi] = useState(LOFI_PRESETS[0]);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [customLofiUrl, setCustomLofiUrl] = useState<string | null>(null);

  // Load user's lofi preference
  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('lofi_beats_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.lofi_beats_url) {
            setCustomLofiUrl(data.lofi_beats_url);
            const preset = LOFI_PRESETS.find(p => p.url === data.lofi_beats_url);
            if (preset) setSelectedLofi(preset);
          }
        });
    }
  }, [user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (studyIntervalRef.current) clearInterval(studyIntervalRef.current);
      if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current);
    };
  }, []);

  // === STUDY TIMER ===
  const startStudyTimer = () => {
    const now = new Date();
    setStudySessionStart(now);
    setStudyState('running');
    setStudySeconds(0);
    studyIntervalRef.current = setInterval(() => {
      setStudySeconds(prev => prev + 1);
    }, 1000);
  };

  const pauseStudyTimer = () => {
    if (studyIntervalRef.current) {
      clearInterval(studyIntervalRef.current);
      studyIntervalRef.current = null;
    }
    setStudyState('paused');
  };

  const resumeStudyTimer = () => {
    setStudyState('running');
    studyIntervalRef.current = setInterval(() => {
      setStudySeconds(prev => prev + 1);
    }, 1000);
  };

  const stopStudyTimer = async () => {
    if (studyIntervalRef.current) {
      clearInterval(studyIntervalRef.current);
      studyIntervalRef.current = null;
    }

    if (user && studySessionStart && studySeconds > 0) {
      setSaving(true);
      const durationMinutes = Math.floor(studySeconds / 60);
      const endedAt = new Date();

      try {
        const { error } = await supabase.from('study_sessions').insert({
          user_id: user.id,
          duration_minutes: durationMinutes,
          started_at: studySessionStart.toISOString(),
          ended_at: endedAt.toISOString(),
        });

        if (!error) {
          setLastSaved(`Saved ${durationMinutes} minutes`);
        }
      } catch (err) {
        console.error('Failed to save study session:', err);
      }
      setSaving(false);
    }

    setStudyState('idle');
    setStudySeconds(0);
    setStudySessionStart(null);
  };

  // === POMODORO TIMER ===
  const startPomodoro = () => {
    setPomodoroPhase('focus');
    setPomodoroSeconds(pomodoroFocusMinutes * 60);
    pomodoroIntervalRef.current = setInterval(() => {
      setPomodoroSeconds(prev => {
        if (prev <= 1) {
          clearInterval(pomodoroIntervalRef.current!);
          if (pomodoroPhase === 'focus') {
            savePomodoroSession(true);
            setPomodoroPhase('break');
            setPomodoroSessions(c => c + 1);
            return pomodoroBreakMinutes * 60;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (pomodoroPhase === 'focus' && pomodoroSeconds === 0) {
      setPomodoroPhase('break');
      setPomodoroSeconds(pomodoroBreakMinutes * 60);
    } else if (pomodoroPhase === 'break' && pomodoroSeconds === 0) {
      setPomodoroPhase('idle');
    }
  }, [pomodoroSeconds, pomodoroPhase, pomodoroBreakMinutes]);

  const pausePomodoro = () => {
    if (pomodoroIntervalRef.current) {
      clearInterval(pomodoroIntervalRef.current);
      pomodoroIntervalRef.current = null;
    }
    setPomodoroPhase('idle');
  };

  const skipPomodoro = async () => {
    if (pomodoroPhase === 'focus' && user) {
      await savePomodoroSession(true);
      setPomodoroSessions(c => c + 1);
    }
    if (pomodoroPhase === 'focus') {
      setPomodoroPhase('break');
      setPomodoroSeconds(pomodoroBreakMinutes * 60);
    } else if (pomodoroPhase === 'break') {
      setPomodoroPhase('focus');
      setPomodoroSeconds(pomodoroFocusMinutes * 60);
    }
  };

  const stopPomodoro = async () => {
    if (pomodoroIntervalRef.current) {
      clearInterval(pomodoroIntervalRef.current);
      pomodoroIntervalRef.current = null;
    }
    if (pomodoroPhase === 'focus' && user && pomodoroSeconds > 0) {
      await savePomodoroSession(false);
    }
    setPomodoroPhase('idle');
    setPomodoroSeconds(pomodoroFocusMinutes * 60);
    setPomodoroSessions(0);
  };

  const savePomodoroSession = async (completed: boolean) => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('pomodoro_sessions').insert({
        user_id: user.id,
        focus_duration_minutes: pomodoroFocusMinutes,
        break_duration_minutes: pomodoroBreakMinutes,
        completed,
        started_at: new Date(Date.now() - (pomodoroFocusMinutes * 60 - pomodoroSeconds) * 1000).toISOString(),
        ended_at: new Date().toISOString(),
      });
      setLastSaved(`Pomodoro ${completed ? 'completed' : 'saved'}!`);
    } catch (err) {
      console.error('Failed to save pomodoro:', err);
    }
    setSaving(false);
  };

  const saveLofiPreference = async (url: string) => {
    if (!user) return;
    await supabase.from('users').update({ lofi_beats_url: url }).eq('id', user.id);
    setCustomLofiUrl(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const webViewRef = useRef<WebView>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentLofiUrl = customLofiUrl || selectedLofi.url;
  const embedUrl = currentLofiUrl.includes('?')
    ? currentLofiUrl + '&autoplay=1&mute=0'
    : currentLofiUrl + '?autoplay=1&mute=0';

  const togglePlayPause = () => {
    if (!webViewRef.current) return;
    if (isPlaying) {
      webViewRef.current.injectJavaScript(
        "document.querySelectorAll('video').forEach(v => v.pause()); true;"
      );
      setIsPlaying(false);
    } else {
      webViewRef.current.injectJavaScript(
        "document.querySelectorAll('video').forEach(v => v.play()); true;"
      );
      setIsPlaying(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Study Timer</Text>
          {lastSaved && <Text style={[styles.lastSaved, { color: colors.success }]}>{lastSaved}</Text>}
        </View>

        {/* Music Control Bar */}
        <View style={[styles.musicBar, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => setShowMusicModal(true)}
            style={styles.musicBarContent}
          >
            {musicEnabled ? (
              <Volume2 size={20} color={colors.primary} />
            ) : (
              <VolumeX size={20} color={colors.textSecondary} />
            )}
            <View style={styles.musicBarText}>
              <Text style={[styles.musicBarTitle, { color: colors.text }]}>
                {musicEnabled ? selectedLofi.name : 'Music Off'}
              </Text>
              <Text style={[styles.musicBarHint, { color: colors.textSecondary }]}>
                Tap to {musicEnabled ? 'change' : 'enable'} lofi beats
              </Text>
            </View>
          </TouchableOpacity>
          {musicEnabled && (
            <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseBtn}>
              {isPlaying ? (
                <Pause size={20} color={colors.primary} />
              ) : (
                <Play size={20} color={colors.primary} fill={colors.primary} />
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowMusicModal(true)}>
            <Music size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Mini YouTube player for in-app audio playback */}
        {musicEnabled && (
          <View style={[styles.miniPlayer, { backgroundColor: colors.surface }]}>
            <WebView
              ref={webViewRef}
              source={{ uri: embedUrl }}
              style={styles.miniPlayerWebView}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
            />
          </View>
        )}

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            onPress={() => setMode('study')}
            style={[
              styles.modeButton,
              { backgroundColor: colors.surface },
              mode === 'study' && { backgroundColor: colors.primary },
            ]}
          >
            <TimerIcon size={20} color={mode === 'study' ? '#FFFFFF' : colors.text} />
            <Text style={[styles.modeText, { color: mode === 'study' ? '#FFFFFF' : colors.text }]}>Study</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('pomodoro')}
            style={[
              styles.modeButton,
              { backgroundColor: colors.surface },
              mode === 'pomodoro' && { backgroundColor: colors.secondary },
            ]}
          >
            <Coffee size={20} color={mode === 'pomodoro' ? '#FFFFFF' : colors.text} />
            <Text style={[styles.modeText, { color: mode === 'pomodoro' ? '#FFFFFF' : colors.text }]}>Pomodoro</Text>
          </TouchableOpacity>
        </View>

        {mode === 'study' ? (
          // === STUDY TIMER ===
          <View style={styles.timerSection}>
            <View style={styles.timerContainer}>
              <LinearGradient colors={[colors.primaryLight, colors.primaryDark]} style={styles.timerRing}>
                <View style={[styles.timerInner, { backgroundColor: colors.background }]}>
                  <Text style={[styles.timerDigits, { color: colors.text }]}>{formatTime(studySeconds)}</Text>
                  <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
                    {studyState === 'running' ? 'Studying...' : studyState === 'paused' ? 'Paused' : 'Ready to start'}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.controlsRow}>
              {studyState === 'idle' && (
                <TouchableOpacity onPress={startStudyTimer} activeOpacity={0.8}>
                  <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.mainButton}>
                    <Text style={styles.mainButtonText}>Start</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {studyState === 'running' && (
                <>
                  <TouchableOpacity
                    onPress={stopStudyTimer}
                    activeOpacity={0.8}
                    style={[styles.secondaryButton, { backgroundColor: colors.surface }]}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.error }]}>{saving ? 'Saving...' : 'Stop'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={pauseStudyTimer} activeOpacity={0.8}>
                    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.mainButton}>
                      <Text style={styles.mainButtonText}>Pause</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {studyState === 'paused' && (
                <>
                  <TouchableOpacity
                    onPress={stopStudyTimer}
                    activeOpacity={0.8}
                    style={[styles.secondaryButton, { backgroundColor: colors.surface }]}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.error }]}>Stop & Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={resumeStudyTimer} activeOpacity={0.8}>
                    <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.mainButton}>
                      <Text style={styles.mainButtonText}>Resume</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ) : (
          // === POMODORO TIMER ===
          <View style={styles.timerSection}>
            {/* Pomodoro Settings */}
            {pomodoroPhase === 'idle' && (
              <View style={styles.pomodoroSettings}>
                <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>Focus</Text>
                  <View style={styles.settingButtons}>
                    <TouchableOpacity
                      onPress={() => {
                        const newFocus = Math.max(5, pomodoroFocusMinutes - 5);
                        setPomodoroFocusMinutes(newFocus);
                        setPomodoroSeconds(newFocus * 60);
                      }}
                      style={[styles.settingBtn, { backgroundColor: colors.surfaceSecondary }]}
                    >
                      <Text style={styles.settingBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.settingValue, { color: colors.text }]}>{pomodoroFocusMinutes}m</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const newFocus = Math.min(60, pomodoroFocusMinutes + 5);
                        setPomodoroFocusMinutes(newFocus);
                        setPomodoroSeconds(newFocus * 60);
                      }}
                      style={[styles.settingBtn, { backgroundColor: colors.surfaceSecondary }]}
                    >
                      <Text style={styles.settingBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>Break</Text>
                  <View style={styles.settingButtons}>
                    <TouchableOpacity
                      onPress={() => setPomodoroBreakMinutes(Math.max(1, pomodoroBreakMinutes - 1))}
                      style={[styles.settingBtn, { backgroundColor: colors.surfaceSecondary }]}
                    >
                      <Text style={styles.settingBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.settingValue, { color: colors.text }]}>{pomodoroBreakMinutes}m</Text>
                    <TouchableOpacity
                      onPress={() => setPomodoroBreakMinutes(Math.min(30, pomodoroBreakMinutes + 1))}
                      style={[styles.settingBtn, { backgroundColor: colors.surfaceSecondary }]}
                    >
                      <Text style={styles.settingBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Pomodoro Timer Display */}
            <View style={styles.timerContainer}>
              <LinearGradient
                colors={pomodoroPhase === 'focus' || pomodoroPhase === 'idle' ? [colors.secondary, colors.secondaryDark] : [colors.primary, colors.primaryDark]}
                style={styles.timerRing}
              >
                <View style={[styles.timerInner, { backgroundColor: colors.background }]}>
                  <Text style={[styles.timerDigits, { color: colors.text }]}>{formatTime(pomodoroSeconds)}</Text>
                  <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
                    {pomodoroPhase === 'focus' ? 'Focus Time' : pomodoroPhase === 'break' ? 'Break Time' : 'Pomodoro'}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Session Dots */}
            <View style={styles.pomodoroCount}>
              <Text style={[styles.countLabel, { color: colors.textSecondary }]}>Sessions completed</Text>
              <View style={styles.countDots}>
                {[...Array(4)].map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, { backgroundColor: i < pomodoroSessions ? colors.secondary : colors.surfaceSecondary }]}
                  />
                ))}
              </View>
              <Text style={[styles.countValue, { color: colors.text }]}>{pomodoroSessions}</Text>
            </View>

            {/* Pomodoro Controls */}
            <View style={styles.pomodoroControls}>
              {pomodoroPhase === 'idle' ? (
                <TouchableOpacity onPress={startPomodoro} activeOpacity={0.8}>
                  <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.mainButton}>
                    <Text style={styles.mainButtonText}>Start Focus</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={stopPomodoro}
                    activeOpacity={0.8}
                    style={[styles.secondaryButton, { backgroundColor: colors.surface }]}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.error }]}>Reset</Text>
                  </TouchableOpacity>
                  {pomodoroPhase === 'focus' && (
                    <TouchableOpacity onPress={pausePomodoro} activeOpacity={0.8}>
                      <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={styles.mainButton}>
                        <Text style={styles.mainButtonText}>Pause</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={skipPomodoro}
                    activeOpacity={0.8}
                    style={[styles.secondaryButton, { backgroundColor: colors.surface }]}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Skip</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Pomodoro Tips */}
            <View style={styles.tipsContainer}>
              <Card style={styles.tipCard}>
                <Zap size={24} color={colors.accent} />
                <View style={styles.tipText}>
                  <Text style={[styles.tipTitle, { color: colors.text }]}>Pomodoro Technique</Text>
                  <Text style={[styles.tipMessage, { color: colors.textSecondary }]}>
                    Focus deeply, then take a short break to recharge
                  </Text>
                </View>
              </Card>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Lofi Beats Modal */}
      <Modal visible={showMusicModal} transparent animationType="fade" onRequestClose={() => setShowMusicModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMusicModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Music size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Lofi Beats</Text>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Background music for focus sessions
            </Text>

            <View style={styles.lofiList}>
              {LOFI_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.name}
                  onPress={() => {
                    setSelectedLofi(preset);
                    setMusicEnabled(true);
                    setIsPlaying(true);
                    saveLofiPreference(preset.url);
                    setShowMusicModal(false);
                  }}
                  style={[
                    styles.lofiOption,
                    { backgroundColor: selectedLofi.name === preset.name ? colors.primary + '20' : colors.surfaceSecondary },
                    selectedLofi.name === preset.name && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                >
                  <Text style={[styles.lofiOptionName, { color: colors.text }]}>{preset.name}</Text>
                  <Music size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                setMusicEnabled(false);
                setIsPlaying(true);
                setShowMusicModal(false);
              }}
              style={[styles.disableMusicBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <VolumeX size={20} color={colors.error} />
              <Text style={[styles.disableMusicText, { color: colors.error }]}>Disable Music</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg },
  title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold },
  lastSaved: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
  musicBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  musicBarContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  musicBarText: {},
  musicBarTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  musicBarHint: { fontSize: FontSizes.xs },
  modeSelector: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.md, marginBottom: Spacing.xl },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  modeText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  timerSection: { alignItems: 'center' },
  timerContainer: { marginVertical: Spacing.xl },
  timerRing: { width: 280, height: 280, borderRadius: 140, alignItems: 'center', justifyContent: 'center', ...Shadows.lg },
  timerInner: { width: 250, height: 250, borderRadius: 125, alignItems: 'center', justifyContent: 'center' },
  timerDigits: { fontSize: 52, fontWeight: FontWeights.bold, fontVariant: ['tabular-nums'] },
  timerLabel: { fontSize: FontSizes.sm, marginTop: Spacing.md },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xl, marginTop: Spacing.xl },
  mainButton: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg, borderRadius: BorderRadius.xl, ...Shadows.md },
  mainButtonText: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: '#FFFFFF' },
  secondaryButton: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, ...Shadows.sm },
  secondaryButtonText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  pomodoroSettings: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  settingCard: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  settingLabel: { fontSize: FontSizes.sm, marginBottom: Spacing.sm },
  settingButtons: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  settingBtnText: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: '#000' },
  settingValue: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, minWidth: 50, textAlign: 'center' },
  pomodoroCount: { alignItems: 'center', marginTop: Spacing.xl },
  countLabel: { fontSize: FontSizes.sm, marginBottom: Spacing.md },
  countDots: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  countValue: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold },
  pomodoroControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xl, marginTop: Spacing.xl },
  tipsContainer: { paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  tipCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  tipText: { flex: 1 },
  tipTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, marginBottom: 4 },
  tipMessage: { fontSize: FontSizes.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  modalContent: { width: '100%', maxWidth: 340, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  modalSubtitle: { fontSize: FontSizes.sm, marginBottom: Spacing.xl },
  lofiList: { marginBottom: Spacing.xl },
  lofiOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  lofiOptionName: { fontSize: FontSizes.md, fontWeight: FontWeights.medium },
  disableMusicBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg, borderRadius: BorderRadius.lg },
  disableMusicText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  playPauseBtn: { padding: Spacing.sm, marginRight: Spacing.sm },
  miniPlayer: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    height: 200,
    ...Shadows.sm,
  },
  miniPlayerWebView: { flex: 1 },
});
