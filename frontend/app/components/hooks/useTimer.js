import { useState, useRef, useEffect } from 'react';

export const useTimer = (initialTime, onComplete) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    if (isStarted && !isPaused && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimeout(onComplete, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    } else {
      // Clear interval when paused
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [isStarted, isPaused, onComplete, timeLeft]);

  useEffect(() => {
    if (isStarted && timeLeft === 0) {
      onComplete();
    }
  }, [timeLeft, isStarted, onComplete]);

  const start = () => setIsStarted(true);
  
  const pause = () => setIsPaused(true);
  
  const resume = () => setIsPaused(false);
  
  const reset = () => {
    setTimeLeft(initialTime);
    setIsStarted(false);
    setIsPaused(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  return { timeLeft, isStarted, isPaused, start, pause, resume, reset };
};
