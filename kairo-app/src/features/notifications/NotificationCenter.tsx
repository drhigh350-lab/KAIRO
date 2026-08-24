import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { runNotificationPulseOnce, recordNotificationOutcome, type AppNotification } from '../../lib/kairoEngine';

/**
 * Where tapping-through a delivered candidate should land — mirrors each
 * `action` value NotificationEngine/ReEngagementEngine/ContinuationEngine
 * already produce. A candidate with no mapped action (or action: null,
 * e.g. a milestone or the post-exam acknowledgment) is dismiss-only.
 */
const ACTION_ROUTES: Record<string, string> = {
  resume_session: '/practice',
  start_recap: '/review',
  start_session: '/practice',
  view_plan: '/home',
  start_peak_session: '/practice',
  view_challenges: '/challenges',
  view_weekly: '/profile',
  start_recovery_session: '/practice',
};

/**
 * The missing delivery surface for the Student Journey & Engagement Engine's
 * notification pipeline (ReEngagementEngine, CrossModuleMilestones,
 * ContinuationEngine, NotificationEngine) — all fully built and individually
 * tested at the engine layer, but with nothing in the app that ever called
 * them until runNotificationPulse() existed, and nothing that ever rendered
 * what came back. No real push/email/WhatsApp/SMS transport exists yet, so
 * this in-app banner is the only channel that actually reaches a student
 * right now regardless of the tier the Orchestrator assigned.
 *
 * Mounted once at the app root (see App.tsx) so it survives client-side
 * route changes rather than remounting per screen.
 */
export function NotificationCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [queue, setQueue] = useState<AppNotification[]>([]);

  useEffect(() => {
    let fresh: AppNotification[] = [];
    try {
      fresh = runNotificationPulseOnce();
    } catch {
      // A notification pulse failing should never block the app itself.
    }
    if (fresh.length > 0) setQueue((q) => [...q, ...fresh]);
    // Re-checked on every route change — runNotificationPulseOnce() is a
    // no-op once it has actually run for the signed-in student, so this is
    // just how a fresh sign-in (which navigates client-side, not via a
    // page reload) gets its one real chance to fire once an engine exists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (queue.length === 0) return null;
  const current = queue[0];
  const route = current.action ? ACTION_ROUTES[current.action] : undefined;

  function advance(outcome: 'dismissed' | 'engaged') {
    recordNotificationOutcome(current, outcome);
    setQueue((q) => q.slice(1));
  }

  function handleTap() {
    if (!route) return;
    advance('engaged');
    navigate(route);
  }

  return (
    // A normal-flow block, not `position: fixed` — NotificationCenter is
    // mounted as a sibling of the routed screen inside .app-shell's own
    // flex column (see App.tsx), so rendering it in-flow here means it
    // simply pushes that screen's content down by its own height,
    // whatever that screen's own header looks like, rather than floating
    // over it. `position: fixed` (this component's previous approach)
    // required guessing a single top offset that could clear every
    // screen's differently-sized header — Practice/CBT/Review's tall
    // two-row topbar, a plain ScreenHeader, or (Insights, Home) no
    // standard header component at all — and no single guess could ever
    // be right everywhere: it either buried a question screen's own
    // exit/bookmark controls (the original bug — a notification firing
    // mid-question made Practice's exit button unreachable until
    // dismissed) or covered real content just below a shorter header
    // (Insights' own Kairo Score card, confirmed in testing).
    <div style={{ padding: '10px 16px 0', background: 'var(--dark-bg-canvas)' }}>
      <div style={{
        background: 'var(--dark-bg-surface)',
        border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
        padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <div
          style={{ flex: 1, cursor: route ? 'pointer' : 'default' }}
          onClick={route ? handleTap : undefined}
          role={route ? 'button' : undefined}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>{current.title}</div>
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 3, lineHeight: 1.4 }}>{current.body}</div>
        </div>
        <button type="button" onClick={() => advance('dismissed')} aria-label="Dismiss" style={{
          background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--dark-text-faint)',
          flexShrink: 0, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
        </button>
      </div>
    </div>
  );
}
