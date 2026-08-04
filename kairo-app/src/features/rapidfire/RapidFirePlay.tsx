import { useEffect, useRef, useState } from 'react';
import { IconButton } from '../../components';
import { CloseIcon } from '../learning/shared';
import { submitRapidFireAnswer, type RapidFireQueuedQuestion } from '../../lib/kairoEngine';

export interface RapidFirePlayProps {
  questions: RapidFireQueuedQuestion[];
  timePerQuestionSec: number;
  onFinish: () => void;
  onExit: () => void;
}

export function RapidFirePlay({ questions, timePerQuestionSec, onFinish, onExit }: RapidFirePlayProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(timePerQuestionSec);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const startedAt = useRef(Date.now());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const item = questions[index];
  const q = item?.question;

  useEffect(() => {
    setSecondsLeft(timePerQuestionSec);
    startedAt.current = Date.now();
    setSelected(null);
  }, [index, timePerQuestionSec]);

  useEffect(() => {
    if (selected !== null) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [selected, index]);

  useEffect(() => {
    if (secondsLeft === 0 && selected === null) grade(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  function grade(optionLabel: string | null) {
    if (!item || selected !== null) return;
    setSelected(optionLabel ?? '__timeout__');
    const correct = optionLabel !== null && optionLabel === item.question.correctOption;
    const result = submitRapidFireAnswer({
      conceptId: item.conceptId,
      correct,
      responseTimeMs: Date.now() - startedAt.current,
      selectedOption: optionLabel ?? undefined,
      correctOption: item.question.correctOption,
      questionId: item.question.id,
    });
    setStreak(result.streak);
    setBestStreak(result.bestStreak);
    advanceTimer.current = setTimeout(() => {
      if (result.finished) onFinish();
      else setIndex((i) => i + 1);
    }, 600);
  }

  if (!item) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <div className="app-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 10px', background: 'var(--dark-bg-canvas)' }}>
        <IconButton dark onClick={onExit}><CloseIcon /></IconButton>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{index + 1} / {questions.length}</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: secondsLeft <= 5 ? 'var(--dark-danger)' : 'var(--dark-text-heading)' }}>{secondsLeft}s</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--kairo-gold-500)' }}>
          🔥 {streak}
        </div>
      </div>

      <div style={{ padding: '4px 18px 18px', flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', textTransform: 'uppercase' }}>{q.subject} · {q.topic}</div>
        <div style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--dark-text-body)', marginTop: 12, fontWeight: 500 }}>{q.text}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {q.options.map((opt: { label: string; text: string }) => {
            const isSelected = selected === opt.label;
            const isCorrectOption = opt.label === item.question.correctOption;
            const revealed = selected !== null;
            let border = 'var(--dark-border)', bg = 'var(--dark-bg-surface)';
            if (revealed && isCorrectOption) { border = 'var(--dark-success)'; bg = 'var(--dark-success-bg)'; }
            else if (revealed && isSelected) { border = 'var(--dark-danger)'; bg = 'var(--dark-danger-bg)'; }
            return (
              <button key={opt.label} disabled={revealed} onClick={() => grade(opt.label)} style={{
                textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${border}`, background: bg, color: 'var(--dark-text-body)', fontSize: 16,
                cursor: revealed ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 12, fontWeight: 700,
                  background: revealed && isCorrectOption ? 'var(--dark-success)' : revealed && isSelected ? 'var(--dark-danger)' : 'transparent',
                  color: revealed && (isCorrectOption || isSelected) ? '#fff' : 'var(--dark-text-muted)',
                }}>{opt.label}</span>
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 18px 20px', fontSize: 12, color: 'var(--dark-text-faint)', textAlign: 'center' }}>Best streak this round: {bestStreak}</div>
    </div>
  );
}
