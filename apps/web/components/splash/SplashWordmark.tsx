"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface SplashWordmarkProps {
  /** Delay before the fade-in starts, in ms. */
  delayMs?: number;
  /** Fade-in duration, in ms. */
  durationMs?: number;
}

/**
 * Rendered as inline SVG (not a <img src="/kairo-wordmark.svg">) on
 * purpose: the brand has no outlined/vector-traced wordmark asset to
 * source from, only the flattened logo screenshot. An externally
 * referenced SVG loaded via next/image can't inherit the page's
 * loaded Poppins font — inline SVG text can, via ordinary CSS
 * cascade — so this stays faithful to the real brand typeface instead
 * of silently falling back to a generic system sans-serif. See the
 * implementation notes for the tracing tradeoff this involves.
 */
export function SplashWordmark({
  delayMs = 150,
  durationMs = 200,
}: SplashWordmarkProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 220 56"
      role="img"
      aria-label="Kairo"
      className="h-auto w-40 text-white sm:w-48 md:w-56"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: durationMs / 1000,
        delay: shouldReduceMotion ? 0 : delayMs / 1000,
        ease: "easeOut",
      }}
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="font-heading"
        fontSize="44"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="0.5"
      >
        Kairo
      </text>
    </motion.svg>
  );
}
