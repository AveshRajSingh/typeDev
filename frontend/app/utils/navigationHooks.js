import { useRef, useEffect, useState } from 'react';

/**
 * Custom hook to prevent unnecessary effect runs during navigation
 * This helps avoid redundant API calls when user navigates between pages
 * 
 * Usage:
 * const isFirstMount = useIsFirstMount();
 * 
 * useEffect(() => {
 *   if (!isFirstMount) return; // Skip on subsequent mounts
 *   // Your effect code
 * }, [isFirstMount]);
 */
export function useIsFirstMount() {
  const isFirst = useRef(true);

  useEffect(() => {
    isFirst.current = false;
  }, []);

  return isFirst.current;
}

/**
 * Custom hook to prevent effect from running on mount
 * Only runs on dependency changes after initial mount
 * 
 * Usage:
 * useUpdateEffect(() => {
 *   // This won't run on mount, only on updates
 * }, [dependency]);
 */
export function useUpdateEffect(effect, deps) {
  const isFirstMount = useIsFirstMount();

  useEffect(() => {
    if (!isFirstMount) {
      return effect();
    }
  }, deps);
}

/**
 * Debounced value hook to prevent rapid API calls
 * Useful for settings that trigger fetches
 * 
 * Usage:
 * const debouncedDifficulty = useDebounce(difficulty, 300);
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
