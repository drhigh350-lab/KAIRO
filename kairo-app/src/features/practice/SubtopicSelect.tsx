import { ScreenHeader, OptionRow } from '../learning/shared';
import type { Subject, Topic } from './data';

export interface SubtopicSelectProps {
  subject: Subject;
  topic: Topic;
  onBack?: () => void;
  onPick: (subtopic: string) => void;
  onSkip: () => void;
}

export function SubtopicSelect({ topic, onBack, onPick, onSkip }: SubtopicSelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title={topic.label} />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>Narrow it down, or practise the whole topic.</div>
        {topic.subtopics.map((s) => <OptionRow key={s} label={s} onClick={() => onPick(s)} />)}
        <button type="button" onClick={onSkip} style={{
          marginTop: 8, textAlign: 'center', fontSize: 13, color: 'var(--text-link)', cursor: 'pointer', fontWeight: 600,
          background: 'none', border: 'none', minHeight: 'var(--touch-min)', fontFamily: 'inherit',
        }}>Practise all of {topic.label}</button>
      </div>
    </div>
  );
}
