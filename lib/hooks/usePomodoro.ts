import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';

export type PomodoroPhase = 'idle' | 'focus' | 'break';

export function usePomodoro(focusMinutes: number = 25, breakMinutes: number = 5) {
  const [seconds, setSeconds] = useState(0);
  const [phase, setPhase] = useState<PomodoroPhase>('idle');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const focusSeconds = focusMinutes * 60;
  const breakSeconds = breakMinutes * 60;

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase === 'focus' && seconds >= focusSeconds) {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      setSessionsCompleted(prev => prev + 1);
      setTotalFocusTime(prev => prev + focusMinutes);
      startBreak();
    } else if (phase === 'break' && seconds >= breakSeconds) {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      setPhase('idle');
      setSeconds(0);
    }
  }, [seconds, phase, focusSeconds, breakSeconds, focusMinutes, breakMinutes]);

  const startFocus = useCallback(() => {
    setPhase('focus');
    setSeconds(0);
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  }, []);

  const startBreak = useCallback(() => {
    setPhase('break');
    setSeconds(0);
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resume = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  }, []);

  const stop = useCallback(async (userId: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (phase === 'focus' && seconds > 0) {
      await supabase.from('pomodoro_sessions').insert({
        user_id: userId,
        focus_duration_minutes: focusMinutes,
        break_duration_minutes: breakMinutes,
        completed: false,
        started_at: new Date(Date.now() - seconds * 1000).toISOString(),
        ended_at: new Date().toISOString(),
      });
    }

    setPhase('idle');
    setSeconds(0);
  }, [phase, seconds, focusMinutes, breakMinutes]);

  const completeSession = useCallback(async (userId: string) => {
    if (phase === 'focus') {
      await supabase.from('pomodoro_sessions').insert({
        user_id: userId,
        focus_duration_minutes: focusMinutes,
        break_duration_minutes: breakMinutes,
        completed: true,
        started_at: new Date(Date.now() - focusSeconds * 1000).toISOString(),
        ended_at: new Date().toISOString(),
      });
    }
  }, [phase, focusMinutes, breakMinutes, focusSeconds]);

  return {
    seconds,
    phase,
    sessionsCompleted,
    totalFocusTime,
    startFocus,
    startBreak,
    pause,
    resume,
    stop,
    completeSession,
    focusSeconds,
    breakSeconds,
  };
}
