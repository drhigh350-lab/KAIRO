import { useEffect, useMemo, useState } from 'react';
import { Button, IconButton } from '../../components';
import { CalcIcon, CloseIcon, FlagIcon, InlineToast, MiniCalculator, Modal } from '../learning/shared';
import { cbtQuestions, cbtSubjects, type CbtQuestion } from './data';

export interface ExamQuestion extends CbtQuestion {
  subject: string;
}

export function buildExamQuestions(): ExamQuestion[] {
  const all: ExamQuestion[] = [];
  cbtSubjects.forEach((subj) => {
    (cbtQuestions[subj] || []).forEach((q) => all.push({ ...q, subject: subj }));
  });
  return all;
}

export interface CbtExamProps {
  onSubmit: (answers: Record<number, number>, questions: ExamQuestion[]) => void;
  onExit?: () => void;
}

export function CbtExam({ onSubmit, onExit }: CbtExamProps) {
  const questions = useMemo(buildExamQuestions, []);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [showPalette, setShowPalette] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  const [warned, setWarned] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (secondsLeft === 300 && !warned) setWarned(true);
    if (secondsLeft === 0) { onSubmit(answers, questions); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  function selectOption(i: number) { setAnswers((a) => ({ ...a, [current]: i })); }
  function toggleFlag() { setFlagged((f) => ({ ...f, [current]: !f[current] })); }
  function jumpTo(i: number) { setCurrent(i); setShowPalette(false); }

  const mins = Math.floor(secondsLeft / 60), secs = secondsLeft % 60;
  const timeLow = secondsLeft <= 300;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', position: 'relative', background: 'var(--dark-bg-canvas)' }}>
      {warned && secondsLeft > 295 && <InlineToast tone="caution">5 minutes remaining — review flagged questions if you can.</InlineToast>}

      <div className="app-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 10px', background: 'var(--dark-bg-canvas)' }}>
        <IconButton dark onClick={onExit}><CloseIcon /></IconButton>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{q.subject}</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: timeLow ? 'var(--dark-danger)' : 'var(--dark-text-heading)' }}>{mins}:{secs.toString().padStart(2, '0')}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconButton dark onClick={() => setShowCalc(true)}><CalcIcon /></IconButton>
          <IconButton dark onClick={() => setShowPalette(true)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg></IconButton>
        </div>
      </div>

      <div style={{ padding: '4px 18px 18px', flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', fontWeight: 600 }}>Question {current + 1} of {questions.length}</div>
        <div style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--dark-text-body)', marginTop: 12, fontWeight: 500 }}>{q.stem}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {q.options.map((opt, i) => {
            const isSelected = answers[current] === i;
            return (
              <button key={i} onClick={() => selectOption(i)} style={{
                textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${isSelected ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: isSelected ? 'var(--dark-bg-elevated)' : 'var(--dark-bg-surface)',
                color: 'var(--dark-text-body)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${isSelected ? 'var(--dark-accent-blue)' : 'var(--dark-text-faint)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, background: isSelected ? 'var(--dark-accent-blue)' : 'transparent', color: isSelected ? '#fff' : 'var(--dark-text-muted)' }}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="app-footer-bar" style={{ padding: '10px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--dark-bg-canvas)' }}>
        <button type="button" onClick={toggleFlag} aria-pressed={!!flagged[current]} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 600,
          color: flagged[current] ? 'var(--kairo-gold-500)' : 'var(--dark-text-muted)', cursor: 'pointer',
          background: 'none', border: 'none', minHeight: 'var(--touch-min)', fontFamily: 'inherit', width: '100%',
        }}>
          <FlagIcon filled={!!flagged[current]} /> {flagged[current] ? 'Flagged for review' : 'Flag this question'}
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Button variant="secondary" size="lg" fullWidth disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>Previous</Button>
          </div>
          <div style={{ flex: 1 }}>
            {current + 1 === questions.length ? (
              <Button variant="darkAccent" size="lg" fullWidth onClick={() => setShowConfirm(true)}>Submit</Button>
            ) : (
              <Button variant="darkAccent" size="lg" fullWidth onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>Next</Button>
            )}
          </div>
        </div>
      </div>

      {showPalette && (
        <Modal onClose={() => setShowPalette(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--dark-text-heading)', marginBottom: 4 }}>Question Palette</div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginBottom: 16 }}>{answeredCount} of {questions.length} answered</div>
          {cbtSubjects.map((subj) => (
            <div key={subj} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 8 }}>{subj}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {questions.map((qq, i) => {
                  if (qq.subject !== subj) return null;
                  const isAnswered = answers[i] !== undefined;
                  const isFlagged = flagged[i];
                  const isCurrent = i === current;
                  let bg = 'var(--dark-bg-surface)', color = 'var(--dark-text-body)', border = 'var(--dark-border)';
                  if (isAnswered) { bg = 'var(--dark-bg-elevated)'; color = 'var(--dark-accent-blue)'; border = 'var(--dark-accent-blue)'; }
                  if (isFlagged) { bg = 'rgba(240,177,42,0.14)'; color = 'var(--kairo-gold-500)'; border = 'var(--kairo-gold-500)'; }
                  if (isCurrent) { border = '#fff'; }
                  const statusLabel = isCurrent ? ', current question' : isFlagged ? ', flagged' : isAnswered ? ', answered' : ', unanswered';
                  return (
                    <button type="button" key={i} onClick={() => jumpTo(i)} aria-label={`Question ${i + 1}${statusLabel}`} style={{
                      aspectRatio: '1', minHeight: 'var(--touch-min)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${border}`, background: bg, color, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}>{i + 1}</button>
                  );
                })}
              </div>
            </div>
          ))}
          <Button variant="darkAccent" size="lg" fullWidth onClick={() => setShowConfirm(true)}>Submit Exam</Button>
        </Modal>
      )}

      {showCalc && (
        <Modal onClose={() => setShowCalc(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--dark-text-heading)', marginBottom: 14 }}>Calculator</div>
          <MiniCalculator tone="dark" />
        </Modal>
      )}

      {showConfirm && (
        <Modal onClose={() => setShowConfirm(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--dark-text-heading)' }}>Submit exam?</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.5 }}>
            You've answered {answeredCount} of {questions.length} questions. Once submitted, you can't make changes.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <div style={{ flex: 1 }}>
              <Button variant="secondary" size="lg" fullWidth onClick={() => setShowConfirm(false)}>Keep Reviewing</Button>
            </div>
            <div style={{ flex: 1 }}>
              <Button variant="darkAccent" size="lg" fullWidth onClick={() => onSubmit(answers, questions)}>Submit</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
