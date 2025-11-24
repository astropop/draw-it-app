import { useCallback, useEffect, useRef, useState } from "react";

export type TimerType = "drawing" | "guessing" | null;

// onExpire receives the type that expired
export default function useTimer(onExpire: (type: TimerType) => void) {
  const intervalRef = useRef<number | null>(null);
  const typeRef = useRef<TimerType>(null);
  const onExpireRef = useRef(onExpire);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [running, setRunning] = useState(false);
  const [currentType, setCurrentType] = useState<TimerType>(null);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    typeRef.current = null;
    setCurrentType(null);
    setRunning(false);
    setTimeLeft(0);
  }, []);

  const start = useCallback(
    (type: TimerType, seconds: number) => {
      stop();
      if (!type || seconds <= 0) return;
      typeRef.current = type;
      setCurrentType(type);
      setTimeLeft(seconds);
      setRunning(true);

      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // expire
            stop();
            // call the latest onExpire
            onExpireRef.current(typeRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [stop]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    running,
    start,
    stop,
    currentType,
  } as const;
}
