"use client";

import { useState } from "react";
import { SplashScreen } from "@/components/splash/SplashScreen";

/**
 * Demo host for SplashScreen. Routing is intentionally out of scope
 * here (per SplashScreen's contract) — a real app would call
 * router.replace('/welcome') from onComplete instead of this local
 * state flip.
 */
export default function Home() {
  const [isSplashDone, setIsSplashDone] = useState(false);

  return (
    <main className="min-h-dvh bg-kairo-navy-900">
      <SplashScreen duration={1800} onComplete={() => setIsSplashDone(true)} />
      {isSplashDone && (
        <div className="flex min-h-dvh items-center justify-center px-6 text-center font-body text-kairo-blue-200">
          <p>Splash complete — this is where navigation to Welcome happens.</p>
        </div>
      )}
    </main>
  );
}
