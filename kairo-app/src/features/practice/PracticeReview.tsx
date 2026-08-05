import { Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { PracticeResult } from './PracticeSummary';

export interface PracticeReviewProps {
  results: PracticeResult[];
  onBack?: () => void;
}

/** Real per-question review with corrections and explanations — every answered question from the just-finished session, not just the missed ones, since the point here is understanding, not exam simulation. */
export function PracticeReview({ results, onBack }: PracticeReviewProps) {
  const reviewable = results.filter((r): r is PracticeResult & { review: NonNullable<PracticeResult['review']> } => !!r.review);

  function optionText(rv: NonNullable<PracticeResult['review']>, label: string | null): string {
    if (!label) return 'Not answered';
    return rv.options.find((o) => o.label === label)?.text ?? label;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Review Answers" tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {reviewable.length === 0 && (
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 40 }}>Nothing to review from this session.</div>
        )}
        {reviewable.map((r, i) => (
          <Card key={i} style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                {r.subject}{r.topic ? ` · ${r.topic}` : ''}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: r.correct ? 'var(--dark-success)' : 'var(--dark-danger)' }}>{r.correct ? 'Correct' : 'Incorrect'}</div>
            </div>
            <div style={{ fontSize: 14, color: 'var(--dark-text-body)', marginTop: 8, lineHeight: 1.5 }}>{r.review.questionText}</div>
            <div style={{ fontSize: 12, color: r.correct ? 'var(--dark-success)' : 'var(--dark-danger)', marginTop: 10 }}>Your answer: {optionText(r.review, r.review.selectedOption)}</div>
            {!r.correct && <div style={{ fontSize: 12, color: 'var(--dark-success)', marginTop: 4 }}>Correct answer: {optionText(r.review, r.review.correctOption)}</div>}
            {r.review.explanation && <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.5, paddingTop: 10, borderTop: '1px solid var(--dark-border)' }}>{r.review.explanation}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}
