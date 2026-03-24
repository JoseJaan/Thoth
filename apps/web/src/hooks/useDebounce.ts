import { useEffect, useRef, useCallback } from "react";

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  callbackRef.current = callback;

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        lastArgsRef.current = null;
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Flush: immediately execute pending callback
  const flush = useCallback(() => {
    if (timeoutRef.current && lastArgsRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      const args = lastArgsRef.current;
      lastArgsRef.current = null;
      callbackRef.current(...args);
    }
  }, []);

  // Cancel: discard pending callback without executing
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      lastArgsRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      // Flush on unmount instead of discarding
      if (timeoutRef.current && lastArgsRef.current) {
        clearTimeout(timeoutRef.current);
        callbackRef.current(...lastArgsRef.current);
      }
    };
  }, []);

  return Object.assign(debouncedFn, { flush, cancel });
}
