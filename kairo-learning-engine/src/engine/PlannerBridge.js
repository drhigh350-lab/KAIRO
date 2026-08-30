/**
 * Kairo — PlannerBridge
 * The Planner Handshake: turns the raw kairo.planner_topic_map rows (the
 * reviewed subjectSlug/topicTitle -> engine subject/topic mapping — see
 * scripts/generate-planner-topic-map-candidates.js) plus one student's
 * kairo.planner_state row into a synchronous lookup RecommendationEngine
 * can consult mid-scoring, without either side needing to know Supabase
 * exists. Built once per session by KairoEngine (which owns the actual
 * fetches, see loadPlannerHandshakeData()) and handed to
 * RecommendationEngine's constructor — same pattern as `scheduler`.
 *
 * Deliberately dumb, by design: a miss is always "no signal," never a
 * guess. Mathematics/Use of English are quarantined for now not because
 * this class knows their names, but because kairo.planner_topic_map
 * simply has no reviewed rows for them yet (a genuine granularity
 * mismatch against the Blueprint, not just wording — see the audit that
 * led here) — every lookup for those subjects naturally falls through to
 * 'none' the same way an unmapped Chemistry/Physics/Biology topic would.
 */
export class PlannerBridge {
  /**
   * @param {Array} mapRows kairo.planner_topic_map rows: { subject_slug, topic_title, engine_subject, engine_topics }
   * @param {Object|null} plannerState kairo.planner_state row for this student: { completed_topic_keys, topic_progress }
   */
  constructor(mapRows = [], plannerState = null) {
    // engineSubject::engineTopic -> [plannerTopicKey, ...] (subjectSlug::topicTitle,
    // stage-agnostic — see _stripStage() below for why).
    this._reverseIndex = new Map();
    for (const row of mapRows) {
      for (const engineTopic of row.engine_topics || []) {
        const key = `${row.engine_subject}::${engineTopic}`;
        if (!this._reverseIndex.has(key)) this._reverseIndex.set(key, []);
        this._reverseIndex.get(key).push(`${row.subject_slug}::${row.topic_title}`);
      }
    }

    // Real topicProgress/completedTopicKeys keys are
    // `${subjectSlug}::${stageOrder}::${topicTitle}` (plannerEngine.ts's
    // topicKey()). This bridge's map only knows subjectSlug+topicTitle (a
    // topic title is assumed unique within a subject regardless of which
    // Blueprint stage it's grouped under — true for every subject checked
    // so far), so every real key gets its stageOrder segment stripped
    // before matching, exactly like plannerEngine.ts's own
    // `rest.join('::')` parsing of a topicKey back apart.
    const stripStage = (rawKey) => {
      const parts = rawKey.split('::');
      return parts.length >= 3 ? `${parts[0]}::${parts.slice(2).join('::')}` : rawKey;
    };

    this._completedSet = new Set((plannerState?.completed_topic_keys || []).map(stripStage));
    this._progressByKey = new Map();
    for (const [rawKey, progress] of Object.entries(plannerState?.topic_progress || {})) {
      this._progressByKey.set(stripStage(rawKey), progress);
    }
  }

  /**
   * @param {number} recentWindowMs how recent "just completed" means —
   *   callers pass SessionConstants.QUESTION_REQUEUE_COOLDOWN_MS (24h) to
   *   match the same "24-hour quarantine" language the Handshake spec
   *   itself uses, rather than this class inventing its own number.
   * @returns {{signal: 'none'|'due_critical'|'recently_completed', plannerTopicKey?: string, tier?: string}}
   *   'due_critical'       — a mapped Planner topic is an unresolved
   *                          critical gap, or a due mastery/forming
   *                          resurface, and was NOT just completed.
   *   'recently_completed' — a mapped Planner topic's last attempt is
   *                          within recentWindowMs — the 24h quarantine
   *                          this concept should apply.
   *   'none'               — no reviewed mapping exists yet (Mathematics/
   *                          Use of English today, or a not-yet-reviewed
   *                          topic in any subject), or a mapping exists
   *                          but isn't currently urgent either way.
   */
  getSignal(engineSubject, engineTopic, recentWindowMs) {
    const plannerKeys = this._reverseIndex.get(`${engineSubject}::${engineTopic}`);
    if (!plannerKeys || plannerKeys.length === 0) return { signal: 'none' };

    const now = Date.now();
    for (const key of plannerKeys) {
      const progress = this._progressByKey.get(key);
      const lastAttemptedAt = progress?.lastAttemptedAt ? new Date(progress.lastAttemptedAt).getTime() : null;
      const justCompleted = this._completedSet.has(key) && lastAttemptedAt && (now - lastAttemptedAt < recentWindowMs);
      if (justCompleted) return { signal: 'recently_completed', plannerTopicKey: key };
    }

    const todayIso = new Date(now).toISOString().slice(0, 10);
    for (const key of plannerKeys) {
      const progress = this._progressByKey.get(key);
      if (!progress) continue;
      if (progress.criticalGap) return { signal: 'due_critical', plannerTopicKey: key, tier: 'critical' };
      if ((progress.resurfaceDates || []).some(d => d <= todayIso)) {
        return { signal: 'due_critical', plannerTopicKey: key, tier: progress.tier };
      }
    }

    return { signal: 'none' };
  }
}

/** A PlannerBridge with no mapping and no state — the safe default when the Handshake hasn't been loaded (or has nothing to say), so every consumer can call getSignal() unconditionally without a null check. */
export const EMPTY_PLANNER_BRIDGE = new PlannerBridge([], null);
