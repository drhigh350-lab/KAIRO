import { useState } from 'react';
import { Button } from '../../components';
import { KaiMark } from './shared';
import { getStreakStatus, getPrestigeProgress } from '../../lib/kairoEngine';

const MONO_FONT = "'SF Mono','Roboto Mono',ui-monospace,Menlo,monospace";

export interface DiagnosticResultsProps {
  /** Real diagnosticSummary from OnboardingEngine._summarizeDiagnostic() — total/correct/accuracy/message are all measured, not estimated. */
  summary: { total: number; correct: number; accuracy: number; message: string };
  /** Real OnboardingCompleteResult.pointsEarned — the flat, one-time KairoPointsAwards.ONBOARDING_BONUS just credited by buildInitialPlan(). */
  pointsEarned: number;
  onContinue: () => void;
}

export function DiagnosticResults({ summary, pointsEarned, onContinue }: DiagnosticResultsProps) {
  const [toast, setToast] = useState<{ show: boolean; visible: boolean }>({ show: false, visible: false });

  // Real, already-earned values — earnFreeze()/levelSystem.update() both ran
  // inside buildInitialPlan() before this screen ever rendered, so these are
  // reads of genuine profile state, not numbers invented client-side.
  const freezesAvailable = getStreakStatus()?.freezesAvailable ?? 0;
  // Every fresh account starts at 0 Kairo Points, which getPrestigeTier()
  // maps to tierIndex 0 — "The Candidate". There's no tier-crossing event to
  // detect here (the onboarding bonus can't itself cross out of tier 0), so
  // this is a one-time first reveal of the real current tier, not a re-run
  // of the tier-upgrade-toast detection used on later sessions.
  const rankName = getPrestigeProgress()?.name ?? 'The Candidate';

  function handleContinue() {
    setToast({ show: true, visible: false });
    requestAnimationFrame(() => setToast({ show: true, visible: true }));
    setTimeout(onContinue, 900);
  }

  return (
    <div style={{ padding: '20px 24px 32px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--dark-bg-canvas)', position: 'relative' }}>
      {toast.show && (
        <div style={{
          position: 'absolute', top: 16, left: 16, right: 16, zIndex: 20,
          opacity: toast.visible ? 1 : 0, transform: toast.visible ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 150ms ease-out, transform 150ms ease-out',
          background: 'var(--dark-bg-elevated)', color: '#fff', padding: '12px 16px', borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--kairo-gold-500)" stroke="none"><path d="M12 2l2.4 6.8L21 9.3l-5.4 4.4L17.4 21 12 17l-5.4 4 1.8-7.3L3 9.3l6.6-.5z" /></svg>
          Rank Unlocked: {rankName}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
        <KaiMark size={72} check tone="white" />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--dark-text-heading)' }}>Here's what I noticed</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.55, maxWidth: 300 }}>{summary.message}</div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: MONO_FONT, fontWeight: 800, fontSize: 28, color: 'var(--dark-text-heading)' }}>{summary.correct}/{summary.total}</div>
            <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>Correct</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: MONO_FONT, fontWeight: 800, fontSize: 28, color: 'var(--dark-text-heading)' }}>{summary.accuracy}%</div>
            <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>Accuracy</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320, marginTop: 4 }}>
          <div style={{
            flex: 1, background: 'rgba(201,162,39,0.15)', borderRadius: 'var(--radius-md)', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', textAlign: 'left',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--kairo-gold-500)' }}>Onboarding Bonus</span>
            <span style={{ fontFamily: MONO_FONT, fontWeight: 800, fontSize: 16, color: 'var(--dark-text-heading)' }}>+{pointsEarned} <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12 }}>Kairo Points</span></span>
          </div>
          <div style={{
            flex: 1, background: 'transparent', border: '1px dashed var(--dark-border)', borderRadius: 'var(--radius-md)',
            padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center', textAlign: 'left',
          }}>
            <span style={{ fontSize: 14 }}>❄</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--dark-text-heading)' }}>{freezesAvailable}x Streak Freeze</span>
            <span style={{ fontSize: 10, color: 'var(--dark-text-faint)' }}>Earned</span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--dark-text-faint)', maxWidth: 300 }}>
          Welcome Bonus applied. Kairo's got your back if you miss a day.
        </div>
      </div>
      <Button variant="gold" size="lg" fullWidth onClick={handleContinue}>Continue</Button>
    </div>
  );
}
