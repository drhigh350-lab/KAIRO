import { useEffect, useRef, useState } from 'react';
import { ScreenHeader, OptionRow } from '../learning/shared';
import { KairoStateView, useAsyncState } from '../../components/feedback/AsyncState';
import type { Subject } from './data';
import { getRealTopics, type TopicInfo } from '../../lib/kairoEngine';
import { fetchQuery, peekQuery } from '../../lib/queryCache';

export interface TopicSelectProps {
  subject: Subject;
  onBack?: () => void;
  onPick: (topic: string) => void;
}

export function TopicSelect({ subject, onBack, onPick }: TopicSelectProps) {
  const cacheKey = `topics:${subject.label}`;
  const requestId = useRef(0);
  const cachedTopics = peekQuery<TopicInfo[]>(cacheKey);
  const [topics, setTopics] = useState<TopicInfo[] | null>(cachedTopics ?? null);
  const [error, setError] = useState<string | null>(null);
  const { state, reset, start, retry, succeed, fail, isOnline } = useAsyncState(
    cachedTopics !== undefined ? 'success' : 'idle',
    7000,
  );

  const loadTopics = () => {
    const currentRequest = ++requestId.current;
    const cached = peekQuery<TopicInfo[]>(cacheKey);
    const hasCachedTopics = cached !== undefined;

    setError(null);
    if (hasCachedTopics) {
      setTopics(cached);
      succeed();
    } else {
      setTopics(null);
      start();
    }

    if (!isOnline) {
      if (!hasCachedTopics) fail();
      return;
    }

    fetchQuery(cacheKey, () => getRealTopics(subject.label))
      .then((nextTopics) => {
        if (currentRequest !== requestId.current) return;
        setTopics(nextTopics);
        succeed();
      })
      .catch(() => {
        if (currentRequest !== requestId.current || hasCachedTopics) return;
        setError('Topics could not be loaded. Please try again.');
        fail();
      });
  };

  useEffect(() => {
    reset();
    loadTopics();
    return () => { requestId.current += 1; };
  }, [subject.label, isOnline]);

  const retryTopics = () => {
    retry();
    loadTopics();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title={subject.label} tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginBottom: 18 }}>Pick a topic.</div>
        <KairoStateView
          state={state === 'idle' ? 'loading' : state}
          loadingMessage="Preparing your topics…"
          slowMessage="Taking longer than expected."
          errorMessage={error ?? 'Could not load topics.'}
          offlineMessage="You’re offline. Connect to the internet and try again."
          onRetry={retryTopics}
        >
          {topics?.length ? topics.map((t) => (
            <OptionRow
              key={t.topic}
              label={t.topic}
              subtitle={`Attempted ${t.attempted}/${t.questionCount}${t.attempted > 0 ? ` · ${t.accuracyPct}% accuracy` : ''}`}
              onClick={() => onPick(t.topic)}
              tone="dark"
            />
          )) : (
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
              No topics available yet for {subject.label}.
            </div>
          )}
        </KairoStateView>
      </div>
    </div>
  );
}
