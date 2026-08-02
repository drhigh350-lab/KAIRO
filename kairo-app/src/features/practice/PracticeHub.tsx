import { useState } from 'react';
import { Button } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { Subject } from './data';

export interface PracticeHubStartArgs {
  type: string;
  difficulty: string;
  length: number;
}

export interface PracticeHubProps {
  subject: Subject | { key: string; label: string };
  hasHistory?: boolean;
  lockedType?: string;
  onBack?: () => void;
  onStart: (args: PracticeHubStartArgs) => void;
}

export function PracticeHub({ subject, hasHistory, lockedType, onBack, onStart }: PracticeHubProps) {
  const [type, setType] = useState(lockedType || 'topic');
  const [difficulty, setDifficulty] = useState('adaptive');
  const [length, setLength] = useState(10);
  const [customLength, setCustomLength] = useState('');
  const [customOpen, setCustomOpen] = useState(false);

  const types = [
    { key: 'topic', label: 'Topic Practice', desc: 'Practice one topic deeply.', locked: false },
    { key: 'mixed', label: 'Mixed Practice', desc: `Questions from every ${subject.label} topic.`, locked: false },
    { key: 'weak', label: 'Weak Areas', desc: hasHistory ? 'Generated from your previous mistakes.' : 'Available after a few practice sessions.', locked: !hasHistory },
  ];
  const difficulties = [
    { key: 'adaptive', label: 'Adaptive', desc: 'Recommended — Kairo adjusts as you answer' },
    { key: 'easy', label: 'Easy' },
    { key: 'medium', label: 'Medium' },
    { key: 'hard', label: 'Hard' },
  ];
  const lengths = [5, 10, 20];

  const resolvedLength = customOpen ? (parseInt(customLength, 10) || 0) : length;
  const canStart = resolvedLength > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title={subject.label} />
      <div style={{ padding: '4px 20px 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: 30 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, color: 'var(--text-heading)', lineHeight: 1.25 }}>
            Ready to practise {subject.label}?
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>
            One question at a time. Understand concepts. Build confidence.
          </div>
        </div>

        {!lockedType && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>PRACTICE TYPE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {types.map((t) => {
              const active = type === t.key;
              return (
                <div key={t.key} onClick={() => !t.locked && setType(t.key)} style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, alignItems: 'flex-start',
                  cursor: t.locked ? 'default' : 'pointer', opacity: t.locked ? 0.55 : 1,
                  border: `1.5px solid ${active ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`, background: active ? 'var(--kairo-blue-100)' : '#fff',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    border: `1.5px solid ${active ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--kairo-navy-900)' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-heading)' }}>{t.label}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.45 }}>{t.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>DIFFICULTY</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {difficulties.map((d) => {
              const active = difficulty === d.key;
              return (
                <div key={d.key} onClick={() => setDifficulty(d.key)} style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${active ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`,
                  background: active ? 'var(--kairo-navy-900)' : '#fff', color: active ? '#fff' : 'var(--text-body)',
                }}>{d.label}</div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>ESTIMATED SESSION</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {lengths.map((n) => {
              const active = !customOpen && length === n;
              return (
                <div key={n} onClick={() => { setCustomOpen(false); setLength(n); }} style={{
                  flex: 1, textAlign: 'center', padding: '12px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  border: `1.5px solid ${active ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`, background: active ? 'var(--kairo-navy-900)' : '#fff', color: active ? '#fff' : 'var(--text-body)',
                }}>{n}</div>
              );
            })}
            <div onClick={() => setCustomOpen(true)} style={{
              flex: 1, textAlign: 'center', padding: '12px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
              border: `1.5px solid ${customOpen ? 'var(--kairo-navy-900)' : 'var(--color-border-subtle)'}`, background: customOpen ? 'var(--kairo-navy-900)' : '#fff', color: customOpen ? '#fff' : 'var(--text-body)',
            }}>Custom</div>
          </div>
          {customOpen && (
            <input
              type="number" min="1" max="60" autoFocus placeholder="Number of questions"
              value={customLength} onChange={(e) => setCustomLength(e.target.value)}
              style={{
                marginTop: 10, width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border-subtle)', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text-heading)',
              }}
            />
          )}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <Button variant="primary" size="lg" fullWidth disabled={!canStart} onClick={() => onStart({ type, difficulty, length: resolvedLength })}>
            {'Start Practice →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
