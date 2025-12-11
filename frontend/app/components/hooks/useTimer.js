import { useState, useRef, useEffect } from 'react';

export const useTimer = (initialTime, onComplete) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerIntervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isStarted && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimeout(() => onCompleteRef.current(), 100);
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
  }, [isStarted, isPaused]);

  useEffect(() => {
    if (isStarted && timeLeft === 0) {
      onCompleteRef.current();
    }
  }, [timeLeft, isStarted]);

  const start = () => {
    setIsStarted(true);
  setIsPaused(false); // Ensure timer is not paused when starting
  };
  
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
