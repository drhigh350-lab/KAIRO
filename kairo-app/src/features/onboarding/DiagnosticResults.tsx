import { Button } from '../../components';
import { KaiMark } from './shared';

export interface DiagnosticResultsProps {
  /** Real diagnosticSummary from OnboardingEngine._summarizeDiagnostic() — total/correct/accuracy/message are all measured, not estimated. */
  summary: { total: number; correct: number; accuracy: number; message: string };
  onContinue: () => void;
}

export function DiagnosticResults({ summary, onContinue }: DiagnosticResultsProps) {
  return (
    <div style={{ padding: '20px 24px 32px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--dark-bg-canvas)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
        <KaiMark size={72} check tone="white" />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--dark-text-heading)' }}>Here's what I noticed</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.55, maxWidth: 300 }}>{summary.message}</div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, color: 'var(--dark-text-heading)' }}>{summary.correct}/{summary.total}</div>
            <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>Correct</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 28, color: 'var(--dark-accent-blue)' }}>{summary.accuracy}%</div>
            <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>Accuracy</div>
          </div>
        </div>
      </div>
      <Button variant="darkAccent" size="lg" fullWidth onClick={onContinue}>Continue</Button>
    </div>
  );
}
