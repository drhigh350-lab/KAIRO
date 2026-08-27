import { useEffect, useState } from 'react';

/** The event Chrome/Edge fire instead of their own install UI — captured once, `prompt()` is only ever callable this one time. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Captures the browser's `beforeinstallprompt` event so a custom "Install
 * App" button can trigger it on demand, instead of relying on the
 * browser's own (easy-to-miss, non-persistent) install affordance. Fires
 * once per page load at most — the browser only ever hands this event out
 * a single time, and never on iOS Safari or once the app is already
 * installed (there `installed` below is the only signal available).
 */
export function useInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
  );

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    function handleAppInstalled() {
      setInstallEvent(null);
      setInstalled(true);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    // Whatever the student chose, this exact event object can't be prompted
    // again — the button disappears either way until the next real prompt.
    setInstallEvent(null);
    if (outcome === 'accepted') setInstalled(true);
  }

  return { canInstall: !!installEvent && !installed, promptInstall };
}
