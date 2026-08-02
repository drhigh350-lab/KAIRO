import { Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { ExamQuestion } from './CbtExam';

export interface CbtReviewProps {
  answers: Record<number, number>;
  questions: ExamQuestion[];
  onBack?: () => void;
}

export function CbtReview({ answers, questions, onBack }: CbtReviewProps) {
  const incorrect = questions.map((q, i) => ({ ...q, i })).filter((q) => answers[q.i] !== q.correct);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title="Incorrect Questions" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {incorrect.length === 0 && <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>No incorrect answers — well done.</div>}
        {incorrect.map((q) => (
          <Card key={q.i}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--kairo-blue-700)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{q.subject} · Q{q.i + 1}</div>
            <div style={{ fontSize: 14, color: 'var(--text-body)', marginTop: 8, lineHeight: 1.5 }}>{q.stem}</div>
            <div style={{ fontSize: 12, color: 'var(--state-danger)', marginTop: 10 }}>Your answer: {answers[q.i] !== undefined ? q.options[answers[q.i]] : 'Not answered'}</div>
            <div style={{ fontSize: 12, color: 'var(--state-success)', marginTop: 4 }}>Correct answer: {q.options[q.correct]}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
