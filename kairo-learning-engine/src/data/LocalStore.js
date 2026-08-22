/**
 * Kairo — LocalStore
 * Offline-first IndexedDB wrapper for browser environments.
 * Falls back to in-memory if IndexedDB is unavailable (e.g., testing, Workers).
 */

const DB_NAME = 'kairo_learning_engine';
const DB_VERSION = 3;

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
  PREFETCHED_QUEUES: 'prefetched_queues'
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

  async savePrefetchedQueue(queue) {
    await this.put(STORES.PREFETCHED_QUEUES, queue);
  }

  async getPrefetchedQueues() {
    return this.getAll(STORES.PREFETCHED_QUEUES);
  }

  async deletePrefetchedQueue(queueId) {
    await this.delete(STORES.PREFETCHED_QUEUES, queueId);
  }
}

export { STORES };
