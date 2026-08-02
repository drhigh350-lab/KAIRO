"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export interface SplashLogoProps {
  /** Delay before the fade-in starts, in ms. */
  delayMs?: number;
  /** Fade-in duration, in ms. */
  durationMs?: number;
}

export function SplashLogo({ delayMs = 0, durationMs = 200 }: SplashLogoProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: durationMs / 1000,
        delay: shouldReduceMotion ? 0 : delayMs / 1000,
        ease: "easeOut",
      }}
      className="h-20 w-20 sm:h-[100px] sm:w-[100px] md:h-[120px] md:w-[120px]"
    >
      <Image
        src="/kairo-icon.svg"
        alt=""
        width={120}
        height={101}
        priority
        className="h-full w-full"
      />
    </motion.div>
  );
}
