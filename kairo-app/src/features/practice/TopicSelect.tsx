import { useEffect, useState } from 'react';
import { ScreenHeader, OptionRow } from '../learning/shared';
import type { Subject } from './data';
import { getRealTopics, type TopicInfo } from '../../lib/kairoEngine';

export interface TopicSelectProps {
  subject: Subject;
  onBack?: () => void;
  onPick: (topic: string) => void;
}

export function TopicSelect({ subject, onBack, onPick }: TopicSelectProps) {
  const [topics, setTopics] = useState<TopicInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRealTopics(subject.label)
      .then(setTopics)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load topics.'));
  }, [subject.label]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title={subject.label} tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginBottom: 18 }}>Pick a topic.</div>
        {error && <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 20 }}>{error}</div>}
        {!error && topics === null && <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 20 }}>Loading topics…</div>}
        {!error && topics !== null && topics.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
            No topics available yet for {subject.label}.
          </div>
        )}
        {topics?.map((t) => (
          <OptionRow
            key={t.topic}
            label={t.topic}
            subtitle={`${t.questionCount} question${t.questionCount === 1 ? '' : 's'} · ${t.masteryPct}% mastered`}
            onClick={() => onPick(t.topic)}
            tone="dark"
          />
        ))}
      </div>
    </div>
  );
}
