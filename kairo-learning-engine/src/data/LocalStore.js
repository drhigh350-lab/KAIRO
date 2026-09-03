/**
 * Kairo — LocalStore
 * Offline-first IndexedDB wrapper for browser environments.
 * Falls back to in-memory if IndexedDB is unavailable (e.g., testing, Workers).
 */

const DB_NAME = 'kairo_learning_engine';
const DB_VERSION = 4;

const STORES = {
  CONCEPTS: 'concepts',
  SESSIONS: 'sessions',
  ATTEMPTS: 'attempts',
  PROFILE: 'profile',
  QUEUE: 'queue',
  // Durable mirror of SyncManager.pendingSync — without this, a queued
  // attempt/session/cbt_result sitting offline is lost the moment the tab
  // closes or reloads before sync() ever runs, since pendingSync itself is
  // just an in-memory array.
  PENDING_SYNC: 'pending_sync_queue',
  // Pre-assembled daily-recommendation queues (RecommendationEngine.
  // buildRankedQueue(), sliced into chunks with real resolved Question
  // objects already attached) — built while online, popped when starting
  // a recommendation session offline instead of failing on the network
  // call ensureContentLoaded()/loadContentCatalog() would otherwise need.
  PREFETCHED_QUEUES: 'prefetched_queues',
  // Study Planner state (plan input, completed topic keys, per-topic SRS
  // progress) — one row per student, offline-first mirror of
  // kairo.planner_state in Supabase. See kairo-app/src/lib/planner/plannerApi.ts.
  PLANNER: 'planner'
};

export class LocalStore {
  constructor() {
    this.db = null;
    this.memoryFallback = new Map(); // for envs without IndexedDB
    this.useMemory = false;
  }

  async init() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      this.useMemory = true;
      return;
    }
    return new Promise((resolve, reject) => {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => { this.db = req.result; resolve(); };
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORES.CONCEPTS)) {
          db.createObjectStore(STORES.CONCEPTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          db.createObjectStore(STORES.SESSIONS, { keyPath: 'sessionId', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORES.ATTEMPTS)) {
          db.createObjectStore(STORES.ATTEMPTS, { keyPath: 'attemptId', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORES.PROFILE)) {
          db.createObjectStore(STORES.PROFILE, { keyPath: 'studentId' });
        }
        if (!db.objectStoreNames.contains(STORES.QUEUE)) {
          db.createObjectStore(STORES.QUEUE, { keyPath: 'queueId' });
        }
        if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
          db.createObjectStore(STORES.PENDING_SYNC, { keyPath: 'syncId' });
        }
        if (!db.objectStoreNames.contains(STORES.PREFETCHED_QUEUES)) {
          db.createObjectStore(STORES.PREFETCHED_QUEUES, { keyPath: 'queueId' });
        }
        if (!db.objectStoreNames.contains(STORES.PLANNER)) {
          db.createObjectStore(STORES.PLANNER, { keyPath: 'studentId' });
        }
      };
    });
  }

  // ─── Generic CRUD ───

  async put(store, data) {
    if (this.useMemory) {
      if (!this.memoryFallback.has(store)) this.memoryFallback.set(store, new Map());
      const key = data.id || data.sessionId || data.attemptId || data.studentId || data.queueId || data.syncId || Date.now();
      this.memoryFallback.get(store).set(String(key), data);
      return data;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([store], 'readwrite');
      const os = tx.objectStore(store);
      const req = os.put(data);
      req.onsuccess = () => resolve(data);
      req.onerror = () => reject(req.error);
    });
  }

  async get(store, key) {
    if (this.useMemory) {
      return this.memoryFallback.get(store)?.get(String(key)) || null;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([store], 'readonly');
      const os = tx.objectStore(store);
      const req = os.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAll(store) {
    if (this.useMemory) {
      const map = this.memoryFallback.get(store);
      return map ? Array.from(map.values()) : [];
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([store], 'readonly');
      const os = tx.objectStore(store);
      const req = os.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(store, key) {
    if (this.useMemory) {
      this.memoryFallback.get(store)?.delete(String(key));
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([store], 'readwrite');
      const os = tx.objectStore(store);
      const req = os.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ─── Convenience methods ───

  async saveGraph(graph) {
    const data = graph.toJSON();
    for (const node of data.nodes) {
      await this.put(STORES.CONCEPTS, node);
    }
  }

  async loadGraph() {
    const nodes = await this.getAll(STORES.CONCEPTS);
    return { nodes };
  }

  async saveProfile(profile) {
    await this.put(STORES.PROFILE, profile.toJSON());
  }

  async loadProfile(studentId) {
    return this.get(STORES.PROFILE, studentId);
  }

  async logAttempt(attempt) {
    attempt.attemptId = attempt.attemptId || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    attempt.timestamp = attempt.timestamp || Date.now();
    await this.put(STORES.ATTEMPTS, attempt);
  }

  async getAttempts(conceptId) {
    const all = await this.getAll(STORES.ATTEMPTS);
    return all.filter(a => a.conceptId === conceptId);
  }

  /**
   * Reconcile one subject's offline mirror against the authoritative live
   * catalog. Deletions are intentional: the local queue is a mirror, not a
   * second source of truth.
   */
  async reconcileQuestionQueue(subject, questions) {
    const current = await this.getAll(STORES.QUEUE);
    const liveIds = new Set(questions.map(q => q.id || q.questionId || q.queueId));
    for (const record of current) {
      if (record.subject === subject && !liveIds.has(record.id || record.questionId || record.queueId)) {
        await this.delete(STORES.QUEUE, record.queueId);
      }
    }
    for (const question of questions) await this.put(STORES.QUEUE, question);
  }

  /** Invalidate resolved recommendation queues after any catalog refresh. */
  async clearPrefetchedQueues() {
    const queues = await this.getPrefetchedQueues();
    for (const queue of queues) await this.deletePrefetchedQueue(queue.queueId);
  }

  async savePrefetchedQueue(queue) {
    await this.put(STORES.PREFETCHED_QUEUES, queue);
  }

  async getPrefetchedQueues() {
    return this.getAll(STORES.PREFETCHED_QUEUES);
  }

  async deletePrefetchedQueue(queueId) {
    await this.delete(STORES.PREFETCHED_QUEUES, queueId);
  }

  async savePlannerState(studentId, state) {
    await this.put(STORES.PLANNER, { studentId, ...state });
  }

  async loadPlannerState(studentId) {
    return this.get(STORES.PLANNER, studentId);
  }

  /**
   * Wipe every object store — concepts, sessions, attempts, profile, queue,
   * pending sync queue, prefetched queues, planner state. Only PROFILE and
   * PLANNER were ever keyed by studentId; CONCEPTS/ATTEMPTS/QUEUE/
   * PREFETCHED_QUEUES are not scoped to a student at all, so without a full
   * wipe here, signing out of one account and into another on the same
   * device/browser silently inherited the previous account's retention
   * states, attempt history, and pre-built recommendation queues — the
   * cross-account "same topic, same questions" bleed. Called by
   * signOutAndDisconnect() (kairo-app/src/lib/kairoEngine.ts) after the
   * final best-effort sync, so a genuine logout always boots the next
   * sign-in from a blank local cache.
   */
  async clearAll() {
    if (this.useMemory) {
      this.memoryFallback.clear();
      return;
    }
    const storeNames = Object.values(STORES);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeNames, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      for (const name of storeNames) {
        tx.objectStore(name).clear();
      }
    });
  }
}

export { STORES };
