import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';

export type TimerState = 'idle' | 'running' | 'paused';

export function useStudyTimer() {
  const [seconds, setSeconds] = useState(0);
  const [state, setState] = useState<TimerState>('idle');
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const start = useCallback(() => {
    const now = new Date();
    setSessionStart(now);
    setState('running');
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState('paused');
  }, []);

  const resume = useCallback(() => {
    setState('running');
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  }, []);

  const stop = useCallback(async (userId: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (sessionStart && seconds > 0) {
      const durationMinutes = Math.floor(seconds / 60);
      const endedAt = new Date();

      const { error } = await supabase.from('study_sessions').insert({
        user_id: userId,
        duration_minutes: durationMinutes,
        started_at: sessionStart.toISOString(),
        ended_at: endedAt.toISOString(),
      });

      if (error) {
        console.error('Failed to save study session:', error);
      }
    }

    setState('idle');
    setSeconds(0);
    setSessionStart(null);
  }, [sessionStart, seconds]);

  return {
    seconds,
    state,
    start,
    pause,
    resume,
    stop,
  };
}
