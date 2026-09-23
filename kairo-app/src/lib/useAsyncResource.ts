import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * KAIRO's shared async state machine.
 *
 *   idle → loading → success
 *              ↓ (slowAfterMs elapsed while still loading)
 *            slow
 *              ↓ (rejection)
 *          error | offline
 *
 * Every major async screen drives its UI from one of these statuses instead
 * of hand-rolling a `loading` boolean + `error` string per screen. Pair it
 * with <KairoScreenState> (features/learning/shared) to render the matching
 * LOADING / SLOW / ERROR / OFFLINE / RETRY surface.
 */
export type AsyncStatus = 'idle' | 'loading' | 'slow' | 'success' | 'error' | 'offline';

export interface AsyncResource<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  /** loading || slow — a request is in flight. */
  isPending: boolean;
  /** Re-run the loader. Wire this to the "Retry" button. */
  retry: () => void;
  /** Optimistically update cached data without refetching. */
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export interface UseAsyncResourceOptions {
  /** Re-run the loader whenever any of these change (like useEffect deps). */
  deps?: React.DependencyList;
  /** Escalate to the reassuring "taking longer than usual" state after this long. */
  slowAfterMs?: number;
  /** When false, the loader never runs and status stays `idle`. */
  enabled?: boolean;
  /** Message used when a rejection isn't an Error with a message. */
  fallbackError?: string;
}

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  {
    deps = [],
    slowAfterMs = 6000,
    enabled = true,
    fallbackError = 'Something went wrong. Please try again.',
  }: UseAsyncResourceOptions = {},
): AsyncResource<T> {
  const [status, setStatus] = useState<AsyncStatus>(enabled ? 'loading' : 'idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  // Keep the latest loader without making it a dependency — callers routinely
  // pass an inline arrow function that would otherwise re-run on every render.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);

    const slowTimer = setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === 'loading' ? 'slow' : s));
    }, slowAfterMs);

    loaderRef
      .current()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus('success');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error && err.message ? err.message : fallbackError);
        setStatus(isOffline() ? 'offline' : 'error');
      })
      .finally(() => clearTimeout(slowTimer));

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, nonce, ...deps]);

  // If the network drops mid-request, reflect it immediately rather than
  // waiting for the request to time out — the student gets an honest answer.
  useEffect(() => {
    function onOffline() {
      setStatus((s) => (s === 'loading' || s === 'slow' ? 'offline' : s));
    }
    window.addEventListener('offline', onOffline);
    return () => window.removeEventListener('offline', onOffline);
  }, []);

  return {
    status,
    data,
    error,
    isPending: status === 'loading' || status === 'slow',
    retry,
    setData,
  };
}
