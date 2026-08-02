"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSplashTimer } from "@/hooks/useSplashTimer";
import { SplashLogo } from "./SplashLogo";
import { SplashWordmark } from "./SplashWordmark";
import { SplashTagline } from "./SplashTagline";
import { SplashLoader } from "./SplashLoader";

export interface SplashScreenProps {
  /** Total time the splash stays visible before exiting, in ms. Defaults to 1.8s (within the 1.5-2s spec range). */
  duration?: number;
  /** Called once the exit fade has fully finished — not before. Routing is the caller's responsibility. */
  onComplete?: () => void;
}

const EXIT_DURATION_S = 0.28;

export function SplashScreen({ duration = 1800, onComplete }: SplashScreenProps) {
  const { isVisible } = useSplashTimer({ duration });

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key="kairo-splash"
          role="status"
          aria-live="polite"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_DURATION_S, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-kairo-navy-900 px-6 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)]"
        >
          <span className="sr-only">Loading Kairo</span>
          <div
            aria-hidden="true"
            className="flex w-full max-w-xs flex-col items-center gap-3 sm:max-w-sm sm:gap-4 md:max-w-md md:gap-5"
          >
            <SplashLogo />
            <SplashWordmark />
            <SplashTagline />
            <div className="mt-10 sm:mt-12 md:mt-16">
              <SplashLoader />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
