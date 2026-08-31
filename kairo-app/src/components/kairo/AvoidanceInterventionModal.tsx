import { Button } from '../core/Button';

export interface AvoidanceInterventionModalProps {
  /** Kai's exact, product-owner-authorized text (RecommendationEngine's Avoidance Tracker crossing threshold — see KaiBehavior's 'avoidance_intervention' case). */
  text: string;
  /** "Let's do it" — routes straight into the Focused Sprint the message names. */
  onAcknowledge: () => void;
  /** "Not now" — a real, if de-emphasized, decline. Never omit this: a fully trapped modal with zero way out is a genuine accessibility/App-Store-review problem, not just a UX nicety. */
  onDismiss: () => void;
}

/**
 * Kai's Avoidance Tone intervention — shared by Home and Practice Home,
 * since the Avoidance Tracker's dodge-streak state doesn't care which
 * screen the dodge happened on. Deliberately NOT the shared Modal
 * component (which closes on backdrop click and Escape — both casual,
 * half-conscious dismissals that would undercut an intentionally direct
 * message). No X, no backdrop dismiss, no Escape key — only the two
 * explicit buttons below.
 */
export function AvoidanceInterventionModal({ text, onAcknowledge, onDismiss }: AvoidanceInterventionModalProps) {
  return (
    <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(11,23,32,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 }}>
      <div role="dialog" aria-modal="true" style={{ background: 'var(--dark-bg-elevated)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-xl)', padding: 24, maxWidth: 360, width: '100%' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--dark-text-heading)', marginBottom: 10 }}>From Kai</div>
        <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.6, marginBottom: 20 }}>{text}</div>
        <Button variant="darkAccent" size="lg" fullWidth onClick={onAcknowledge}>Let's do it</Button>
        <button type="button" onClick={onDismiss} style={{
          marginTop: 14, width: '100%', minHeight: 'var(--touch-min)', background: 'none', border: 'none',
          color: 'var(--dark-text-faint)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Not now
        </button>
      </div>
    </div>
  );
}
