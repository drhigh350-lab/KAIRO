import { useEffect, useRef, useState } from 'react';
import { AnswerFeedback, Button, IconButton, ProgressBar } from '../../components';
import { CloseIcon, Modal, QuestionDiagram } from '../learning/shared';
import type { Challenge, ChallengeQuestion } from './data';

export interface ChallengeAttemptProps {
  challenge: Challenge;
  questions: ChallengeQuestion[];
  onFinish: (answers: Record<number, number>, timeTakenMs: number) => void;
  onExit: () => void;
}

export function ChallengeAttempt({ challenge, questions, onFinish, onExit }: ChallengeAttemptProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedAt = useRef(Date.now());

  const total = questions.length;
  const question = questions[index];

  useEffect(() => {
    const t = setInterval(() => setElapsedSec(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  function submit() {
    if (selected === null) return;
    setSubmitted(true);
  }

  function next() {
    const newAnswers = { ...answers, [index]: selected ?? -1 };
    setAnswers(newAnswers);
    if (index + 1 >= total) {
      onFinish(newAnswers, Date.now() - startedAt.current);
    } else {
      setIndex(index + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (!question) return null;
  const isCorrect = selected === question.correct;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', position: 'relative', background: 'var(--dark-bg-canvas)' }}>
      <div className="app-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 8px', background: 'var(--dark-bg-canvas)' }}>
        <IconButton dark onClick={() => setShowExitConfirm(true)}><CloseIcon /></IconButton>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-muted)' }}>Question {index + 1} of {total}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-text-heading)', minWidth: 40, textAlign: 'right' }}>{formatTime(elapsedSec)}</div>
      </div>

      {showExitConfirm && (
        <Modal onClose={() => setShowExitConfirm(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Leave this challenge?</div>
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', lineHeight: 1.5, marginBottom: 18 }}>
            Leaving now means this attempt won't be scored or count toward the leaderboard. You can rejoin while it's still live.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}><Button variant="secondary" fullWidth onClick={() => setShowExitConfirm(false)}>Stay</Button></div>
            <div style={{ flex: 1 }}><Button variant="darkAccent" fullWidth onClick={onExit}>Exit</Button></div>
          </div>
        </Modal>
      )}

      <div style={{ padding: '0 20px' }}><ProgressBar value={index + 1} max={total} tone="dark" /></div>

      <div style={{ padding: '22px 20px', flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', textTransform: 'uppercase' }}>{challenge.theme}</div>
        <div style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--dark-text-body)', marginTop: 16, fontWeight: 500 }}>{question.stem}</div>
        <QuestionDiagram imageUrl={question.imageUrl} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = submitted && i === question.correct;
            const showWrongPick = submitted && isSelected && i !== question.correct;
            let border = 'var(--dark-border)', bg = 'var(--dark-bg-surface)';
            if (!submitted && isSelected) { border = 'var(--dark-accent-blue)'; bg = 'var(--dark-bg-elevated)'; }
            if (showCorrect) { border = 'var(--dark-success)'; bg = 'var(--dark-success-bg)'; }
            if (showWrongPick) { border = 'var(--dark-danger)'; bg = 'var(--dark-danger-bg)'; }
            return (
              <button key={i} disabled={submitted} onClick={() => setSelected(i)} style={{
                textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${border}`,
                background: bg, color: 'var(--dark-text-body)', fontSize: 16, cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit',
                display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${isSelected || showCorrect ? border : 'var(--dark-text-faint)'}`,
                  background: (isSelected && !submitted) ? 'var(--dark-accent-blue)' : showCorrect ? 'var(--dark-success)' : showWrongPick ? 'var(--dark-danger)' : 'transparent',
                  color: ((isSelected && !submitted) || showCorrect || showWrongPick) ? '#fff' : 'var(--dark-text-muted)',
                }}>{showCorrect ? '✓' : showWrongPick ? '✕' : String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div style={{ marginTop: 20 }}>
            <AnswerFeedback dark correct={isCorrect} title={isCorrect ? 'Correct' : `Correct answer: ${String.fromCharCode(65 + question.correct)}`} />
          </div>
        )}
      </div>

      <div className="app-footer-bar" style={{ padding: '16px 20px 24px', background: 'var(--dark-bg-canvas)' }}>
        {!submitted ? (
          <Button variant="darkAccent" size="lg" fullWidth disabled={selected === null} onClick={submit}>Submit</Button>
        ) : (
          <Button variant="darkAccent" size="lg" fullWidth onClick={next}>{index + 1 === total ? 'See Results' : 'Next'}</Button>
        )}
      </div>
    </div>
  );
}
