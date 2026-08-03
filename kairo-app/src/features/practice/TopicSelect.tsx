import { ScreenHeader, OptionRow } from '../learning/shared';
import type { Subject, Topic } from './data';

export interface TopicSelectProps {
  subject: Subject;
  onBack?: () => void;
  onPick: (topic: Topic) => void;
}

export function TopicSelect({ subject, onBack, onPick }: TopicSelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title={subject.label} tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginBottom: 18 }}>Pick a topic.</div>
        {subject.topics.map((t) => <OptionRow key={t.key} label={t.label} subtitle={t.subtopics.length ? `${t.subtopics.length} sub-topics` : undefined} onClick={() => onPick(t)} tone="dark" />)}
      </div>
    </div>
  );
}
