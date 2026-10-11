import { useEffect, useRef, useState } from 'react';
import { ScreenHeader, OptionRow } from '../learning/shared';
import { KairoStateView, useAsyncState } from '../../components/feedback/AsyncState';
import type { Subject } from './data';
import { getRealSubtopics, type SubtopicInfo } from '../../lib/kairoEngine';
import { fetchQuery, peekQuery } from '../../lib/queryCache';

export interface SubtopicSelectProps {
  subject: Subject;
  topic: string;
  onBack?: () => void;
  onPick: (subtopic: string) => void;
  onSkip: () => void;
}

export function SubtopicSelect({ subject, topic, onBack, onPick, onSkip }: SubtopicSelectProps) {
  const cacheKey = `subtopics:${subject.label}:${topic}`;
  const requestId = useRef(0);
  const cachedSubtopics = peekQuery<SubtopicInfo[]>(cacheKey);
  const [subtopics, setSubtopics] = useState<SubtopicInfo[] | null>(cachedSubtopics ?? null);
  const [error, setError] = useState<string | null>(null);
  const { state, reset, start, retry, succeed, fail, isOnline } = useAsyncState(
    cachedSubtopics !== undefined ? 'success' : 'idle',
    7000,
  );

  const loadSubtopics = () => {
    const currentRequest = ++requestId.current;
    const cached = peekQuery<SubtopicInfo[]>(cacheKey);
    const hasCachedSubtopics = cached !== undefined;

    setError(null);
    if (hasCachedSubtopics) {
      setSubtopics(cached);
      succeed();
    } else {
      setSubtopics(null);
      start();
    }

    if (!isOnline) {
      if (!hasCachedSubtopics) fail();
      return;
    }

    fetchQuery(cacheKey, () => getRealSubtopics(subject.label, topic))
      .then((nextSubtopics) => {
        if (currentRequest !== requestId.current) return;
        setSubtopics(nextSubtopics);
        succeed();
      })
      .catch(() => {
        if (currentRequest !== requestId.current || hasCachedSubtopics) return;
        setError('Subtopics could not be loaded. Please try again.');
        fail();
      });
  };

  useEffect(() => {
    reset();
    loadSubtopics();
    return () => { requestId.current += 1; };
  }, [subject.label, topic, isOnline]);

  const retrySubtopics = () => {
    retry();
    loadSubtopics();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title={topic} tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginBottom: 18 }}>Narrow it down, or practise the whole topic.</div>
        {state !== 'success' ? (
          <KairoStateView
            state={state === 'idle' ? 'loading' : state}
            loadingMessage="Preparing your subtopics…"
            slowMessage="Taking longer than expected."
            errorMessage={error ?? 'Could not load subtopics.'}
            offlineMessage="You’re offline. Connect to the internet and try again."
            onRetry={retrySubtopics}
            compact
          />
        ) : subtopics?.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: 20 }}>
            No subtopics available yet for {topic}.
          </div>
        ) : subtopics?.map((s) => (
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
