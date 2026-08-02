import { useEffect, useState } from 'react';
import { AnswerFeedback, Button, IconButton, ProgressBar } from '../../components';
import { CloseIcon, Modal } from '../learning/shared';
import type { Challenge } from './data';

export interface ChallengeAttemptProps {
  challenge: Challenge;
  onFinish: (answers: Record<number, number>) => void;
  onExit: () => void;
}

export function ChallengeAttempt({ challenge, onFinish, onExit }: ChallengeAttemptProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimitSec ?? 0);

  const total = challenge.questions.length;
  const question = challenge.questions[index];

  useEffect(() => {
    if (!challenge.timeLimitSec) return;
    if (timeLeft <= 0) {
      onFinish({ ...answers, [index]: selected ?? -1 });
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, challenge.timeLimitSec]);

  function submit() {
    if (selected === null) return;
    setSubmitted(true);
  }

  function next() {
    const newAnswers = { ...answers, [index]: selected ?? -1 };
    setAnswers(newAnswers);
    if (index + 1 >= total) {
      onFinish(newAnswers);
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

  const isCorrect = selected === question.correct;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 8px' }}>
        <IconButton onClick={() => setShowExitConfirm(true)}><CloseIcon /></IconButton>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Question {index + 1} of {total}</div>
        {challenge.timeLimitSec ? (
          <div style={{ fontSize: 13, fontWeight: 700, color: timeLeft <= 15 ? 'var(--state-danger)' : 'var(--text-heading)', minWidth: 40, textAlign: 'right' }}>{formatTime(timeLeft)}</div>
        ) : (
          <div style={{ minWidth: 40 }} />
        )}
      </div>

      {showExitConfirm && (
        <Modal onClose={() => setShowExitConfirm(false)}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--text-heading)', marginBottom: 8 }}>Leave this challenge?</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 18 }}>
            Leaving now means this attempt won't be scored or count toward the leaderboard. You can rejoin while it's still live.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}><Button variant="secondary" fullWidth onClick={() => setShowExitConfirm(false)}>Stay</Button></div>
            <div style={{ flex: 1 }}><Button variant="primary" fullWidth onClick={onExit}>Exit</Button></div>
          </div>
        </Modal>
      )}

      <div style={{ padding: '0 20px' }}><ProgressBar value={index + 1} max={total} /></div>

      <div style={{ padding: '22px 20px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em', textTransform: 'uppercase' }}>{challenge.theme}</div>
        <div style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--text-body)', marginTop: 16, fontWeight: 500 }}>{question.stem}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = submitted && i === question.correct;
            const showWrongPick = submitted && isSelected && i !== question.correct;
            let border = 'var(--color-border-subtle)', bg = '#fff';
            if (!submitted && isSelected) { border = 'var(--kairo-navy-900)'; bg = 'var(--kairo-blue-100)'; }
            if (showCorrect) { border = 'var(--state-success)'; bg = 'var(--state-success-bg)'; }
            if (showWrongPick) { border = 'var(--state-danger)'; bg = 'var(--state-danger-bg)'; }
            return (
              <button key={i} disabled={submitted} onClick={() => setSelected(i)} style={{
                textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${border}`,
                background: bg, color: 'var(--text-body)', fontSize: 15, cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit',
                display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${isSelected || showCorrect ? border : 'var(--kairo-ink-300)'}`,
                  background: (isSelected && !submitted) ? 'var(--kairo-navy-900)' : showCorrect ? 'var(--state-success)' : showWrongPick ? 'var(--state-danger)' : 'transparent',
                  color: ((isSelected && !submitted) || showCorrect || showWrongPick) ? '#fff' : 'var(--text-muted)',
                }}>{showCorrect ? '✓' : showWrongPick ? '✕' : String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div style={{ marginTop: 20 }}>
            <AnswerFeedback correct={isCorrect} title={isCorrect ? 'Correct' : `Correct answer: ${String.fromCharCode(65 + question.correct)}`} />
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px 24px' }}>
        {!submitted ? (
          <Button variant="primary" size="lg" fullWidth disabled={selected === null} onClick={submit}>Submit</Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={next}>{index + 1 === total ? 'See Results' : 'Next'}</Button>
        )}
      </div>
    </div>
  );
}
