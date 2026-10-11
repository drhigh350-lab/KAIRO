/**
 * Tiny in-memory stale-while-revalidate cache. Screens render the last
 * known result instantly (no loading spinner on revisits), then refresh it
 * in the background. Concurrent requests for the same key share one fetch,
 * so idle-time prefetches and a screen mount never double-hit Supabase.
 */
const store = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export function peekQuery<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function fetchQuery<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;
  const request = fetcher()
    .then((value) => {
      store.set(key, value);
      return value;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
}

export function setQuery<T>(key: string, value: T): void {
  store.set(key, value);
}

export function prefetchQuery<T>(key: string, fetcher: () => Promise<T>): void {
  if (store.has(key)) return;
  fetchQuery(key, fetcher).catch(() => {});
}

export function clearQueryCache(): void {
  store.clear();
  inflight.clear();
}
