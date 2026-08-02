import { Card, Button } from '../../components';
import { StatTile, ChevronRight } from '../learning/shared';

export interface PracticeResult {
  correct: boolean;
  confidence?: string | null;
  time?: number;
}

export type PracticeSummaryAction = 'weak' | 'retry' | 'challenge' | 'cbt' | 'review';

export interface PracticeSummaryProps {
  results: PracticeResult[];
  onHome: () => void;
  onAction?: (action: PracticeSummaryAction) => void;
}

export function PracticeSummary({ results, onHome, onAction }: PracticeSummaryProps) {
  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const incorrectCount = total - correctCount;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const totalTime = results.reduce((s, r) => s + (r.time || 45), 0);
  const avgTime = total ? Math.round(totalTime / total) : 0;

  const recommendations: { key: PracticeSummaryAction; label: string; detail: string; disabled?: boolean }[] = [
    { key: 'weak', label: 'Continue Weak Areas', detail: "A focused pass on Newton's Laws." },
    { key: 'retry', label: 'Retry Incorrect Questions', detail: incorrectCount ? `${incorrectCount} question${incorrectCount === 1 ? '' : 's'} to revisit.` : 'Nothing to retry — clean sweep.', disabled: !incorrectCount },
    { key: 'challenge', label: 'Challenge Yourself', detail: 'Move up to Hard difficulty.' },
    { key: 'cbt', label: 'Take a CBT Simulation', detail: 'Practise under real exam conditions.' },
    { key: 'review', label: 'Review Explanations', detail: 'Re-read every explanation from this session.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '36px 20px 20px', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--kairo-blue-100)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-navy-900)" strokeWidth="2"><path d="M4 12l5 5L20 6" /></svg>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)', marginTop: 14 }}>Practice Complete</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{total} questions · {formatTime(totalTime)}</div>
      </div>

      <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex' }}>
            <StatTile label="Answered" value={total} />
            <StatTile label="Accuracy" value={`${accuracy}%`} />
            <StatTile label="Avg / question" value={`${avgTime}s`} />
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em', marginBottom: 12 }}>PERFORMANCE INSIGHTS</div>
          <InsightRow label="Strongest subject" value="Mathematics" tone="success" />
          <InsightRow label="Weakest subject" value="Physics" tone="danger" />
          <InsightRow label="Topic needing attention" value="Newton's Laws" tone="caution" />
        </Card>

        <Card style={{ background: 'var(--kairo-navy-900)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--kairo-blue-300)', fontWeight: 700, letterSpacing: '.04em' }}>KAIRO SCORE</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, marginTop: 4 }}>+{Math.max(4, correctCount * 3)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--kairo-blue-300)', fontWeight: 700, letterSpacing: '.04em' }}>STREAK</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, marginTop: 4 }}>4 days</div>
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em', marginBottom: 6 }}>SUGGESTED NEXT</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recommendations.map((r) => (
              <button key={r.key} type="button" disabled={r.disabled} onClick={() => onAction && onAction(r.key)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 2px', minHeight: 'var(--touch-min)',
                cursor: r.disabled ? 'default' : 'pointer', width: '100%', textAlign: 'left', background: 'none', fontFamily: 'inherit',
                opacity: r.disabled ? 0.45 : 1, border: 'none', borderTop: '1px solid var(--color-border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{r.detail}</div>
                </div>
                {!r.disabled && <ChevronRight />}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <Button variant="primary" size="lg" fullWidth onClick={onHome}>Back to Home</Button>
      </div>
    </div>
  );
}

export interface InsightRowProps {
  label: string;
  value: string;
  tone?: 'success' | 'danger' | 'caution';
}

export function InsightRow({ label, value, tone }: InsightRowProps) {
  const color = tone === 'success' ? 'var(--state-success)' : tone === 'danger' ? 'var(--state-danger)' : 'var(--kairo-gold-600)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
