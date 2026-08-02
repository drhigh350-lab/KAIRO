"use client";

import { useEffect, useState } from "react";

interface UseSplashTimerOptions {
  /** How long the splash stays fully visible before starting its exit, in ms. */
  duration: number;
}

interface UseSplashTimerResult {
  /** True while the splash should remain mounted and visible. */
  isVisible: boolean;
}

/**
 * Owns the one piece of impure state a splash screen needs: when to
 * stop being visible. It does not run the exit animation itself —
 * SplashScreen wires this into <AnimatePresence exit> so the fade-out
 * actually plays before onComplete fires.
 */
export function useSplashTimer({
  duration,
}: UseSplashTimerOptions): UseSplashTimerResult {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(false), duration);
    return () => window.clearTimeout(timer);
  }, [duration]);

  return { isVisible };
}
