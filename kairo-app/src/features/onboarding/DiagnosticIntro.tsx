import { Button } from '../../components';
import type { AsyncState } from '../../components/feedback/AsyncState';
import { KairoStateView } from '../../components/feedback/AsyncState';

export interface DiagnosticIntroProps {
  /** Real Kai copy from the engine's own 'diagnostic_intro' onboarding step — never hardcoded here. */
  title?: string;
  body?: string;
  state: AsyncState;
  empty?: boolean;
  onContinue: () => void;
  onRetry: () => void;
  onContinueOffline: () => void;
}

export function DiagnosticIntro({ title, body, state, empty = false, onContinue, onRetry, onContinueOffline }: DiagnosticIntroProps) {
  return (
    <div style={{ padding: '20px 24px 32px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--dark-bg-canvas)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
        <img src="/assets/illustration-kai-goat.png" alt="Kai" style={{ width: 150 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--dark-text-heading)' }}>{title || 'Quick Check-In'}</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.55, maxWidth: 300 }}>
            {body || "Let's find out exactly what you already know — and what needs work. A few quick questions, no wrong answers."}
          </div>
        </div>
        {state === 'error' && <KairoStateView state="error" compact onRetry={onRetry} />}
        {state === 'offline' && <KairoStateView state="offline" compact onRetry={onRetry} onContinueOffline={onContinueOffline} />}
        {(state === 'loading' || state === 'slow' || state === 'retry') && <KairoStateView state={state} compact onRetry={onRetry} />}
        {empty && state === 'success' && <div style={{ fontSize: 13, color: 'var(--dark-text-muted)' }}>Your check-in is ready when question content is available.</div>}
      </div>
      <Button variant="darkAccent" size="lg" fullWidth disabled={state === 'loading' || state === 'retry'} onClick={onContinue}>
        {state === 'loading' || state === 'retry' ? 'Preparing your questions…' : "Let's go"}
      </Button>
    </div>
  );
}
