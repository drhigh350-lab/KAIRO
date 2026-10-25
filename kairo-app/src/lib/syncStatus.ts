/**
 * Kairo Sync & Offline Status Manager
 * Coordinates real-time sync state tracking, offline detection,
 * durable timestamp persistence, and reactive subscriptions for UI indicators.
 */

import { useEffect, useState } from 'react';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncStatusInfo {
  isOnline: boolean;
  status: SyncState;
  lastSyncedAt: Date | null;
  pendingCount: number;
  lastError: string | null;
}

const STORAGE_KEY_LAST_SYNC = 'kairo_last_synced_at';

// Read initial persisted sync timestamp if available
function getInitialLastSync(): Date | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
    if (!val) return null;
    const ts = parseInt(val, 10);
    return Number.isFinite(ts) && ts > 0 ? new Date(ts) : null;
  } catch {
    return null;
  }
}

// Initial state
let currentStatus: SyncStatusInfo = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  status: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : (getInitialLastSync() ? 'synced' : 'idle'),
  lastSyncedAt: getInitialLastSync(),
  pendingCount: 0,
  lastError: null,
};

type Listener = (status: SyncStatusInfo) => void;
const listeners = new Set<Listener>();

function notifyListeners(): void {
  const snapshot = { ...currentStatus };
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch {
      // Ignore subscriber errors
    }
  });
}

/** Subscribe to sync status updates */
export function subscribeSyncStatus(listener: Listener): () => void {
  listeners.add(listener);
  listener({ ...currentStatus });
  return () => {
    listeners.delete(listener);
  };
}

/** Get current sync status snapshot */
export function getSyncStatus(): SyncStatusInfo {
  return { ...currentStatus };
}

/** Record that a sync operation has initiated */
export function notifySyncStarted(): void {
  if (!currentStatus.isOnline) return;
  currentStatus = {
    ...currentStatus,
    status: 'syncing',
    lastError: null,
  };
  notifyListeners();
}

/** Record that a sync operation completed */
export function notifySyncCompleted(result?: { status?: string; count?: number; queued?: number; failed?: unknown }): void {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline || result?.status === 'offline') {
    currentStatus = {
      ...currentStatus,
      isOnline: false,
      status: 'offline',
      pendingCount: typeof result?.queued === 'number' ? result.queued : currentStatus.pendingCount,
    };
    notifyListeners();
    return;
  }

  const now = new Date();
  try {
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, now.getTime().toString());
  } catch {
    // LocalStorage write failed - ignore
  }

  currentStatus = {
    ...currentStatus,
    isOnline: true,
    status: 'synced',
    lastSyncedAt: now,
    pendingCount: typeof result?.queued === 'number' ? result.queued : 0,
    lastError: null,
  };
  notifyListeners();
}

/** Record that a sync operation failed */
export function notifySyncFailed(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err || 'Sync failed');
  currentStatus = {
    ...currentStatus,
    status: 'error',
    lastError: msg,
  };
  notifyListeners();
}

/** Update pending count */
export function setPendingCount(count: number): void {
  if (currentStatus.pendingCount !== count) {
    currentStatus = {
      ...currentStatus,
      pendingCount: Math.max(0, count),
    };
    notifyListeners();
  }
}

let trackingInitialized = false;

/** Initialize window online/offline listeners */
export function initSyncStatusTracking(engineGetter?: () => any): void {
  if (trackingInitialized || typeof window === 'undefined') return;
  trackingInitialized = true;

  const handleOnline = () => {
    currentStatus = {
      ...currentStatus,
      isOnline: true,
      status: currentStatus.lastSyncedAt ? 'synced' : 'idle',
      lastError: null,
    };
    notifyListeners();

    // Trigger immediate sync on reconnect
    if (engineGetter) {
      const engine = engineGetter();
      if (engine?.sync?.sync) {
        engine.sync.sync().catch(() => {});
      }
    }
  };

  const handleOffline = () => {
    currentStatus = {
      ...currentStatus,
      isOnline: false,
      status: 'offline',
    };
    notifyListeners();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Sync initial online state
  if (navigator.onLine === false) {
    handleOffline();
  }
}

/**
 * Wrap an engine's sync manager so all sync invocations automatically notify
 * the status tracker, regardless of where or why sync was called.
 */
export function wrapEngineSync(inst: any): void {
  if (!inst?.sync || inst.sync.__kairoSyncStatusWrapped) return;
  const originalSync = inst.sync.sync.bind(inst.sync);
  inst.sync.__kairoSyncStatusWrapped = true;

  inst.sync.sync = async () => {
    notifySyncStarted();
    try {
      const res = await originalSync();
      notifySyncCompleted(res);
      return res;
    } catch (err) {
      notifySyncFailed(err);
      throw err;
    }
  };
}

/** React hook for real-time sync status */
export function useSyncStatus(): SyncStatusInfo & {
  syncNow: () => Promise<boolean>;
} {
  const [state, setState] = useState<SyncStatusInfo>(() => getSyncStatus());

  useEffect(() => {
    return subscribeSyncStatus(setState);
  }, []);

  const syncNow = async (): Promise<boolean> => {
    if (!navigator.onLine) {
      currentStatus = { ...currentStatus, isOnline: false, status: 'offline' };
      notifyListeners();
      return false;
    }

    notifySyncStarted();
    try {
      // Dynamic import or window event to avoid circular dependency
      window.dispatchEvent(new CustomEvent('kairo:manual-sync-requested'));
      return true;
    } catch (err) {
      notifySyncFailed(err);
      return false;
    }
  };

  return {
    ...state,
    syncNow,
  };
}
