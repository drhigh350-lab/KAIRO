import { ScreenHeader, OptionRow, KairoScreenState } from '../learning/shared';
import type { Subject } from './data';
import { getRealTopics } from '../../lib/kairoEngine';
import { useAsyncResource } from '../../lib/useAsyncResource';

export interface TopicSelectProps {
  subject: Subject;
  onBack?: () => void;
  onPick: (topic: string) => void;
}

export function TopicSelect({ subject, onBack, onPick }: TopicSelectProps) {
  const { status, data: topics, error, retry } = useAsyncResource(
    () => getRealTopics(subject.label),
    { deps: [subject.label], fallbackError: 'Could not load topics.' },
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title={subject.label} tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginBottom: 18 }}>Pick a topic.</div>
        {status !== 'success' && (
          <KairoScreenState status={status} inline message="Loading topics…" errorMessage={error} onRetry={retry} />
        )}
        {status === 'success' && topics !== null && topics.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
            No topics available yet for {subject.label}.
          </div>
        )}
        {topics?.map((t) => (
          <OptionRow
            key={t.topic}
            label={t.topic}
            subtitle={`Attempted ${t.attempted}/${t.questionCount}${t.attempted > 0 ? ` · ${t.accuracyPct}% accuracy` : ''}`}
            onClick={() => onPick(t.topic)}
            tone="dark"
          />
        ))}
      </div>
    </div>
  );
}
