import { useState } from 'react';

export interface QuestionCardProps {
  subject: string;
  progressLabel: string;
  stem: string;
  options: string[];
  onSubmit?: (index: number | null) => void;
}

export function QuestionCard({ subject, progressLabel, stem, options, onSubmit }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)', fontWeight: 600 }}>{subject} · {progressLabel}</div>
      <div style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--text-body)', marginTop: 14, fontWeight: 500 }}>{stem}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
        {options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <button key={i} onClick={() => setSelected(i)} style={{
              textAlign: 'left', minHeight: 'var(--touch-min)', padding: '12px 16px', borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${isSelected ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`,
              background: isSelected ? 'var(--kairo-blue-100)' : '#fff', color: 'var(--text-body)', fontSize: 'var(--fs-body)',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${isSelected ? 'var(--kairo-navy-900)' : 'var(--kairo-ink-300)'}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700,
                background: isSelected ? 'var(--kairo-navy-900)' : 'transparent', color: isSelected ? '#fff' : 'var(--text-muted)',
              }}>{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>
      <button onClick={() => onSubmit && onSubmit(selected)} disabled={selected === null} style={{
        marginTop: 20, width: '100%', minHeight: 'var(--touch-min)', border: 'none', borderRadius: 'var(--radius-pill)',
        background: selected === null ? 'var(--kairo-ink-100)' : 'var(--kairo-navy-900)', color: selected === null ? 'var(--text-faint)' : '#fff',
        fontWeight: 700, fontSize: 'var(--fs-body-lg)', cursor: selected === null ? 'not-allowed' : 'pointer',
      }}>
        Submit Answer
      </button>
    </div>
  );
}
