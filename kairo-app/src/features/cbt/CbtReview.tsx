import { Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { CbtPaperQuestion, CbtQuestionResult } from '../../lib/kairoEngine';

export interface CbtReviewProps {
  paper: CbtPaperQuestion[];
  questionResults: CbtQuestionResult[];
  onBack?: () => void;
}

export function CbtReview({ paper, questionResults, onBack }: CbtReviewProps) {
  const incorrect = questionResults.filter((r) => !r.isCorrect);

  function optionText(globalIndex: number, label: string | null): string {
    if (!label) return 'Not answered';
    const q = paper[globalIndex];
    return q?.options.find((o) => o.label === label)?.text ?? label;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Incorrect Questions" tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {incorrect.length === 0 && <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 40 }}>No incorrect answers — well done.</div>}
        {incorrect.map((r) => (
          <Card key={r.globalIndex} style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{r.subject} · Q{r.globalIndex + 1}</div>
            <div style={{ fontSize: 14, color: 'var(--dark-text-body)', marginTop: 8, lineHeight: 1.5 }}>{paper[r.globalIndex]?.text}</div>
            <div style={{ fontSize: 12, color: 'var(--dark-danger)', marginTop: 10 }}>Your answer: {optionText(r.globalIndex, r.studentAnswer)}</div>
            <div style={{ fontSize: 12, color: 'var(--dark-success)', marginTop: 4 }}>Correct answer: {optionText(r.globalIndex, r.correctOption)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
