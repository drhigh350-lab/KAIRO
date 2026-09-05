import { Card } from '../../components';
import { ScreenHeader, QuestionDiagram } from '../learning/shared';
import type { CbtPaperQuestion, CbtQuestionResult } from '../../lib/kairoEngine';

export interface CbtReviewProps {
  paper: CbtPaperQuestion[];
  questionResults: CbtQuestionResult[];
  onBack?: () => void;
}

/** Full question + every option, correct one in green and the student's wrong pick in red — same visual language as the live exam, not just a text summary. */
export function CbtReview({ paper, questionResults, onBack }: CbtReviewProps) {
  const reviewResults = questionResults;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Question Review" tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', lineHeight: 1.45 }}>
          Review every question from this exam. Correct answers are marked in green; missed or unanswered questions are marked in red.
        </div>
        {reviewResults.length === 0 && <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 40 }}>No question-level review is available for this exam.</div>}
        {reviewResults.map((r) => {
          const q = paper[r.globalIndex];
          const options = q?.options || r.options || [];
          return (
            <Card key={r.globalIndex} style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: r.isCorrect ? 'var(--dark-success)' : 'var(--dark-danger)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{r.subject} · Q{r.globalIndex + 1} · {r.isCorrect ? 'Correct' : r.studentAnswer ? 'Needs review' : 'Not answered'}</div>
              <div style={{ fontSize: 14, color: 'var(--dark-text-body)', marginTop: 8, lineHeight: 1.5 }}>{q?.text || r.text || 'Question text unavailable'}</div>
              <QuestionDiagram imageUrl={q?.imageUrl || r.imageUrl} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                {options.map((opt) => {
                  const isCorrect = opt.label === r.correctOption;
                  const isStudentPick = opt.label === r.studentAnswer;
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
                {!r.studentAnswer && <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', fontStyle: 'italic' }}>Not answered</div>}
              </div>
              {r.explanation && (
                <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 12, lineHeight: 1.5, paddingTop: 10, borderTop: '1px solid var(--dark-border)' }}>{r.explanation}</div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
