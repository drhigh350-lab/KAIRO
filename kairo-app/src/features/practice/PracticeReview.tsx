import { Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { PracticeResult } from './PracticeSummary';

export interface PracticeReviewProps {
  results: PracticeResult[];
  onBack?: () => void;
}

/** Real per-question review with corrections and explanations — every answered question from the just-finished session, not just the missed ones, since the point here is understanding, not exam simulation. Full option list shown, correct one in green and the student's wrong pick in red — same visual language as the live question screen. */
export function PracticeReview({ results, onBack }: PracticeReviewProps) {
  const reviewable = results.filter((r): r is PracticeResult & { review: NonNullable<PracticeResult['review']> } => !!r.review);

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {r.review.options.map((opt) => {
                const isCorrect = opt.label === r.review!.correctOption;
                const isStudentPick = opt.label === r.review!.selectedOption;
                let border = 'var(--dark-border)', bg = 'var(--dark-bg-surface)';
                if (isCorrect) { border = 'var(--dark-success)'; bg = 'var(--dark-success-bg)'; }
                else if (isStudentPick) { border = 'var(--dark-danger)'; bg = 'var(--dark-danger-bg)'; }
                return (
                  <div key={opt.label} style={{
                    display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${border}`, background: bg, fontSize: 14, color: 'var(--dark-text-body)',
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                      border: `1.5px solid ${isCorrect ? 'var(--dark-success)' : isStudentPick ? 'var(--dark-danger)' : 'var(--dark-text-faint)'}`,
                      background: isCorrect ? 'var(--dark-success)' : isStudentPick ? 'var(--dark-danger)' : 'transparent',
                      color: (isCorrect || isStudentPick) ? '#fff' : 'var(--dark-text-muted)',
                    }}>{isCorrect ? '✓' : isStudentPick ? '✕' : opt.label}</span>
                    {opt.text}
                  </div>
                );
              })}
              {!r.review.selectedOption && <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', fontStyle: 'italic' }}>Not answered</div>}
            </div>
            {r.review.explanation && <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 12, lineHeight: 1.5, paddingTop: 10, borderTop: '1px solid var(--dark-border)' }}>{r.review.explanation}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}
