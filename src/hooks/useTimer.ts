import { useEffect, useRef, useState, useCallback } from 'react';

interface UseTimerReturn {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isOvertime: boolean;
  isAlert: boolean;
  timeString: string;
  elapsedSeconds: number;
  initialSeconds: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setDuration: (minutes: number) => void;
}

export const useTimer = (initialMinutes: number): UseTimerReturn => {
  const [initialSeconds, setInitialSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOvertime = remainingSeconds < 0;
  const absSeconds = Math.abs(remainingSeconds);
  const displayMinutes = Math.floor(absSeconds / 60);
  const displaySeconds = absSeconds % 60;
  const isAlert = remainingSeconds <= 30 && remainingSeconds > 0;

  const timeString = `${isOvertime ? '−' : ''}${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemainingSeconds(initialSeconds);
    setElapsedSeconds(0);
  }, [initialSeconds]);

  const setDuration = useCallback((minutes: number) => {
    setIsRunning(false);
    const secs = minutes * 60;
    setInitialSeconds(secs);
    setRemainingSeconds(secs);
    setElapsedSeconds(0);
  }, []);

  return {
    minutes: displayMinutes,
    seconds: displaySeconds,
    isRunning,
    isOvertime,
    isAlert,
    timeString,
    elapsedSeconds,
    initialSeconds,
    start,
    pause,
    reset,
    setDuration,
  };
};
