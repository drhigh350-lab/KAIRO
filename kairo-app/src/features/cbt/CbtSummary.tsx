import { Button, Card } from '../../components';
import { StatTile } from '../learning/shared';
import type { ExamQuestion } from './CbtExam';

export interface CbtSummaryProps {
  answers: Record<number, number>;
  questions: ExamQuestion[];
  onHome?: () => void;
  onReview?: () => void;
}

export function CbtSummary({ answers, questions, onHome, onReview }: CbtSummaryProps) {
  const total = questions.length;
  const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
  const bySubject: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    bySubject[q.subject] = bySubject[q.subject] || { correct: 0, total: 0 };
    bySubject[q.subject].total += 1;
    if (answers[i] === q.correct) bySubject[q.subject].correct += 1;
  });
  const subjectEntries = Object.entries(bySubject).map(([s, v]) => ({ subject: s, pct: Math.round((v.correct / v.total) * 100) }));
  const strongest = subjectEntries.slice().sort((a, b) => b.pct - a.pct)[0];
  const weakest = subjectEntries.slice().sort((a, b) => a.pct - b.pct)[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <div style={{ padding: '36px 20px 20px', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--dark-bg-elevated)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7z" /></svg>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--dark-text-heading)', marginTop: 14 }}>Exam Submitted</div>
        <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>Here's how your simulation went.</div>
      </div>

      <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ display: 'flex' }}>
            <StatTile dark label="Answered" value={`${Object.keys(answers).length}/${total}`} />
            <StatTile dark label="Accuracy" value={`${accuracy}%`} />
            <StatTile dark label="Avg / question" value="75s" />
          </div>
        </Card>

        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 12 }}>BY SUBJECT</div>
          {subjectEntries.map((s) => (
            <div key={s.subject} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 13, color: 'var(--dark-text-body)' }}>{s.subject}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.pct >= 60 ? 'var(--dark-success)' : 'var(--dark-danger)' }}>{s.pct}%</span>
            </div>
          ))}
        </Card>

        <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '.04em' }}>KAIRO SCORE</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, marginTop: 4 }}>+{Math.max(6, correctCount * 2)}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>Strongest: {strongest ? strongest.subject : '—'} · Weakest: {weakest ? weakest.subject : '—'}</div>
        </Card>

        <Card style={{ background: 'var(--dark-bg-elevated)', boxShadow: 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 6 }}>SUGGESTED NEXT</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.5 }}>Review your incorrect {weakest ? weakest.subject : ''} questions while they're fresh.</div>
          <div style={{ marginTop: 14 }}>
            <Button variant="secondary" size="md" fullWidth onClick={onReview}>Review Incorrect Questions</Button>
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <Button variant="darkAccent" size="lg" fullWidth onClick={onHome}>Back to Home</Button>
      </div>
    </div>
  );
}
