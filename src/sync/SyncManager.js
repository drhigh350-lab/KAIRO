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
    const pendingSessions = toSync.filter(i => i.type === 'session').map(i => i.data);
    this.pendingSync = [];

    try {
      const result = await this.adapter.fullSync({
        authUserId: this.engine.profile.authUserId,
        studentId: this.engine.profile.studentId,
        profile: this.engine.profile.toJSON(),
        conceptNodes: Array.from(this.engine.graph.nodes.values()),
        pendingAttempts,
        pendingSessions,
        since: this.engine.profile.lastSessionAt
      });

      // Push-then-pull is only "sync" if the pulled-back copy is actually
      // applied to the live engine — previously this returned remoteProfile/
      // remoteConceptStates/remoteAttempts to the caller and nothing ever
      // consumed them, so a second device's changes never reached this one.
      this._applyRemote(result);

      return { status: 'synced', count: toSync.length, ...result };
    } catch (err) {
      // Re-queue on failure — toSync items go back to the front of the queue
      this.pendingSync = [...toSync, ...this.pendingSync];
      return { status: 'error', error: err.message, queued: this.pendingSync.length };
    }
  }

  /**
   * Apply a fullSync() result back onto the live engine.
   * Conflict rule (unchanged from the original design, now actually
   * enforced): most recent wins for concept *state*, but every attempt —
   * local or remote — is retained.
   */
  _applyRemote({ remoteProfile, remoteConceptStates, remoteAttempts }) {
    if (remoteProfile) this._applyRemoteProfile(remoteProfile);
    if (remoteConceptStates) this._applyRemoteConceptStates(remoteConceptStates, remoteAttempts || []);
  }

  /**
   * Scalar/history profile fields: adopt the remote copy only when it's
   * genuinely ahead of what this device already knows (remote lastSessionAt
   * newer) — this device just pushed its own current state as part of the
   * same fullSync(), so "local newer or equal" means local is already
   * caught up and shouldn't be clobbered by the row it just wrote.
   */
  _applyRemoteProfile(remoteProfile) {
    const profile = this.engine.profile;
    const remoteNewer = (remoteProfile.lastSessionAt || 0) > (profile.lastSessionAt || 0);
    if (!remoteNewer) return;

    profile.macroState = remoteProfile.macroState;
    profile.macroStateHistory = remoteProfile.macroStateHistory;
    profile.learningState = remoteProfile.learningState;
    profile.learningStateHistory = remoteProfile.learningStateHistory;
    profile.journeyStage = remoteProfile.journeyStage;
    profile.journeyStageHistory = remoteProfile.journeyStageHistory;
    profile.streakData = remoteProfile.streakData;
    profile.eliteScoreHistory = remoteProfile.eliteScoreHistory;
    profile.responseTimeBaselines = remoteProfile.responseTimeBaselines;
    profile.totalQuestionsAnswered = remoteProfile.totalQuestionsAnswered;
    profile.totalCorrect = remoteProfile.totalCorrect;
    profile.lastSessionAt = remoteProfile.lastSessionAt;
    profile.atRiskTriggeredAt = remoteProfile.atRiskTriggeredAt;
    profile.recoverySessionCount = remoteProfile.recoverySessionCount;
    profile.notificationHistory = remoteProfile.notificationHistory;
    // reEngagement/crossModuleMilestones/continuation/comms/learn are each
    // owned by their respective module instances (ReEngagementEngine,
    // CrossModuleMilestones, ContinuationEngine, CommsService, LearnModule)
    // and re-hydrated from the profile snapshot via their own fromJSON() at
    // KairoEngine.init() time — applying the raw JSON here without going
    // through those constructors would desync the live instances from the
    // profile fields they're about to overwrite on the next
    // _snapshotSjeeState() call. Deferred to init(), consistent with how a
    // fresh sign-in already restores them.
  }

  /**
   * Concept dynamic state: most recent lastSeenAt/updated_at wins per
   * concept; attempt history is unioned and deduplicated, never truncated.
   */
  _applyRemoteConceptStates(remoteConceptStates, remoteAttempts) {
    const graph = this.engine.graph;
    const attemptsByConceptId = new Map();
    for (const row of remoteAttempts) {
      const list = attemptsByConceptId.get(row.concept_id) || [];
      list.push({
        conceptId: row.concept_id,
        correct: row.correct,
        responseTimeMs: row.response_time_ms,
        timestamp: row.answered_at ? new Date(row.answered_at).getTime() : Date.now(),
        errorTag: row.error_tag,
        questionId: row.question_id,
        difficulty: row.question_difficulty
      });
      attemptsByConceptId.set(row.concept_id, list);
    }

    for (const row of remoteConceptStates) {
      const node = graph.getConcept(row.concept_id);
      if (!node) continue; // remote knows a concept this device hasn't loaded into its graph yet — nothing to merge onto

      const remoteLastSeen = row.last_seen_at ? new Date(row.last_seen_at).getTime() : 0;
      const localLastSeen = node.lastSeenAt || 0;

      if (remoteLastSeen > localLastSeen) {
        node.retentionState = row.retention_state;
        node.confidenceScore = Number(row.confidence_score);
        node.lastSeenAt = remoteLastSeen;
        node.decayEstimate = Number(row.decay_estimate);
        node.nextReviewEstimate = row.next_review_estimate ? new Date(row.next_review_estimate).getTime() : null;
        node.errorPatternTags = new Map(Object.entries(row.error_pattern_tags || {}));
        node.reinforcedCycles = row.reinforced_cycles;
        node.personalDecayRate = Number(row.personal_decay_rate);
      }

      // Attempts are never truncated by the state conflict above — union
      // local + remote and dedupe, regardless of which side "won" the state.
      const remoteForConcept = attemptsByConceptId.get(row.concept_id) || [];
      if (remoteForConcept.length === 0) continue;
      const merged = [...node.attemptHistory, ...remoteForConcept];
      const seen = new Set();
      node.attemptHistory = merged.filter(a => {
        const key = `${a.timestamp}_${a.questionId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).sort((a, b) => a.timestamp - b.timestamp);
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
