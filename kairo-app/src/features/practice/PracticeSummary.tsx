import { Card, Button } from '../../components';
import { StatTile, ChevronRight } from '../learning/shared';

export interface PracticeResult {
  correct: boolean;
  confidence?: string | null;
  /** Real elapsed seconds on this question — always measured, never estimated. */
  time?: number;
  subject?: string;
  topic?: string;
  /** Full question + answers, for real review-with-corrections after the session ends. */
  review?: {
    questionText: string;
    options: { label: string; text: string }[];
    correctOption: string;
    selectedOption: string | null;
    explanation?: string | null;
  };
}

export type PracticeSummaryAction = 'weak' | 'topic' | 'challenge' | 'cbt' | 'review';

export interface PracticeSummaryProps {
  results: PracticeResult[];
  onHome: () => void;
  onAction?: (action: PracticeSummaryAction) => void;
  /** 'suggested' = the daily recommendation session; anything else counts as standard practice for the gained-score rate below. */
  entryFlow?: string;
}

/** Points shown on the summary for this session alone — deliberately not the adaptive Kairo Score (a slow-changing 0-100 curve, wrong shape for "what did I just earn"). The recommendation session pays more, rewarding showing up for what Kairo actually suggested. */
const POINTS_PER_CORRECT_SUGGESTED = 10;
const POINTS_PER_CORRECT_STANDARD = 2;

type SummaryTier = 'low' | 'mid' | 'high';

function tierFor(accuracy: number): SummaryTier {
  if (accuracy < 50) return 'low';
  if (accuracy < 80) return 'mid';
  return 'high';
}

export function PracticeSummary({ results, onHome, onAction, entryFlow }: PracticeSummaryProps) {
  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const totalTime = results.reduce((s, r) => s + (r.time || 0), 0);
  const avgTime = total ? Math.round(totalTime / total) : 0;
  const gainedScore = correctCount * (entryFlow === 'suggested' ? POINTS_PER_CORRECT_SUGGESTED : POINTS_PER_CORRECT_STANDARD);

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

  // Dynamic, at most 2 choices — a real routing decision by how the
  // session actually went, not a static 5-item menu leaving the choice
  // (and the cognitive load of picking) to the student. "Retry Incorrect
  // Questions" is dropped from this list entirely: in-session remediation
  // (PracticeFlow) already resurfaces missed questions once, automatically,
  // before this screen ever renders.
  const tier = tierFor(accuracy);
  const weakDetail = topicNeedingAttention ? `A focused pass on ${topicNeedingAttention}.` : 'Zero in on what needs the most work.';
  const TIER_ACTIONS: Record<SummaryTier, { key: PracticeSummaryAction; label: string; detail: string }[]> = {
    low: [
      { key: 'review', label: 'Review Explanations', detail: 'Re-read every explanation from this session.' },
      { key: 'weak', label: 'Boost Weak Areas', detail: weakDetail },
    ],
    mid: [
      { key: 'weak', label: 'Boost Weak Areas', detail: weakDetail },
      { key: 'topic', label: 'Continue Topic Practice', detail: 'Keep building on what you just covered.' },
    ],
    high: [
      { key: 'challenge', label: 'Challenge Yourself', detail: 'Move up to Hard difficulty.' },
      { key: 'cbt', label: 'Take a CBT Simulation', detail: 'Practise under real exam conditions.' },
    ],
  };
  const [primary, secondary] = TIER_ACTIONS[tier];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <div style={{ padding: '36px 20px 20px', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--dark-bg-elevated)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M4 12l5 5L20 6" /></svg>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--dark-text-heading)', marginTop: 14 }}>Practice Complete</div>
        <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>{total} questions · {formatTime(totalTime)}</div>
        {gainedScore > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'rgba(46,124,246,0.15)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, color: 'var(--dark-accent-blue)' }}>+{gainedScore}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark-text-muted)' }}>points this session</span>
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ display: 'flex' }}>
            <StatTile dark label="Correct Answers" value={correctCount} />
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

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em' }}>SUGGESTED NEXT</div>

        <button type="button" onClick={() => onAction && onAction(primary.key)} style={{
          textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff',
          boxShadow: '0 8px 30px var(--dark-accent-blue-glow)', padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{primary.label}</div>
            <div style={{ fontSize: 13, marginTop: 4, color: 'rgba(255,255,255,0.85)' }}>{primary.detail}</div>
          </div>
          <ChevronRight />
        </button>

        <button type="button" onClick={() => onAction && onAction(secondary.key)} style={{
          textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 'var(--radius-lg)',
          background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', color: 'var(--dark-text-heading)',
          padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{secondary.label}</div>
            <div style={{ fontSize: 12, marginTop: 2, color: 'var(--dark-text-muted)' }}>{secondary.detail}</div>
          </div>
          <span style={{ color: 'var(--dark-text-faint)' }}><ChevronRight /></span>
        </button>
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
