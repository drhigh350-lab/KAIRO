"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface SplashLoaderProps {
  /** Delay before the pulsing loop starts, in ms. */
  delayMs?: number;
}

const DOT_COUNT = 3;
const PULSE_DURATION_S = 1.4;
const DOT_STAGGER_S = 0.2;

/**
 * Three softly pulsing dots. Decorative only — the surrounding
 * SplashScreen already announces a "Loading Kairo" status to
 * assistive tech, so this stays aria-hidden to avoid a redundant or
 * confusing announcement.
 */
export function SplashLoader({ delayMs = 350 }: SplashLoaderProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      {Array.from({ length: DOT_COUNT }, (_, index) => (
        <motion.span
          key={index}
          className="h-2 w-2 rounded-full bg-kairo-blue-300 sm:h-2.5 sm:w-2.5"
          initial={{ opacity: 0.3, scale: 0.85 }}
          animate={
            shouldReduceMotion
              ? { opacity: 0.6 }
              : { opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.01 }
              : {
                  duration: PULSE_DURATION_S,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: delayMs / 1000 + index * DOT_STAGGER_S,
                }
          }
        />
      ))}
    </div>
  );
}
