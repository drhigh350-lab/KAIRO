import { Button } from '../../components';

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
        <img src="/assets/illustration-kai-goat.jpg" alt="Kai" style={{ width: 140, borderRadius: 16 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--dark-text-heading)' }}>{title || 'Quick Check-In'}</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.55, maxWidth: 300 }}>
            {body || "Let's find out exactly what you already know — and what needs work. A few quick questions, no wrong answers."}
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
