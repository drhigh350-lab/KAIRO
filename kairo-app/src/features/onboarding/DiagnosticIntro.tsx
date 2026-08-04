import { Button } from '../../components';
import { KaiMark } from './shared';

export interface DiagnosticIntroProps {
  /** Real Kai copy from the engine's own 'diagnostic_intro' onboarding step — never hardcoded here. */
  title?: string;
  body?: string;
  loading: boolean;
  error: string | null;
  onContinue: () => void;
}

export function DiagnosticIntro({ title, body, loading, error, onContinue }: DiagnosticIntroProps) {
  return (
    <div style={{ padding: '20px 24px 32px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--dark-bg-canvas)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
        <KaiMark size={72} tone="white" />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--dark-text-heading)' }}>{title || 'Quick Check-In'}</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.55, maxWidth: 300 }}>
            {body || "I'm going to ask you a few short questions across your subjects. Not a test — just so I know where to begin."}
          </div>
        </div>
        {error && <div style={{ fontSize: 13, color: 'var(--dark-danger)' }}>{error}</div>}
      </div>
      <Button variant="darkAccent" size="lg" fullWidth disabled={loading} onClick={onContinue}>
        {loading ? 'Preparing your questions…' : "Let's go"}
      </Button>
    </div>
  );
}
