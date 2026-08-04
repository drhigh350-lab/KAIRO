import { Card, Button } from '../../components';
import { StatTile, ChevronRight } from '../learning/shared';

export interface PracticeResult {
  correct: boolean;
  confidence?: string | null;
  /** Real elapsed seconds on this question — always measured, never estimated. */
  time?: number;
  subject?: string;
  topic?: string;
}

export type PracticeSummaryAction = 'weak' | 'retry' | 'challenge' | 'cbt' | 'review';

export interface EngineSessionSummary {
  eliteScore?: { total: number };
  streak?: { momentum: number };
}

export interface PracticeSummaryProps {
  results: PracticeResult[];
  onHome: () => void;
  onAction?: (action: PracticeSummaryAction) => void;
  /** Real KairoEngine.endSession() result, when this session ran against the real engine. */
  engineSummary?: EngineSessionSummary | null;
}

export function PracticeSummary({ results, onHome, onAction, engineSummary }: PracticeSummaryProps) {
  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const incorrectCount = total - correctCount;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const totalTime = results.reduce((s, r) => s + (r.time || 0), 0);
  const avgTime = total ? Math.round(totalTime / total) : 0;

  // Real per-subject accuracy from what was actually answered this session —
  // a comparison only means something with 2+ distinct subjects present.
  const bySubject = new Map<string, { correct: number; total: number }>();
  for (const r of results) {
    if (!r.subject) continue;
    const s = bySubject.get(r.subject) || { correct: 0, total: 0 };
    s.total++;
    if (r.correct) s.correct++;
    bySubject.set(r.subject, s);
  }
  const subjectStats = [...bySubject.entries()].map(([subject, s]) => ({ subject, pct: Math.round((s.correct / s.total) * 100) }));
  const strongest = subjectStats.length > 1 ? subjectStats.reduce((a, b) => (b.pct > a.pct ? b : a)) : null;
  const weakest = subjectStats.length > 1 ? subjectStats.reduce((a, b) => (b.pct < a.pct ? b : a)) : null;

  // Real topic needing attention — the topic that came up most among this session's actual wrong answers.
  const missedTopics = new Map<string, number>();
  for (const r of results) {
    if (!r.correct && r.topic) missedTopics.set(r.topic, (missedTopics.get(r.topic) || 0) + 1);
  }
  const topicNeedingAttention = missedTopics.size
    ? [...missedTopics.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0]
    : null;

  const hasInsights = !!(strongest && weakest && strongest.subject !== weakest.subject) || !!topicNeedingAttention;

  const recommendations: { key: PracticeSummaryAction; label: string; detail: string; disabled?: boolean }[] = [
    {
      key: 'weak',
      label: 'Continue Weak Areas',
      detail: topicNeedingAttention ? `A focused pass on ${topicNeedingAttention}.` : 'Nothing missed yet to build this from — clean sweep.',
      // A perfect (or nothing-missed) session gives Kairo no fresh signal for
      // what's actually weak — offering this anyway routes into a session
      // that predictably comes back with "no questions found" and nowhere
      // useful to land, which reads as broken rather than honest.
      disabled: !incorrectCount,
    },
    { key: 'retry', label: 'Retry Incorrect Questions', detail: incorrectCount ? `${incorrectCount} question${incorrectCount === 1 ? '' : 's'} to revisit.` : 'Nothing to retry — clean sweep.', disabled: !incorrectCount },
    { key: 'challenge', label: 'Challenge Yourself', detail: 'Move up to Hard difficulty.' },
    { key: 'cbt', label: 'Take a CBT Simulation', detail: 'Practise under real exam conditions.' },
    { key: 'review', label: 'Review Explanations', detail: 'Re-read every explanation from this session.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <div style={{ padding: '36px 20px 20px', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--dark-bg-elevated)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M4 12l5 5L20 6" /></svg>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--dark-text-heading)', marginTop: 14 }}>Practice Complete</div>
        <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>{total} questions · {formatTime(totalTime)}</div>
      </div>

      <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ display: 'flex' }}>
            <StatTile dark label="Answered" value={total} />
            <StatTile dark label="Accuracy" value={`${accuracy}%`} />
            <StatTile dark label="Avg / question" value={`${avgTime}s`} />
          </div>
        </Card>

        {hasInsights && (
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 12 }}>PERFORMANCE INSIGHTS</div>
            {strongest && weakest && strongest.subject !== weakest.subject && (
              <>
                <InsightRow label="Strongest subject" value={`${strongest.subject} (${strongest.pct}%)`} tone="success" />
                <InsightRow label="Weakest subject" value={`${weakest.subject} (${weakest.pct}%)`} tone="danger" />
              </>
            )}
            {topicNeedingAttention && <InsightRow label="Topic needing attention" value={topicNeedingAttention} tone="caution" />}
          </Card>
        )}

        <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '.04em' }}>KAIRO SCORE</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, marginTop: 4 }}>
              {engineSummary?.eliteScore ? engineSummary.eliteScore.total : '—'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '.04em' }}>STREAK</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, marginTop: 4 }}>
              {engineSummary?.streak ? `${engineSummary.streak.momentum} days` : '—'}
            </div>
          </div>
        </Card>

        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 6 }}>SUGGESTED NEXT</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recommendations.map((r) => (
              <button key={r.key} type="button" disabled={r.disabled} onClick={() => onAction && onAction(r.key)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 2px', minHeight: 'var(--touch-min)',
                cursor: r.disabled ? 'default' : 'pointer', width: '100%', textAlign: 'left', background: 'none', fontFamily: 'inherit',
                opacity: r.disabled ? 0.45 : 1, border: 'none', borderTop: '1px solid var(--dark-border)', color: 'var(--dark-text-faint)',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>{r.detail}</div>
                </div>
                {!r.disabled && <ChevronRight />}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <Button variant="darkAccent" size="lg" fullWidth onClick={onHome}>Back to Home</Button>
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
  const color = tone === 'success' ? 'var(--dark-success)' : tone === 'danger' ? 'var(--dark-danger)' : 'var(--dark-caution)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--dark-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
