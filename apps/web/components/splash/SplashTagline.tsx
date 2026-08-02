"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface SplashTaglineProps {
  /** Delay before the fade-in starts, in ms. */
  delayMs?: number;
  /** Fade-in duration, in ms. */
  durationMs?: number;
}

export function SplashTagline({
  delayMs = 250,
  durationMs = 200,
}: SplashTaglineProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.p
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: durationMs / 1000,
        delay: shouldReduceMotion ? 0 : delayMs / 1000,
        ease: "easeOut",
      }}
      className="font-body text-sm font-medium tracking-[0.2em] text-kairo-blue-300 sm:text-base"
    >
      Seize the Moment
    </motion.p>
  );
}
