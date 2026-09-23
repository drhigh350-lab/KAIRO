import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '../core/Button';
import { KairoMark } from '../brand/Logo';

export type AsyncState = 'idle' | 'loading' | 'success' | 'slow' | 'error' | 'offline' | 'retry';

export interface KairoStateViewProps {
  state: Exclude<AsyncState, 'idle'>;
  loadingMessage?: string;
  slowMessage?: string;
  errorMessage?: string;
  offlineMessage?: string;
  retryLabel?: string;
  onRetry?: () => void;
  onContinueOffline?: () => void;
  children?: ReactNode;
  compact?: boolean;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function useAsyncState(initial: AsyncState = 'idle', slowAfterMs = 7000) {
  const [state, setState] = useState<AsyncState>(initial);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (state !== 'loading' && state !== 'retry') return;
    const timeout = window.setTimeout(() => setState('slow'), slowAfterMs);
    return () => window.clearTimeout(timeout);
  }, [state, slowAfterMs]);

  useEffect(() => {
    if (!isOnline && (state === 'loading' || state === 'slow' || state === 'retry')) setState('offline');
  }, [isOnline, state]);

  const start = () => setState('loading');
  const retry = () => setState('retry');
  const succeed = () => setState('success');
  const fail = () => setState('error');
  const reset = () => setState('idle');

  return { state, setState, isOnline, start, retry, succeed, fail, reset };
}

export function KairoStateView({
  state,
  loadingMessage = 'Preparing your KAIRO experience…',
  slowMessage = 'This is taking longer than usual.',
  errorMessage = 'We couldn’t complete that just now.',
  offlineMessage = 'You’re offline. Your saved progress is safe on this device.',
  retryLabel = 'Retry',
  onRetry,
  onContinueOffline,
  children,
  compact = false,
}: KairoStateViewProps) {
  if (state === 'success') return <>{children}</>;

  const isBusy = state === 'loading' || state === 'retry';
  const title = state === 'retry'
    ? 'Retrying…'
    : state === 'slow'
      ? slowMessage
      : state === 'offline'
        ? 'You’re offline'
        : state === 'error'
          ? errorMessage
          : loadingMessage;
  const detail = state === 'retry'
    ? 'Your saved progress is safe while KAIRO tries again.'
    : state === 'slow'
      ? 'Your saved progress is safe. You can keep waiting or try again.'
      : state === 'error'
        ? 'Your saved progress is safe. Please try again.'
        : state === 'offline'
          ? offlineMessage
          : 'Your saved progress is safe while KAIRO gets things ready.';
  const liveMode = state === 'error' || state === 'offline' ? 'assertive' : 'polite';

  return (
    <section className={`kairo-state-view${compact ? ' kairo-state-view--compact' : ''}`} role="status" aria-live={liveMode} aria-busy={isBusy}>
      <div className="kairo-state-mark" aria-hidden="true"><KairoMark tone="white" size={56} /></div>
      <h2>{title}</h2>
      <p>{detail}</p>
      {isBusy && <div className="kairo-loading-dots" aria-hidden="true"><span /><span /><span /></div>}
      {(state === 'slow' || state === 'error' || state === 'offline') && (
        <div className="kairo-state-actions">
          {state !== 'offline' && onRetry && <Button variant="darkAccent" size="sm" onClick={onRetry}>{retryLabel}</Button>}
          {state === 'offline' && onContinueOffline && <Button variant="darkAccent" size="sm" onClick={onContinueOffline}>Continue Offline</Button>}
          {state === 'offline' && onRetry && <Button variant="ghost" size="sm" onClick={onRetry}>{retryLabel}</Button>}
        </div>
      )}
    </section>
  );
}

export interface KairoLoadingProps {
  message?: string;
  detail?: string;
  compact?: boolean;
  slowAfterMs?: number;
  onRetry?: () => void;
  onContinueOffline?: () => void;
}

export function KairoLoading({
  message = 'Preparing your KAIRO experience…',
  detail,
  compact = false,
  slowAfterMs,
  onRetry,
  onContinueOffline,
}: KairoLoadingProps) {
  const { state, setState } = useAsyncState('loading', slowAfterMs);

  const handleRetry = () => {
    setState('loading');
    onRetry?.();
  };

  return (
    <KairoStateView
      state={state === 'idle' || state === 'success' ? 'loading' : state}
      loadingMessage={message}
      slowMessage="This is taking longer than usual."
      errorMessage="We couldn’t prepare this yet."
      offlineMessage={detail ?? 'You’re offline. Your saved progress is safe on this device.'}
      onRetry={handleRetry}
      onContinueOffline={onContinueOffline}
      compact={compact}
    />
  );
}
