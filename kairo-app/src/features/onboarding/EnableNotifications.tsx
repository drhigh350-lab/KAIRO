import { useState } from 'react';
import { Button } from '../../components';
import { grantChannelConsent } from '../../lib/kairoEngine';

export interface EnableNotificationsProps {
  onDone: () => void;
}

/**
 * Arrival's one baseline consent ask (Notifications & Communication
 * Systems §10.4) — push only. Email/WhatsApp/SMS are deliberately never
 * bundled in here; they're requested opportunistically and separately,
 * later, each with its own explanation (see NotificationSettings).
 * Never a hard gate — "Not now" always proceeds.
 */
export function EnableNotifications({ onDone }: EnableNotificationsProps) {
  const [requesting, setRequesting] = useState(false);
  const [deniedNote, setDeniedNote] = useState(false);
  const supportsPush = typeof window !== 'undefined' && 'Notification' in window;

  async function handleEnable() {
    if (!supportsPush) { onDone(); return; }
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        await grantChannelConsent('push');
        onDone();
      } else {
        // §7.3 — honest, not guilt-tripping: reflect the real OS decision, offer no retry pressure.
        setDeniedNote(true);
        setRequesting(false);
      }
    } catch {
      setRequesting(false);
      onDone();
    }
  }

  return (
    <div style={{ padding: '20px 24px 32px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--dark-bg-canvas)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
        <div style={{
          width: 84, height: 84, borderRadius: '50%', background: 'var(--dark-bg-elevated)', border: '2px solid var(--dark-accent-blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--dark-text-heading)' }}>Never miss a nudge.</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.55, maxWidth: 300 }}>
            {deniedNote
              ? "That's fine — you can turn this on any time from Profile. Everything still shows up inside Kairo when you open it."
              : 'Kairo will send a push notification when a concept is about to fade, your streak needs attention, or an exam date is close. You choose what kind, any time, in Profile.'}
          </div>
        </div>
      </div>
      {!deniedNote ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Button variant="darkAccent" size="lg" fullWidth disabled={requesting} onClick={handleEnable}>
            {requesting ? 'Requesting…' : 'Enable Notifications'}
          </Button>
          <button type="button" onClick={onDone} style={{
            background: 'none', border: 'none', color: 'var(--dark-text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)',
          }}>Not now</button>
        </div>
      ) : (
        <Button variant="darkAccent" size="lg" fullWidth onClick={onDone}>Continue</Button>
      )}
    </div>
  );
}
