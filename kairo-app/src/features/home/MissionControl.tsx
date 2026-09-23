import type { CSSProperties } from 'react';
import type { DashboardOption } from '../../lib/kairoEngine';
import type { AsyncState } from '../../components/feedback/AsyncState';
import { KairoStateView } from '../../components/feedback/AsyncState';

interface MissionControlProps {
  primaryOption: DashboardOption | null;
  pendingRepairs: number | null;
  repairsState: Exclude<AsyncState, 'idle'>;
  onRetryRepairs: () => void;
  onContinueOfflineRepairs: () => void;
  questionsToday: number;
  dailyGoal: number | null;
  daysToGo: number | null;
  onStartRecommendation: () => void;
  onOpenReview: () => void;
  onOpenPlanner: () => void;
}

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 0',
  borderTop: '1px solid var(--dark-border)',
};

function Arrow() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2.5"><path d="M9 6l6 6-6 6" /></svg>;
}

function SignalIcon({ kind }: { kind: 'focus' | 'repair' | 'plan' }) {
  const path = kind === 'focus'
    ? 'M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z'
    : kind === 'repair'
      ? 'M4 4h16v16H4zM8 9h8M8 13h5'
      : 'M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z';

  return (
    <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(46,124,246,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d={path} /></svg>
    </span>
  );
}

export function MissionControl({
  primaryOption,
  pendingRepairs,
  questionsToday,
  dailyGoal,
  daysToGo,
  onStartRecommendation,
  onOpenReview,
  onOpenPlanner,
  repairsState,
  onRetryRepairs,
  onContinueOfflineRepairs,
}: MissionControlProps) {
  const goalRemaining = dailyGoal == null ? null : Math.max(0, dailyGoal - questionsToday);
  const recommendationLabel = primaryOption?.topic
    ? `Practice ${primaryOption.topic}`
    : 'Start a short diagnostic session';

  return (
    <section style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: 18 }} aria-labelledby="mission-control-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.08em', color: 'var(--dark-accent-blue)', fontWeight: 800 }}>KAIRO MISSION CONTROL</div>
          <h2 id="mission-control-title" style={{ margin: '6px 0 0', fontFamily: 'var(--font-heading)', fontSize: 19, lineHeight: 1.25, color: 'var(--dark-text-heading)' }}>Your next best actions</h2>
          <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.45, color: 'var(--dark-text-muted)' }}>A short plan built from what Kairo knows about your practice so far.</p>
        </div>
        {daysToGo != null && <span style={{ fontSize: 12, color: 'var(--dark-text-muted)', whiteSpace: 'nowrap' }}>{daysToGo}d to UTME</span>}
      </div>

      <div style={{ marginTop: 14 }}>
        <button type="button" onClick={onStartRecommendation} style={{ ...rowStyle, width: '100%', textAlign: 'left', borderTop: 'none', background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', fontFamily: 'inherit', paddingTop: 8 }}>
          <SignalIcon kind="focus" />
          <span style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', color: 'var(--dark-text-heading)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recommendationLabel}</strong>
            <span style={{ display: 'block', marginTop: 3, color: 'var(--dark-text-muted)', fontSize: 12 }}>{primaryOption?.reason || 'Kairo will learn from your answers and choose the next useful step.'}</span>
          </span>
          <Arrow />
        </button>

        <button type="button" onClick={onOpenReview} style={{ ...rowStyle, width: '100%', textAlign: 'left', background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <SignalIcon kind="repair" />
          <span style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', color: 'var(--dark-text-heading)', fontSize: 13 }}>Repair your mistakes</strong>
            {repairsState === 'success' ? (
              <span style={{ display: 'block', marginTop: 3, color: 'var(--dark-text-muted)', fontSize: 12 }}>{pendingRepairs == null ? 'No repair questions are due right now.' : pendingRepairs > 0 ? `${pendingRepairs} question${pendingRepairs === 1 ? '' : 's'} ready for review.` : 'No repair questions are due right now.'}</span>
            ) : (
              <KairoStateView state={repairsState} compact onRetry={onRetryRepairs} onContinueOffline={onContinueOfflineRepairs} />
            )}
          </span>
          <Arrow />
        </button>

        <button type="button" onClick={onOpenPlanner} style={{ ...rowStyle, width: '100%', textAlign: 'left', background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <SignalIcon kind="plan" />
          <span style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', color: 'var(--dark-text-heading)', fontSize: 13 }}>{goalRemaining == null ? 'Set a daily target' : goalRemaining > 0 ? `${goalRemaining} question${goalRemaining === 1 ? '' : 's'} left today` : 'Daily target complete'}</strong>
            <span style={{ display: 'block', marginTop: 3, color: 'var(--dark-text-muted)', fontSize: 12 }}>{dailyGoal == null ? 'Choose a realistic rhythm for your preparation.' : `${questionsToday} of ${dailyGoal} questions completed today.`}</span>
          </span>
          <Arrow />
        </button>
      </div>
    </section>
  );
}
