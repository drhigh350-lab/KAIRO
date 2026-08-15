import { useEffect, useState } from 'react';
import { ScreenHeader, OptionRow } from '../learning/shared';
import type { Subject } from './data';
import { getRealSubtopics, type SubtopicInfo } from '../../lib/kairoEngine';

export interface SubtopicSelectProps {
  subject: Subject;
  topic: string;
  onBack?: () => void;
  onPick: (subtopic: string) => void;
  onSkip: () => void;
}

export function SubtopicSelect({ subject, topic, onBack, onPick, onSkip }: SubtopicSelectProps) {
  const [subtopics, setSubtopics] = useState<SubtopicInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRealSubtopics(subject.label, topic)
      .then(setSubtopics)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load subtopics.'));
  }, [subject.label, topic]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title={topic} tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginBottom: 18 }}>Narrow it down, or practise the whole topic.</div>
        {error && <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 20 }}>{error}</div>}
        {!error && subtopics === null && <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 20 }}>Loading…</div>}
        {subtopics?.map((s) => (
          <OptionRow
            key={s.subtopic}
            label={s.subtopic}
            subtitle={`${s.questionCount} question${s.questionCount === 1 ? '' : 's'} · ${s.masteryPct}% mastered`}
            onClick={() => onPick(s.subtopic)}
            tone="dark"
          />
        ))}
        <button type="button" onClick={onSkip} style={{
          marginTop: 8, textAlign: 'center', fontSize: 13, color: 'var(--dark-accent-blue)', cursor: 'pointer', fontWeight: 600,
          background: 'none', border: 'none', minHeight: 'var(--touch-min)', fontFamily: 'inherit',
        }}>Practise all of {topic}</button>
      </div>
    </div>
  );
}
