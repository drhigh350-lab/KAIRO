/**
 * Kairo — SyncManager
 * Handles offline-first conflict resolution.
 * Rule: most recent completed attempt wins for state, but ALL attempts are retained.
 */

export class SyncManager {
  /**
   * @param {LocalStore} localStore
   * @param {SupabaseSyncAdapter|null} adapter - talks to kairo.* tables directly (RLS-enforced)
   * @param {KairoEngine|null} engine - source of profile/graph/session data to sync
   */
  constructor(localStore, adapter = null, engine = null) {
    this.store = localStore;
    this.adapter = adapter;
    this.engine = engine;
    this.pendingSync = [];
  }

  /**
   * Attach or replace the Supabase adapter + engine reference after
   * construction — useful since sign-in (and therefore auth_user_id/
   * studentId) may not exist yet when KairoEngine is first created.
   */
  attachRemote(adapter, engine) {
    this.adapter = adapter;
    this.engine = engine;
  }

  /**
   * Queue an item for sync when connection returns.
   */
  queue(syncItem) {
    this.pendingSync.push({
      ...syncItem,
      queuedAt: Date.now(),
      syncId: `${Date.now()}_${Math.random().toString(36).slice(2)}`
    });
  }

  /**
   * Attempt to sync pending items via the Supabase adapter.
   * Requires both an adapter (signed in) and an engine (data to push).
   */
  async sync() {
    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
    if (!isOnline || !this.adapter || !this.engine) {
      return { status: 'offline', queued: this.pendingSync.length };
    }

    const toSync = [...this.pendingSync];
    const pendingAttempts = toSync.filter(i => i.type === 'attempt').map(i => i.data);
    this.pendingSync = [];

    try {
      const result = await this.adapter.fullSync({
        authUserId: this.engine.profile.authUserId,
        studentId: this.engine.profile.studentId,
        profile: this.engine.profile.toJSON(),
        conceptNodes: Array.from(this.engine.graph.nodes.values()),
        pendingAttempts,
        since: this.engine.profile.lastSessionAt
      });

      return { status: 'synced', count: toSync.length, ...result };
    } catch (err) {
      // Re-queue on failure — toSync items go back to the front of the queue
      this.pendingSync = [...toSync, ...this.pendingSync];
      return { status: 'error', error: err.message, queued: this.pendingSync.length };
    }
  }

  /**
   * Merge remote data with local on reconnect.
   * State: most recent wins. Attempts: union (keep all).
   */
  static merge(localGraph, remoteGraph) {
    const merged = { nodes: [] };
    const nodeMap = new Map();

    // Index local
    for (const n of localGraph.nodes || []) nodeMap.set(n.id, n);

    // Merge remote
    for (const rn of remoteGraph.nodes || []) {
      const ln = nodeMap.get(rn.id);
      if (!ln) {
        nodeMap.set(rn.id, rn);
        continue;
      }

      // State: most recent lastSeenAt wins
      const localNewer = (ln.lastSeenAt || 0) > (rn.lastSeenAt || 0);
      const winner = localNewer ? ln : rn;

      // Attempts: union both histories
      const allAttempts = [...(ln.attemptHistory || []), ...(rn.attemptHistory || [])];
      // Deduplicate by timestamp + questionId
      const seen = new Set();
      winner.attemptHistory = allAttempts.filter(a => {
        const key = `${a.timestamp}_${a.questionId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).sort((a, b) => a.timestamp - b.timestamp);

      nodeMap.set(rn.id, winner);
    }

    merged.nodes = Array.from(nodeMap.values());
    return merged;
  }
}
