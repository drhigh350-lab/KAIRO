import { Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { CbtPaperQuestion, CbtQuestionResult } from '../../lib/kairoEngine';

export interface CbtReviewProps {
  paper: CbtPaperQuestion[];
  questionResults: CbtQuestionResult[];
  onBack?: () => void;
}

/** Full question + every option, correct one in green and the student's wrong pick in red — same visual language as the live exam, not just a text summary. */
export function CbtReview({ paper, questionResults, onBack }: CbtReviewProps) {
  const incorrect = questionResults.filter((r) => !r.isCorrect);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Incorrect Questions" tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {incorrect.length === 0 && <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 40 }}>No incorrect answers — well done.</div>}
        {incorrect.map((r) => {
          const q = paper[r.globalIndex];
          return (
            <Card key={r.globalIndex} style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{r.subject} · Q{r.globalIndex + 1}</div>
              <div style={{ fontSize: 14, color: 'var(--dark-text-body)', marginTop: 8, lineHeight: 1.5 }}>{q?.text}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                {q?.options.map((opt) => {
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}
