import { ScreenHeader, OptionRow, KairoScreenState } from '../learning/shared';
import type { Subject } from './data';
import { getRealSubtopics } from '../../lib/kairoEngine';
import { useAsyncResource } from '../../lib/useAsyncResource';

export interface SubtopicSelectProps {
  subject: Subject;
  topic: string;
  onBack?: () => void;
  onPick: (subtopic: string) => void;
  onSkip: () => void;
}

export function SubtopicSelect({ subject, topic, onBack, onPick, onSkip }: SubtopicSelectProps) {
  const { status, data: subtopics, error, retry } = useAsyncResource(
    () => getRealSubtopics(subject.label, topic),
    { deps: [subject.label, topic], fallbackError: 'Could not load subtopics.' },
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title={topic} tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginBottom: 18 }}>Narrow it down, or practise the whole topic.</div>
        {status !== 'success' && (
          <KairoScreenState status={status} inline message="Loading subtopics…" errorMessage={error} onRetry={retry} />
        )}
        {subtopics?.map((s) => (
          <OptionRow
            key={s.subtopic}
            label={s.subtopic}
            subtitle={`Attempted ${s.attempted}/${s.questionCount}${s.attempted > 0 ? ` · ${s.accuracyPct}% accuracy` : ''}`}
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
