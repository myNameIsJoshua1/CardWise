import { useState, useEffect, useRef } from 'react';

export const useTimer = (shouldStart = false) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (shouldStart && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [shouldStart]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return { timeSpent, stopTimer };
};
