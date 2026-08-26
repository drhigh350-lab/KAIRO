import { useEffect, useRef, useState } from 'react';
import { Button, IconButton } from '../../components';
import { CalcIcon, CloseIcon, FlagIcon, InlineToast, MiniCalculator, Modal, QuestionDiagram } from '../learning/shared';
import { submitCbtAnswer, toggleCbtFlag, getCbtSubjectTimes, type CbtPaperQuestion } from '../../lib/kairoEngine';
import { saveSessionSnapshot } from '../../lib/sessionResume';

export interface CbtExamProps {
  paper: CbtPaperQuestion[];
  totalTimeMin: number;
  /** Absolute ms the attempt actually started — real start for a fresh exam, the original attempt's start when resumed (Batch 1). Drives secondsLeft directly so a resumed exam's countdown reflects real elapsed wall-clock time, not a re-armed full timer. */
  startTime: number;
  studentId: string | null | undefined;
  initialAnswers?: Record<number, string>;
  initialFlagged?: Record<number, boolean>;
  initialCurrent?: number;
  onSubmit: () => void;
  onExit?: () => void;
}

export function CbtExam({ paper, totalTimeMin, startTime, studentId, initialAnswers, initialFlagged, initialCurrent, onSubmit, onExit }: CbtExamProps) {
  const [current, setCurrent] = useState(initialCurrent ?? 0);
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers ?? {});
  const [flagged, setFlagged] = useState<Record<number, boolean>>(initialFlagged ?? {});
  const [showPalette, setShowPalette] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.round((startTime + totalTimeMin * 60_000 - Date.now()) / 1000)));
  const [warned, setWarned] = useState(false);
  const questionStartedAt = useRef(Date.now());

  const subjects = Array.from(new Set(paper.map((q) => q.subject)));

  // Anti-Refresh Wipeout (Batch 1): persist the exam's answers/flags/
  // position on every change (including the very first render, before any
  // answer — a refresh mid-exam must never lose the attempt). Cleared only
  // on successful submission, by the caller (CbtFlow's handleSubmit).
  useEffect(() => {
    if (!studentId) return;
    saveSessionSnapshot(studentId, {
      kind: 'cbt',
      subjects,
      totalTimeMin,
      startTime,
      paper,
      answers,
      flaggedIndices: Object.keys(flagged).filter((k) => flagged[Number(k)]).map(Number),
      subjectTimes: getCbtSubjectTimes(),
      current,
      savedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, flagged, current]);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (secondsLeft === 300 && !warned) setWarned(true);
    if (secondsLeft === 0) onSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const q = paper[current];
  const answeredCount = Object.keys(answers).length;

  function selectOption(label: string) {
    setAnswers((a) => ({ ...a, [current]: label }));
    submitCbtAnswer(current, label, Date.now() - questionStartedAt.current);
  }
  function toggleFlag() {
    const nowFlagged = toggleCbtFlag(current);
    setFlagged((f) => ({ ...f, [current]: nowFlagged }));
  }
  function jumpTo(i: number) {
    setCurrent(i);
    questionStartedAt.current = Date.now();
    setShowPalette(false);
  }
  function goTo(i: number) {
    setCurrent(i);
    questionStartedAt.current = Date.now();
  }
  /** Real JAMB CBT lets a candidate jump straight to any subject, not just step through questions sequentially — landing on the first unanswered question there, or the first question if the whole subject is done. */
  function jumpToSubject(subj: string) {
    const firstUnanswered = paper.findIndex((qq, i) => qq.subject === subj && answers[i] === undefined);
    const firstOfSubject = paper.findIndex((qq) => qq.subject === subj);
    goTo(firstUnanswered !== -1 ? firstUnanswered : firstOfSubject);
  }

  const mins = Math.floor(secondsLeft / 60), secs = secondsLeft % 60;
  const timeLow = secondsLeft <= 300;

  if (!q) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', position: 'relative', background: 'var(--dark-bg-canvas)' }}>
      {warned && secondsLeft > 295 && <InlineToast tone="caution">5 minutes remaining — review flagged questions if you can.</InlineToast>}

      <div className="app-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 10px', background: 'var(--dark-bg-canvas)' }}>
        <IconButton dark onClick={() => setShowExitConfirm(true)}><CloseIcon /></IconButton>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{q.subject}</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: timeLow ? 'var(--dark-danger)' : 'var(--dark-text-heading)' }}>{mins}:{secs.toString().padStart(2, '0')}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconButton dark onClick={() => setShowCalc(true)}><CalcIcon /></IconButton>
          <IconButton dark onClick={() => setShowPalette(true)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg></IconButton>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '0 18px 10px', overflowX: 'auto' }}>
        {subjects.map((subj) => {
          const isActive = subj === q.subject;
          const subjTotal = paper.filter((qq) => qq.subject === subj).length;
          const subjAnswered = paper.filter((qq, i) => qq.subject === subj && answers[i] !== undefined).length;
          return (
            <button type="button" key={subj} onClick={() => jumpToSubject(subj)} style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 'var(--radius-pill)', minHeight: 'var(--touch-min)', fontFamily: 'inherit',
              border: `1.5px solid ${isActive ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`,
              background: isActive ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)',
              color: isActive ? '#fff' : 'var(--dark-text-body)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>{subj} <span style={{ opacity: 0.75 }}>{subjAnswered}/{subjTotal}</span></button>
          );
        })}
      </div>

      <div style={{ padding: '4px 18px 18px', flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', fontWeight: 600 }}>Question {current + 1} of {paper.length}</div>
        <div style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--dark-text-body)', marginTop: 12, fontWeight: 500 }}>{q.text}</div>
        <QuestionDiagram imageUrl={q.imageUrl} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {q.options.map((opt) => {
            const isSelected = answers[current] === opt.label;
            return (
              <button key={opt.label} onClick={() => selectOption(opt.label)} style={{
                textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${isSelected ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: isSelected ? 'var(--dark-bg-elevated)' : 'var(--dark-bg-surface)',
                color: 'var(--dark-text-body)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${isSelected ? 'var(--dark-accent-blue)' : 'var(--dark-text-faint)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, background: isSelected ? 'var(--dark-accent-blue)' : 'transparent', color: isSelected ? '#fff' : 'var(--dark-text-muted)' }}>{opt.label}</span>
                {opt.text}
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
            <Button variant="secondary" size="lg" fullWidth disabled={current === 0} onClick={() => goTo(Math.max(0, current - 1))}>Previous</Button>
          </div>
          <div style={{ flex: 1 }}>
            {current + 1 === paper.length ? (
              <Button variant="darkAccent" size="lg" fullWidth onClick={() => setShowConfirm(true)}>Submit</Button>
            ) : (
              <Button variant="darkAccent" size="lg" fullWidth onClick={() => goTo(Math.min(paper.length - 1, current + 1))}>Next</Button>
            )}
          </div>
        </div>
      </div>

      {showPalette && (
        <Modal onClose={() => setShowPalette(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--dark-text-heading)', marginBottom: 4 }}>Question Palette</div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginBottom: 16 }}>{answeredCount} of {paper.length} answered</div>
          {subjects.map((subj) => (
            <div key={subj} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 8 }}>{subj}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {paper.map((qq, i) => {
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

      {showExitConfirm && (
        <Modal onClose={() => setShowExitConfirm(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Leave session?</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.5, marginBottom: 20 }}>Your progress in this session won't be recorded if you leave now.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="darkAccent" size="lg" fullWidth onClick={() => setShowExitConfirm(false)}>Resume Practice</Button>
            <Button variant="danger" size="lg" fullWidth onClick={onExit}>Quit Session</Button>
          </div>
        </Modal>
      )}

      {showConfirm && (
        <Modal onClose={() => setShowConfirm(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--dark-text-heading)' }}>Submit exam?</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.5 }}>
            You've answered {answeredCount} of {paper.length} questions. Once submitted, you can't make changes.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <div style={{ flex: 1 }}>
              <Button variant="secondary" size="lg" fullWidth onClick={() => setShowConfirm(false)}>Keep Reviewing</Button>
            </div>
            <div style={{ flex: 1 }}>
              <Button variant="darkAccent" size="lg" fullWidth onClick={onSubmit}>Submit</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
