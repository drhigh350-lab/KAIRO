import { Button, Card } from '../../components';
import { StatTile } from '../learning/shared';
import type { CbtQuestionResult } from '../../lib/kairoEngine';

export interface CbtResultsSubject {
  subject: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface CbtResults {
  totalQuestions: number;
  answered: number;
  correct: number;
  score: number;
  maxScore: number;
  percentage: number;
  bySubject: CbtResultsSubject[];
  timeAnalysis: { totalTimeMin: number; avgTimePerQuestionSec: number };
  kaiSummary: string;
  questionResults: CbtQuestionResult[];
}

export interface CbtSummaryProps {
  results: CbtResults;
  onHome?: () => void;
  onReview?: () => void;
}

export function CbtSummary({ results, onHome, onReview }: CbtSummaryProps) {
  const strongest = results.bySubject.slice().sort((a, b) => b.percentage - a.percentage)[0];
  const weakest = results.bySubject.slice().sort((a, b) => a.percentage - b.percentage)[0];

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
            <StatTile dark label="Answered" value={`${results.answered}/${results.totalQuestions}`} />
            <StatTile dark label="Accuracy" value={`${results.percentage}%`} />
            <StatTile dark label="Avg / question" value={`${results.timeAnalysis.avgTimePerQuestionSec}s`} />
          </div>
        </Card>

        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 12 }}>BY SUBJECT</div>
          {results.bySubject.map((s) => (
            <div key={s.subject} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 13, color: 'var(--dark-text-body)' }}>{s.subject}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.percentage >= 60 ? 'var(--dark-success)' : 'var(--dark-danger)' }}>{s.percentage}%</span>
            </div>
          ))}
        </Card>

        <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '.04em' }}>SCORE</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, marginTop: 4 }}>{results.score} / {results.maxScore}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>Strongest: {strongest ? strongest.subject : '—'} · Weakest: {weakest ? weakest.subject : '—'}</div>
        </Card>

        <Card style={{ background: 'var(--dark-bg-elevated)', boxShadow: 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 6 }}>FROM KAI</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.5 }}>{results.kaiSummary}</div>
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
