import { useEffect, useRef, useState } from 'react';
import { Button, IconButton, ProgressBar } from '../../components';
import { CloseIcon, Modal, QuestionDiagram } from '../learning/shared';
import type { Challenge, ChallengeQuestion } from './data';

export interface ChallengeAttemptProps {
  challenge: Challenge;
  questions: ChallengeQuestion[];
  onFinish: (answers: Record<number, number>, timeTakenMs: number) => void;
  onExit: () => void;
  initialAnswers?: Record<number, number>;
}

/**
 * No instant "Correct!" / "Wrong, it was B" feedback here — the correct
 * answer is genuinely not sent to the browser during play
 * (get_challenge_questions_safe strips it), so there is nothing to show.
 * A choice is picked, then locked in with "Next" — right/wrong only shows
 * up on the Results screen, once submit_arena_attempt has scored the
 * whole attempt server-side. This was an explicit trade-off, not an
 * oversight: it closes a real answer-leak that existed before.
 */
export function ChallengeAttempt({ challenge, questions, onFinish, onExit, initialAnswers = {} }: ChallengeAttemptProps) {
  const firstUnanswered = Object.keys(initialAnswers).map(Number).length ? Math.min(questions.length - 1, Math.max(...Object.keys(initialAnswers).map(Number)) + 1) : 0;
  const [index, setIndex] = useState(firstUnanswered);
  const [answers, setAnswers] = useState<Record<number, number>>(initialAnswers);
  const [selected, setSelected] = useState<number | null>(initialAnswers[firstUnanswered] ?? null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedAt = useRef(Date.now());

  const total = questions.length;
  const question = questions[index];

  useEffect(() => {
    const t = setInterval(() => setElapsedSec(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  function next() {
    if (selected === null) return;
    const newAnswers = { ...answers, [index]: selected };
    setAnswers(newAnswers);
    try { localStorage.setItem(`kairo.arena.answers.${challenge.id}`, JSON.stringify(newAnswers)); } catch { /* storage is optional */ }
    if (index + 1 >= total) {
      onFinish(newAnswers, Date.now() - startedAt.current);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  }

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (!question) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100dvh', fontFamily: 'var(--font-body)', position: 'relative', background: 'var(--arena-navy-deep)' }}>
      <div className="app-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 12px', background: 'var(--arena-navy-deep)', borderBottom: '1px solid rgba(152,176,196,.12)' }}>
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
            const border = isSelected ? 'var(--dark-accent-blue)' : 'var(--dark-border)';
            const bg = isSelected ? 'var(--dark-bg-elevated)' : 'var(--dark-bg-surface)';
            return (
              <button key={i} onClick={() => setSelected(i)} style={{
                textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${border}`,
                background: bg, color: 'var(--dark-text-body)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${isSelected ? border : 'var(--dark-text-faint)'}`,
                  background: isSelected ? 'var(--dark-accent-blue)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--dark-text-muted)',
                }}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="app-footer-bar" style={{ padding: '16px 20px 24px', background: 'var(--dark-bg-canvas)' }}>
        <Button variant="darkAccent" size="lg" fullWidth disabled={selected === null} onClick={next}>
          {index + 1 === total ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
