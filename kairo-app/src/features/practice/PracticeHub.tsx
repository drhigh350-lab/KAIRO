import { useState } from 'react';
import { Button } from '../../components';
import { Modal } from '../learning/shared';
import type { Subject } from './data';

export interface WeakTopicInfo {
  subject: string;
  topic: string;
  incorrectAttempts: number;
  failureRate: number;
}

export type PracticePacing = 'study' | 'custom' | 'exam';

export interface PracticeHubStartArgs {
  type: string;
  difficulty: string;
  length: number;
  /** Set only when a specific weak topic was picked (type 'weak' with weakTopics available) — the session scopes to this subject+topic instead of mixing every failed concept together. */
  topic?: string;
  topicSubject?: string;
  pacing: PracticePacing;
  /** Seconds per question — only meaningful when pacing === 'custom'. */
  customTimerSec?: number;
}

export interface PracticeHubProps {
  subject: Subject | { key: string; label: string };
  hasHistory?: boolean;
  lockedType?: string;
  /** Real most-failed topics (KairoEngine.getWeakTopics()) — when present and type is 'weak', replaces "repeat everything you've ever missed" with "pick the topic that's actually hurting you." */
  weakTopics?: WeakTopicInfo[];
  onBack?: () => void;
  onStart: (args: PracticeHubStartArgs) => void;
}

const EXAM_PACE_SEC = 45;

/**
 * Custom Practice setup — a clean bottom sheet (KISS: question count +
 * pacing, the two controls the Copy Framework calls out), reached after
 * tapping any of Practice Home's four quick-action cards.
 */
export function PracticeHub({ subject, hasHistory, lockedType, weakTopics, onBack, onStart }: PracticeHubProps) {
  const [type, setType] = useState(lockedType || 'topic');
  const [difficulty, setDifficulty] = useState('adaptive');
  const [length, setLength] = useState(10);
  const [pacing, setPacing] = useState<PracticePacing>('study');
  const [customTimerSec, setCustomTimerSec] = useState('60');
  const [selectedWeakTopic, setSelectedWeakTopic] = useState<WeakTopicInfo | null>(null);

  const types = [
    { key: 'topic', label: 'Topic Practice', desc: 'Practice one topic deeply.', locked: false },
    { key: 'mixed', label: 'Mixed Practice', desc: `Every ${subject.label} question, no cap.`, locked: false },
    { key: 'weak', label: 'Weak Areas', desc: hasHistory ? 'Generated from your previous mistakes.' : 'Available after a few practice sessions.', locked: !hasHistory },
  ];
  const difficulties = [
    { key: 'adaptive', label: 'Adaptive', desc: 'Recommended — Kairo adjusts as you answer' },
    { key: 'easy', label: 'Easy' },
    { key: 'medium', label: 'Medium' },
    { key: 'hard', label: 'Hard' },
  ];
  const lengths: (number | 'all')[] = [10, 20, 30, 'all'];
  const pacingOptions: { key: PracticePacing; label: string; desc: string }[] = [
    { key: 'study', label: 'Study', desc: 'Untimed — take the time you need.' },
    { key: 'custom', label: 'Custom Timer', desc: 'Set your own seconds per question.' },
    { key: 'exam', label: 'Exam Pace', desc: `${EXAM_PACE_SEC}s per question — real exam pressure.` },
  ];

  const isWeakWithTopics = type === 'weak' && !!weakTopics && weakTopics.length > 0;
  // Mixed Practice and a topic-boost session both mean "everything real
  // available in scope" now, not a student-picked count — the length
  // picker only still applies to plain Topic Practice.
  const hidesLengthPicker = type === 'mixed' || isWeakWithTopics;

  const canStart = isWeakWithTopics
    ? !!selectedWeakTopic
    : pacing === 'custom'
      ? (parseInt(customTimerSec, 10) || 0) > 0
      : true;

  function handleStart() {
    // 0 is the "no cap — every real question available" sentinel, used for
    // Mixed Practice / a weak-topic boost (no picker shown) and for
    // Topic Practice's own "All Available" option.
    const effectiveLength = hidesLengthPicker || length === 0 ? 0 : length;
    const pacingArgs = pacing === 'custom' ? { pacing, customTimerSec: parseInt(customTimerSec, 10) || 60 } : { pacing };
    if (isWeakWithTopics && selectedWeakTopic) {
      onStart({ type, difficulty, length: effectiveLength, topic: selectedWeakTopic.topic, topicSubject: selectedWeakTopic.subject, ...pacingArgs });
    } else {
      onStart({ type, difficulty, length: effectiveLength, ...pacingArgs });
    }
  }

  return (
    <Modal onClose={() => onBack?.()} tone="dark">
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--dark-text-heading)', lineHeight: 1.25 }}>
        Ready to practise {subject.label}?
      </div>
      <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 8, marginBottom: 22, lineHeight: 1.55 }}>
        One question at a time. Understand concepts. Build confidence.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {!lockedType && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>PRACTICE TYPE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {types.map((t) => {
              const active = type === t.key;
              return (
                <button type="button" key={t.key} disabled={t.locked} aria-pressed={active} onClick={() => setType(t.key)} style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%', textAlign: 'left', fontFamily: 'inherit',
                  cursor: t.locked ? 'default' : 'pointer', opacity: t.locked ? 0.55 : 1,
                  border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: active ? 'var(--dark-bg-elevated)' : 'var(--dark-bg-surface)',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--dark-accent-blue)' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{t.label}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 2, lineHeight: 1.45 }}>{t.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        )}

        {isWeakWithTopics && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>TOPICS NEEDING WORK</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {weakTopics!.map((w) => {
                const active = selectedWeakTopic?.topic === w.topic && selectedWeakTopic?.subject === w.subject;
                return (
                  <button type="button" key={`${w.subject}::${w.topic}`} aria-pressed={active} onClick={() => setSelectedWeakTopic(w)} style={{
                    padding: '14px 16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left', fontFamily: 'inherit',
                    cursor: 'pointer', border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: active ? 'var(--dark-bg-elevated)' : 'var(--dark-bg-surface)',
                  }}>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{w.topic}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 2 }}>{w.subject} · {w.incorrectAttempts} missed</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-danger)' }}>{Math.round(w.failureRate * 100)}%</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>DIFFICULTY</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {difficulties.map((d) => {
              const active = difficulty === d.key;
              return (
                <button type="button" key={d.key} aria-pressed={active} onClick={() => setDifficulty(d.key)} style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', minHeight: 'var(--touch-min)',
                  border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`,
                  background: active ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)', color: active ? '#fff' : 'var(--dark-text-body)',
                }}>{d.label}</button>
              );
            })}
          </div>
        </div>

        {!hidesLengthPicker && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>QUESTION COUNT</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {lengths.map((n) => {
              const active = n === 'all' ? length === 0 : length === n;
              return (
                <button type="button" key={n} aria-pressed={active} onClick={() => setLength(n === 'all' ? 0 : n)} style={{
                  flex: 1, textAlign: 'center', padding: '12px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: n === 'all' ? 12 : 14, fontFamily: 'inherit', minHeight: 'var(--touch-min)',
                  border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: active ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)', color: active ? '#fff' : 'var(--dark-text-body)',
                }}>{n === 'all' ? 'All' : n}</button>
              );
            })}
          </div>
        </div>
        )}
        {hidesLengthPicker && (
          <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', lineHeight: 1.5 }}>
            {type === 'mixed'
              ? `Every real ${subject.label} question, tracked with a completion percentage as you go — no fixed count to pick.`
              : 'Every real question for this topic — tracked as you go.'}
          </div>
        )}

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>PACING</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pacingOptions.map((p) => {
              const active = pacing === p.key;
              return (
                <button type="button" key={p.key} aria-pressed={active} onClick={() => setPacing(p.key)} style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left', fontFamily: 'inherit',
                  cursor: 'pointer', border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: active ? 'var(--dark-bg-elevated)' : 'var(--dark-bg-surface)',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginTop: 2 }}>{p.desc}</div>
                  </div>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--dark-accent-blue)' }} />}
                  </div>
                </button>
              );
            })}
          </div>
          {pacing === 'custom' && (
            <input
              type="number" min="10" max="300" autoFocus placeholder="Seconds per question"
              value={customTimerSec} onChange={(e) => setCustomTimerSec(e.target.value)}
              style={{
                marginTop: 10, width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--dark-border)', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--dark-text-heading)', background: 'var(--dark-bg-surface)',
              }}
            />
          )}
        </div>

        <Button variant="darkAccent" size="lg" fullWidth disabled={!canStart} onClick={handleStart}>
          {'Start Practice →'}
        </Button>
      </div>
    </Modal>
  );
}
