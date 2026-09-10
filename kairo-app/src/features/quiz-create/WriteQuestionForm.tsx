import { useState } from 'react';
import { Input } from '../../components';
import { validateCommunityQuestion, createCommunityQuestion, type QuestionOptionInput, type QuestionRef } from '../../lib/quizApi';

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export function WriteQuestionForm({
  defaultSubject, onCreated,
}: {
  defaultSubject: string;
  onCreated: (ref: QuestionRef) => void;
}) {
  const [stem, setStem] = useState('');
  const [options, setOptions] = useState<QuestionOptionInput[]>([
    { label: 'A', text: '', isCorrect: true },
    { label: 'B', text: '', isCorrect: false },
    { label: 'C', text: '', isCorrect: false },
    { label: 'D', text: '', isCorrect: false },
  ]);
  const [explanation, setExplanation] = useState('');
  const [distractorTexts, setDistractorTexts] = useState<Record<string, string>>({});
  const [hint, setHint] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('medium');
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function updateOptionText(i: number, text: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, text } : o)));
  }
  function setCorrect(i: number) {
    setOptions((prev) => prev.map((o, idx) => ({ ...o, isCorrect: idx === i })));
  }
  function addOption() {
    if (options.length >= 5) return;
    const nextLabel = String.fromCharCode(65 + options.length);
    setOptions((prev) => [...prev, { label: nextLabel, text: '', isCorrect: false }]);
  }
  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i).map((o, idx) => ({ ...o, label: String.fromCharCode(65 + idx) })));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const validationErrors = await validateCommunityQuestion({
      stem, options, explanation, distractorExplanations: distractorTexts, hint, subject: defaultSubject, difficulty,
    });
    setErrors(validationErrors);
    if (validationErrors.length > 0) {
      setSubmitting(false);
      return;
    }
    const created = await createCommunityQuestion({
      subject: defaultSubject, topic, stem, options, explanation, distractorExplanations: distractorTexts, hint, difficulty,
    });
    setSubmitting(false);
    onCreated({ source: 'community', id: created.id, stem: created.stem });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Question</div>
        <textarea
          value={stem} onChange={(e) => setStem(e.target.value)} rows={3}
          placeholder="What happens when..."
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--dark-border)',
            background: 'var(--dark-bg-surface)', color: 'var(--dark-text-heading)', fontSize: 15, fontFamily: 'inherit',
            boxSizing: 'border-box', resize: 'vertical',
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>
          Options — tap the circle to mark the correct one
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map((opt, i) => (
            <div key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setCorrect(i)}
                style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  background: opt.isCorrect ? '#4E9E7B' : 'var(--dark-bg-elevated)',
                  color: opt.isCorrect ? '#fff' : 'var(--dark-text-muted)',
                }}
              >{opt.label}</button>
              <input
                value={opt.text} onChange={(e) => updateOptionText(i, e.target.value)}
                placeholder={`Option ${opt.label}`}
                style={{
                  flex: 1, height: 42, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--dark-border)',
                  background: 'var(--dark-bg-surface)', color: 'var(--dark-text-heading)', fontSize: 14, fontFamily: 'inherit',
                }}
              />
              {options.length > 2 && (
                <button onClick={() => removeOption(i)} style={{ background: 'none', border: 'none', color: 'var(--dark-text-faint)', fontSize: 20, cursor: 'pointer', padding: '0 4px' }}>×</button>
              )}
            </div>
          ))}
          {options.length < 5 && (
            <button onClick={addOption} style={{ background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: '4px 0' }}>
              + Add option (up to 5)
            </button>
          )}
        </div>
      </div>

      <Input tone="dark" label="Explanation" value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Why is the correct answer right?" />

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Why each wrong option is wrong</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.filter((o) => !o.isCorrect).map((o) => (
            <input
              key={o.label}
              value={distractorTexts[o.label] ?? ''}
              onChange={(e) => setDistractorTexts((prev) => ({ ...prev, [o.label]: e.target.value }))}
              placeholder={`Why ${o.label} is wrong`}
              style={{
                height: 42, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--dark-border)',
                background: 'var(--dark-bg-surface)', color: 'var(--dark-text-heading)', fontSize: 14, fontFamily: 'inherit',
              }}
            />
          ))}
        </div>
      </div>

      <Input tone="dark" label="Hint" value={hint} onChange={(e) => setHint(e.target.value)} />
      <Input tone="dark" label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Difficulty</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DIFFICULTIES.map((d) => (
            <button
              key={d} onClick={() => setDifficulty(d)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                border: `1.5px solid ${difficulty === d ? 'var(--arena-gold)' : 'var(--dark-border)'}`,
                background: difficulty === d ? 'rgba(201,162,39,0.15)' : 'var(--dark-bg-surface)',
                color: difficulty === d ? 'var(--arena-gold)' : 'var(--dark-text-muted)',
              }}
            >{d}</button>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div style={{ padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--dark-danger)', background: 'rgba(180,80,80,0.08)' }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--dark-danger)' }}>❌ {e.message}</div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !stem.trim()}
        style={{
          height: 'var(--touch-min)', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
          background: 'var(--arena-gold)', color: '#1a1200', opacity: submitting || !stem.trim() ? 0.5 : 1,
        }}
      >
        {submitting ? 'Checking…' : 'Add Question'}
      </button>
    </div>
  );
}
