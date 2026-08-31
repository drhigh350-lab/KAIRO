/**
 * Kairo — SupabaseSyncAdapter
 *
 * Bridges the offline-first engine (LocalStore, in-memory graph/profile)
 * with the real `kairo` schema in Supabase (see project migrations:
 * create_kairo_schema, kairo_rls_policies).
 *
 * Model: client talks to Supabase directly using the anon key; access
 * control is enforced entirely by RLS (kairo.students.auth_user_id =
 * auth.uid()), matching Option A of the architecture decision. There is
 * no anonymous path — every student row requires a signed-in auth user.
 *
 * Table map (all under the `kairo` schema, never `public`):
 *   kairo.students        <-> StudentProfile.js — every field on
 *                              StudentProfile.toJSON() has a matching
 *                              column (including the SJEE/Learning-State/
 *                              Comms/Learn module-state JSONB blobs and the
 *                              Student Intelligence Model §1 Identity
 *                              fields, added by migration
 *                              add_sjee_comms_learn_and_identity_columns_
 *                              to_students; last_frustrated_subject/
 *                              last_frustrated_at/avoidance_streaks added by
 *                              add_dashboard_circuit_breaker_columns_to_students
 *                              for RecommendationEngine's Kairo V1 Dashboard).
 *                              Keep _profileToRow/
 *                              _rowToProfile and this list in lockstep with
 *                              StudentProfile.toJSON() — a field missing
 *                              from either silently stops reaching Supabase.
 *   kairo.concepts        <-> ConceptNode.js (static fields)
 *   kairo.concept_states  <-> ConceptNode.js (per-student dynamic fields)
 *   kairo.questions       <-> qim/Question.js
 *   kairo.sessions        <-> session lifecycle (index.js) — pushed via
 *                              KairoEngine.endSession() queuing a
 *                              `{ type: 'session' }` sync item
 *   kairo.attempts        <-> per-attempt records (append-only)
 *   kairo.notifications   <-> read + mark-read only (pullNotifications,
 *                              markNotificationRead below). RLS grants this
 *                              table SELECT/UPDATE but no INSERT — rows are
 *                              meant to be created server-side, not by this
 *                              client adapter. This is distinct from
 *                              NotificationEngine.js's own local candidate
 *                              history, which round-trips through
 *                              kairo.students.notification_history instead.
 */

import { toLocalDateString, fromLocalDateString } from '../utils/helpers.js';

export class SupabaseSyncAdapter {
  constructor(supabaseClient, localStore) {
    this.supabase = supabaseClient;
    this.store = localStore;
    this.syncStatus = { lastSync: null, pendingCount: 0, status: 'idle' };
  }

  // All kairo.* queries go through this helper so the schema name is
  // never duplicated/mistyped across the file.
  _table(name) {
    return this.supabase.schema('kairo').from(name);
  }

  // ─────────────────────────────────────────────
  // Auth
  // ─────────────────────────────────────────────

  async signIn(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  }

  /**
   * `data.session` comes back null (not an error) whenever the project has
   * "Confirm email" turned on — the account exists but can't sign in until
   * the student clicks the link Supabase just sent. Callers must check
   * `data.session` themselves rather than assuming signUp() = signed in.
   */
  async signUp(email, password, metadata = {}, { emailRedirectTo } = {}) {
    const { data, error } = await this.supabase.auth.signUp({
      email, password,
      options: { data: metadata, ...(emailRedirectTo ? { emailRedirectTo } : {}) }
    });
    if (error) throw error;
    return data;
  }

  /** Re-sends the signup confirmation link — the only recovery path once the first one expires, is lost, or lands in spam. */
  async resendSignUpConfirmation(email, { emailRedirectTo } = {}) {
    const { error } = await this.supabase.auth.resend({
      type: 'signup',
      email,
      ...(emailRedirectTo ? { options: { emailRedirectTo } } : {}),
    });
    if (error) throw error;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  // ─────────────────────────────────────────────
  // Field mapping (camelCase JS <-> snake_case SQL)
  // ─────────────────────────────────────────────

  /**
   * StudentProfile.toJSON() -> kairo.students row. Every field this maps
   * has a real column (see migration add_sjee_comms_learn_and_identity_
   * columns_to_students) — this must stay in lockstep with both
   * StudentProfile.toJSON() and the live schema, or a field silently stops
   * reaching Supabase (exactly the gap this mapping used to have for the
   * SJEE/Learning-State/Comms/Learn fields and the SIM §1 Identity fields).
   */
  _profileToRow(profileData, authUserId) {
    return {
      auth_user_id: authUserId,
      name: profileData.name,
      email: profileData.email || null,
      avatar: profileData.avatar || null,
      exam_date: profileData.examDate ? new Date(profileData.examDate).toISOString().slice(0, 10) : null,
      target_subjects: profileData.targetSubjects || [],
      target_course: profileData.targetCourse || null,
      diagnostic_completed: !!profileData.diagnosticCompleted,
      target_university: profileData.targetUniversity || null,
      daily_question_goal: profileData.dailyQuestionGoal ?? null,
      macro_state: profileData.macroState || 'orienting',
      macro_state_history: profileData.macroStateHistory || [],
      response_time_baselines: profileData.responseTimeBaselines || {},
      elite_score_history: profileData.eliteScoreHistory || [],
      last_session_at: profileData.lastSessionAt ? new Date(profileData.lastSessionAt).toISOString() : null,
      total_questions_answered: profileData.totalQuestionsAnswered || 0,
      total_correct: profileData.totalCorrect || 0,
      streak_current_momentum: profileData.streakData?.currentMomentum || 0,
      streak_protected_gaps_used: profileData.streakData?.protectedGapsUsed || 0,
      // MomentumStreak.recordSession() stores this as a raw epoch-ms number
      // (Date.now()), not an ISO string — sending that straight into a
      // `date` column made Postgres reject the whole PATCH with "date/time
      // field value out of range", which silently broke every profile sync
      // after every single session (score/streak/badges never actually
      // reached kairo.students, even though the request otherwise succeeded).
      // toLocalDateString() (not .toISOString().slice(0,10), which converts
      // to UTC first) — a session completed shortly after local midnight in
      // a positive UTC offset (Nigeria, UTC+1) would otherwise store the
      // previous day, corrupting streak continuity right at the boundary
      // where it matters most.
      streak_last_session_date: profileData.streakData?.lastSessionDate ? toLocalDateString(profileData.streakData.lastSessionDate) : null,
      streak_window_sessions: profileData.streakData?.windowSessions || [],
      streak_freezes_available: profileData.streakData?.freezesAvailable || 0,
      streak_freezes_used: profileData.streakData?.freezesUsed || 0,
      streak_longest_momentum: profileData.streakData?.longestMomentum || 0,
      at_risk_triggered_at: profileData.atRiskTriggeredAt ? new Date(profileData.atRiskTriggeredAt).toISOString() : null,
      recovery_session_count: profileData.recoverySessionCount || 0,
      // Kairo V1 Dashboard — RecommendationEngine's Anti-Fatigue Circuit
      // Breaker / Avoidance Tracker (see recordSessionOutcome()/
      // recordSprintDodged()).
      last_frustrated_subject: profileData.lastFrustratedSubject || null,
      last_frustrated_at: profileData.lastFrustratedAt ? new Date(profileData.lastFrustratedAt).toISOString() : null,
      avoidance_streaks: profileData.avoidanceStreaks || {},
      notification_history: profileData.notificationHistory || [],
      completed_challenges: profileData.completedChallenges || [],
      // Kairo Points (formerly "XP") — a strictly additive ledger, distinct
      // from Kairo Score. See ProgressionSystem.js's LevelSystem for the
      // full rationale. kairo_points_progress is the "already credited"
      // tracking (concept/day/topic ids) that makes it monotonic.
      kairo_points: profileData.kairoPoints || 0,
      kairo_points_progress: profileData.kairoPointsProgress || { reinforcedConceptIds: [], heldConceptIds: [], consistencyDays: [], masteredTopics: [] },
      badges: profileData.badges || [],
      preferences: profileData.preferences || null,

      // Student Intelligence Model §1 — Identity
      date_of_birth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().slice(0, 10) : null,
      exam_type: profileData.examType || 'UTME',
      exam_year: profileData.examYear ?? null,
      target_utme_score: profileData.targetUTMEScore ?? null,
      registration_date: profileData.registrationDate ? new Date(profileData.registrationDate).toISOString() : new Date().toISOString(),
      preferred_study_duration_min: profileData.preferredStudyDurationMin ?? null,
      preferred_study_period: profileData.preferredStudyPeriod || null,
      device: profileData.device || null,
      referral_source: profileData.referralSource || null,
      parent_guardian_contact: profileData.parentGuardianContact || null,
      language_region: profileData.languageRegion || null,

      // Student Intelligence Model §5 — Learning State
      learning_state: profileData.learningState || 'new_learner',
      learning_state_history: profileData.learningStateHistory || [],

      // Student Journey & Engagement Engine
      journey_stage: profileData.journeyStage || 'arrival',
      journey_stage_history: profileData.journeyStageHistory || [],
      notification_orchestrator: profileData.notificationOrchestrator || null,
      re_engagement: profileData.reEngagement || null,
      cross_module_milestones: profileData.crossModuleMilestones || null,
      continuation: profileData.continuation || null,

      // Notifications & Communication Systems
      comms: profileData.comms || null,

      // Learn Module
      learn: profileData.learn || null,

      updated_at: new Date().toISOString()
    };
  }

  _rowToProfile(row) {
    if (!row) return null;
    return {
      studentId: row.id,
      authUserId: row.auth_user_id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      examDate: row.exam_date ? new Date(row.exam_date).getTime() : null,
      targetSubjects: row.target_subjects || [],
      targetCourse: row.target_course,
      diagnosticCompleted: !!row.diagnostic_completed,
      targetUniversity: row.target_university,
      dailyQuestionGoal: row.daily_question_goal,
      macroState: row.macro_state,
      macroStateHistory: row.macro_state_history || [],
      responseTimeBaselines: row.response_time_baselines || {},
      eliteScoreHistory: row.elite_score_history || [],
      lastSessionAt: row.last_session_at ? new Date(row.last_session_at).getTime() : null,
      totalQuestionsAnswered: row.total_questions_answered,
      totalCorrect: row.total_correct,
      streakData: {
        currentMomentum: row.streak_current_momentum,
        protectedGapsUsed: row.streak_protected_gaps_used,
        // Real bug, confirmed live: kept as the raw "YYYY-MM-DD" string
        // Postgres returns for a `date` column, but MomentumStreak.
        // recordSession() does raw arithmetic (daysBetween: `(a - b) /
        // msPerDay`) against this value — subtracting a string from a
        // number coerces to NaN, not a parsed date. NaN satisfies no
        // numeric comparison in recordSession()'s gap-handling branches,
        // so every one of them falls through to "genuine break," resetting
        // a real streak to 1 on the very next session after any reload/
        // sign-in that pulled this row — even a same-day-consecutive one.
        // fromLocalDateString() restores the epoch-ms number type a fresh
        // local session's lastSessionDate always has.
        lastSessionDate: row.streak_last_session_date ? fromLocalDateString(row.streak_last_session_date) : null,
        windowSessions: row.streak_window_sessions || [],
        freezesAvailable: row.streak_freezes_available || 0,
        freezesUsed: row.streak_freezes_used || 0,
        longestMomentum: row.streak_longest_momentum || 0
      },
      atRiskTriggeredAt: row.at_risk_triggered_at ? new Date(row.at_risk_triggered_at).getTime() : null,
      recoverySessionCount: row.recovery_session_count,
      lastFrustratedSubject: row.last_frustrated_subject || null,
      lastFrustratedAt: row.last_frustrated_at ? new Date(row.last_frustrated_at).getTime() : null,
      avoidanceStreaks: row.avoidance_streaks || {},
      notificationHistory: row.notification_history || [],
      completedChallenges: row.completed_challenges || [],
      kairoPoints: row.kairo_points || 0,
      kairoPointsProgress: row.kairo_points_progress || { reinforcedConceptIds: [], heldConceptIds: [], consistencyDays: [], masteredTopics: [] },
      badges: row.badges || [],
      preferences: row.preferences || null,

      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth).getTime() : null,
      examType: row.exam_type,
      examYear: row.exam_year,
      targetUTMEScore: row.target_utme_score,
      registrationDate: row.registration_date ? new Date(row.registration_date).getTime() : null,
      preferredStudyDurationMin: row.preferred_study_duration_min,
      preferredStudyPeriod: row.preferred_study_period,
      device: row.device,
      referralSource: row.referral_source,
      parentGuardianContact: row.parent_guardian_contact,
      languageRegion: row.language_region,

      learningState: row.learning_state,
      learningStateHistory: row.learning_state_history || [],

      journeyStage: row.journey_stage,
      journeyStageHistory: row.journey_stage_history || [],
      notificationOrchestrator: row.notification_orchestrator,
      reEngagement: row.re_engagement,
      crossModuleMilestones: row.cross_module_milestones,
      continuation: row.continuation,

      comms: row.comms,
      learn: row.learn,

      createdAt: row.created_at ? new Date(row.created_at).getTime() : null,
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : null
    };
  }

  _attemptToRow(attempt, studentId) {
    return {
      student_id: studentId,
      session_id: attempt.sessionId || null,
      concept_id: attempt.conceptId,
      question_id: attempt.questionId,
      correct: attempt.correct,
      selected_option: attempt.selectedOption || null,
      correct_option: attempt.correctOption || null,
      response_time_ms: attempt.responseTimeMs,
      question_difficulty: attempt.difficulty || null,
      error_tag: attempt.errorTag || null,
      answered_at: attempt.timestamp ? new Date(attempt.timestamp).toISOString() : new Date().toISOString()
    };
  }

  _conceptStateToRow(node, studentId) {
    return {
      student_id: studentId,
      concept_id: node.id,
      retention_state: node.retentionState,
      confidence_score: node.confidenceScore,
      last_seen_at: node.lastSeenAt ? new Date(node.lastSeenAt).toISOString() : null,
      decay_estimate: node.decayEstimate,
      next_review_estimate: node.nextReviewEstimate ? new Date(node.nextReviewEstimate).toISOString() : null,
      error_pattern_tags: node.errorPatternTags instanceof Map
        ? Object.fromEntries(node.errorPatternTags)
        : (node.errorPatternTags || {}),
      reinforced_cycles: node.reinforcedCycles,
      personal_decay_rate: node.personalDecayRate,
      updated_at: new Date().toISOString()
    };
  }

  // ─────────────────────────────────────────────
  // Students (kairo.students)
  // ─────────────────────────────────────────────

  /**
   * Get this user's kairo.students row, creating it if it doesn't exist yet.
   * Every write requires auth_user_id = auth.uid() per RLS, so we always
   * resolve the current user first.
   */
  async ensureStudentRow(authUserId, initialProfileData) {
    const { data: existing, error: fetchErr } = await this._table('students')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    if (existing) return this._rowToProfile(existing);

    const { data: created, error: insertErr } = await this._table('students')
      .insert(this._profileToRow(initialProfileData, authUserId))
      .select()
      .single();
    if (insertErr) throw insertErr;

    // Flagged so connectSupabase() can tell callers (e.g. a first-time Google
    // sign-in, which never goes through the explicit signUp() step) that this
    // student has no real profile yet and still needs onboarding — otherwise
    // indistinguishable from a returning student's row.
    return { ...this._rowToProfile(created), _isNewStudent: true };
  }

  async pushProfile(profileData, authUserId, studentId) {
    const { error } = await this._table('students')
      .update(this._profileToRow(profileData, authUserId))
      .eq('id', studentId);
    if (error) throw error;
    return true;
  }

  async pullProfile(studentId) {
    const { data, error } = await this._table('students')
      .select('*')
      .eq('id', studentId)
      .single();
    if (error) throw error;
    return this._rowToProfile(data);
  }

  // ─────────────────────────────────────────────
  // Concept states (kairo.concept_states) — per-student dynamic state
  // ─────────────────────────────────────────────

  async pushConceptStates(nodes, studentId) {
    if (!nodes || nodes.length === 0) return 0;
    const rows = nodes.map(n => this._conceptStateToRow(n, studentId));
    const { error } = await this._table('concept_states').upsert(rows, { onConflict: 'student_id,concept_id' });
    if (error) throw error;
    return rows.length;
  }

  async pullConceptStates(studentId) {
    const { data, error } = await this._table('concept_states')
      .select('*')
      .eq('student_id', studentId);
    if (error) throw error;
    return data || [];
  }

  /**
   * Concept-scoped, not time-scoped — the counterpart pullConceptStates()/
   * pullAttempts() rely on `since`/an already-populated local graph, which
   * both silently fail to backfill a concept's real history the first time
   * it's ever loaded on a device (a fresh sign-in, a new device, or right
   * after sign-out's own IndexedDB purge): pullAttempts(since) only ever
   * asks for attempts newer than the student's last completed session — by
   * definition excluding everything historical — and SyncManager's own
   * merge (_applyRemoteConceptStates → applyRemoteConceptStates) silently
   * skips any concept_states/attempts row whose concept isn't already in
   * the local graph, with nothing ever re-fetching it afterward. Called
   * from loadContentCatalog() itself, right when these concepts first
   * become real ConceptNode instances locally, so rehydration doesn't
   * depend on winning a race against — or ever re-running — a separate
   * sync() call at all.
   */
  async pullConceptStatesForConcepts(studentId, conceptIds) {
    if (!conceptIds || conceptIds.length === 0) return [];
    const { data, error } = await this._table('concept_states')
      .select('*')
      .eq('student_id', studentId)
      .in('concept_id', conceptIds);
    if (error) throw error;
    return data || [];
  }

  // ─────────────────────────────────────────────
  // Attempts (kairo.attempts) — append-only log
  // ─────────────────────────────────────────────

  async pushAttempts(attempts, studentId) {
    if (!attempts || attempts.length === 0) return 0;
    const rows = attempts.map(a => this._attemptToRow(a, studentId));
    const { error } = await this._table('attempts').insert(rows);
    if (error) throw error;
    return rows.length;
  }

  async pullAttempts(studentId, since = null) {
    let query = this._table('attempts')
      .select('*')
      .eq('student_id', studentId)
      .order('answered_at', { ascending: true });

    if (since) {
      query = query.gt('answered_at', new Date(since).toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /** Concept-scoped counterpart to pullAttempts() — see pullConceptStatesForConcepts()'s doc comment for why this exists as a separate, non-time-limited path. */
  async pullAttemptsForConcepts(studentId, conceptIds) {
    if (!conceptIds || conceptIds.length === 0) return [];
    const { data, error } = await this._table('attempts')
      .select('*')
      .eq('student_id', studentId)
      .in('concept_id', conceptIds)
      .order('answered_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  // ─────────────────────────────────────────────
  // Sessions (kairo.sessions)
  // ─────────────────────────────────────────────

  async pushSession(session, studentId) {
    const { error } = await this._table('sessions').upsert({
      id: session.id,
      student_id: studentId,
      mode: session.mode || 'standard',
      plan: session.plan || [],
      questions_answered: session.questionsAnswered || 0,
      correct_count: session.correctCount || 0,
      elite_score: session.eliteScore || null,
      started_at: new Date(session.startedAt).toISOString(),
      completed_at: session.completedAt ? new Date(session.completedAt).toISOString() : null
    });
    if (error) throw error;
    return true;
  }

  /**
   * Real past sessions, oldest first — connectSupabase() had no way to pull
   * these back down at all (pushSession() above is write-only), so
   * profile.sessions only ever held whatever this engine instance completed
   * since connecting. Every reload silently reset it to empty, which fed
   * straight into Today's Progress, EliteScore's consistency math, Macro
   * State, and Level/XP — all quietly wrong immediately after any refresh.
   */
  async fetchSessions(studentId, { limit = 200 } = {}) {
    const { data, error } = await this._table('sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(this._rowToSession).reverse();
  }

  _rowToSession(row) {
    return {
      sessionId: row.id,
      mode: row.mode,
      plan: row.plan || [],
      questionsAnswered: row.questions_answered || 0,
      correctCount: row.correct_count || 0,
      eliteScore: row.elite_score || null,
      startedAt: row.started_at ? new Date(row.started_at).getTime() : null,
      completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null
    };
  }

  // ─────────────────────────────────────────────
  // CBT exam results (kairo.cbt_results) — the full per-question, per-subject
  // breakdown of a finished mock, distinct from the lightweight kairo.sessions
  // row CBTExamMode already queues. This table existed in the schema with
  // real RLS policies from the start but nothing ever wrote to it, so a
  // student had no way to see a log of past exams or performance over time —
  // finish() only ever showed that one exam's summary, then it was gone.
  // ─────────────────────────────────────────────

  async pushCbtResults(result, studentId) {
    const { error } = await this._table('cbt_results').insert({
      id: result.id,
      student_id: studentId,
      subjects: result.subjects || [],
      question_results: result.questionResults || [],
      by_subject: result.bySubject || [],
      time_analysis: result.timeAnalysis || null,
      total_questions: result.totalQuestions,
      score: result.score,
      max_score: result.maxScore,
      percentage: result.percentage,
      started_at: new Date(result.startedAt).toISOString(),
      completed_at: new Date(result.completedAt).toISOString()
    });
    if (error) throw error;
    return true;
  }

  async fetchCbtResults(studentId, { limit = 20 } = {}) {
    const { data, error } = await this._table('cbt_results')
      .select('*')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  // ─────────────────────────────────────────────
  // Notifications (kairo.notifications) — read + mark-read only.
  // RLS on this table grants SELECT and UPDATE to the owning student but
  // deliberately no INSERT policy — rows are meant to be created
  // server-side (e.g. a future scheduled job reading concept_states), not
  // fabricated by the client. There is no pushNotifications() here on
  // purpose; adding one would just fail against live RLS.
  // ─────────────────────────────────────────────

  async pullNotifications(studentId, { unreadOnly = false } = {}) {
    let query = this._table('notifications')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (unreadOnly) query = query.is('read_at', null);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async markNotificationRead(notificationId) {
    const { error } = await this._table('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);
    if (error) throw error;
    return true;
  }

  // ─────────────────────────────────────────────
  // Read-only shared content (kairo.concepts, kairo.questions)
  // ─────────────────────────────────────────────

  async fetchConcepts(filter = {}) {
    let query = this._table('concepts').select('*');
    if (filter.subject) query = query.eq('subject', filter.subject);
    if (filter.topic) query = query.eq('topic', filter.topic);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(row => this._rowToConcept(row));
  }

  async fetchQuestions(filter = {}) {
    let query = this._table('questions').select('*').eq('lifecycle_state', 'live');
    if (filter.subject) query = query.eq('subject', filter.subject);
    if (filter.topic) query = query.eq('topic', filter.topic);
    if (filter.conceptId) query = query.contains('concepts_tested', [{ conceptId: filter.conceptId }]);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(row => this._rowToQuestion(row));
  }

  /**
   * The Planner Handshake's static half — every REVIEWED subjectSlug/
   * topicTitle -> engine subject/topic row (see PlannerBridge.js and
   * scripts/generate-planner-topic-map-candidates.js). Small (~78 rows for
   * the sciences today) and rarely changes, so callers fetch this once per
   * session and cache it, not per lookup. 'candidate' rows are excluded —
   * a generator's unreviewed proposal must never influence a real
   * recommendation.
   */
  async fetchPlannerTopicMap() {
    const { data, error } = await this._table('planner_topic_map').select('*').eq('confidence', 'reviewed');
    if (error) throw error;
    return data || [];
  }

  /**
   * The Planner Handshake's per-student half — one student's real
   * completed_topic_keys/topic_progress, the same shape
   * kairo-app/src/lib/planner/plannerApi.ts already upserts into this
   * table on every Planner save. Null if the student has never used the
   * Planner (no row yet), which PlannerBridge treats identically to an
   * empty one.
   */
  async fetchPlannerState(studentId) {
    const { data, error } = await this._table('planner_state')
      .select('completed_topic_keys, topic_progress')
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  /**
   * kairo.concepts row -> ConceptNode constructor shape. IDs come straight
   * from the row — they're already the canonical conceptId() hash computed
   * at seed time, so this never recomputes or re-derives them.
   */
  _rowToConcept(row) {
    return {
      id: row.id,
      name: row.name,
      subject: row.subject,
      topic: row.topic,
      subtopic: row.subtopic,
      difficultyWeight: row.difficulty_weight,
      dependencyIds: row.dependency_ids || [],
      questionPoolIds: row.question_pool_ids || []
    };
  }

  /**
   * kairo.questions row -> Question constructor shape (qim/Question.js).
   * Keep this in lockstep with Question.toJSON()/the live schema, same as
   * _profileToRow/_rowToProfile — a field missing from either silently
   * drops it for every question fetched from Supabase.
   */
  _rowToQuestion(row) {
    return {
      id: row.id,
      subject: row.subject,
      topic: row.topic,
      subtopic: row.subtopic,
      learningObjective: row.learning_objective,
      conceptsTested: row.concepts_tested || [],
      prerequisiteConcepts: row.prerequisite_concepts || [],
      difficultyRating: row.difficulty_rating,
      cognitiveLevel: row.cognitive_level,
      estimatedSolvingTimeSec: row.estimated_solving_time_sec,
      readingLoad: row.reading_load,
      calculationLoad: row.calculation_load,
      distractors: row.distractors || [],
      skillsAssessed: row.skills_assessed || [],
      source: row.source,
      year: row.year,
      examBody: row.exam_body,
      relatedQuestionIds: row.related_question_ids || [],
      stem: row.stem,
      options: row.options || [],
      correctOption: row.correct_option,
      explanation: row.explanation,
      distractorRationale: row.distractor_rationale,
      lifecycleState: row.lifecycle_state,
      empiricalStats: row.empirical_stats || { totalAttempts: 0, correctCount: 0, avgResponseTimeMs: 0, distractorSelectionCounts: {} },
      // Batch 2 (pre-launch bug fix): public Supabase Storage URL (the
      // question-diagrams bucket) for a diagram this question's stem
      // references — null for the vast majority of questions that have none.
      imageUrl: row.image_url || null
    };
  }

  // ─────────────────────────────────────────────
  // Full bidirectional sync
  // Push-then-pull, matching SyncManager's "most recent wins for state,
  // all attempts retained" conflict rule.
  // ─────────────────────────────────────────────

  async fullSync({ authUserId, studentId, profile, conceptNodes, pendingAttempts, pendingSessions = [], pendingCbtResults = [], since }) {
    this.syncStatus.status = 'syncing';

    // Profile is foundational — every other push assumes studentId/
    // authUserId are already valid, so a failure here aborts the whole
    // sync, same as always.
    try {
      await this.pushProfile(profile, authUserId, studentId);
    } catch (err) {
      this.syncStatus.status = 'error';
      this.syncStatus.error = err.message;
      throw err;
    }

    try {
      await this.pushConceptStates(conceptNodes, studentId);
    } catch (err) {
      console.error('pushConceptStates failed (will retry next sync):', err);
    }

    // Sessions and CBT results push before attempts, and each item is
    // isolated (caught independently), on purpose: they're the primary
    // "did this happen and what was the outcome" record, and a single
    // failure — anywhere — must never be able to silently take another,
    // already-succeeded item down with it. Previously this ran attempts
    // first as one big batch in the same try/catch as everything else, so
    // a single rejected attempt (e.g. a CBT question the student left
    // unanswered, correctly rejected by kairo.attempts' anti-cheat
    // trigger for an implausible 0ms response time — see
    // CBTExamMode.finish()'s fix) aborted the entire sync and silently
    // erased that exam's own session record and score along with it.
    const failedSessions = [];
    for (const session of pendingSessions) {
      try {
        await this.pushSession(session, studentId);
      } catch (err) {
        console.error('pushSession failed:', session.id, err);
        failedSessions.push(session);
      }
    }

    const failedCbtResults = [];
    for (const result of pendingCbtResults) {
      try {
        await this.pushCbtResults(result, studentId);
      } catch (err) {
        console.error('pushCbtResults failed:', result.id, err);
        failedCbtResults.push(result);
      }
    }

    let failedAttempts = [];
    try {
      await this.pushAttempts(pendingAttempts, studentId);
    } catch (err) {
      // A single batch insert — one bad row fails all of them together.
      // Isolated here so it can no longer take the sessions/cbt_results
      // pushed above, or the profile already pushed before them, with it.
      console.error('pushAttempts failed (whole batch, will retry next sync):', err);
      failedAttempts = pendingAttempts;
    }

    let remoteProfile = null, remoteConceptStates = [], remoteAttempts = [];
    try {
      remoteProfile = await this.pullProfile(studentId);
      remoteConceptStates = await this.pullConceptStates(studentId);
      remoteAttempts = await this.pullAttempts(studentId, since);
    } catch (err) {
      // Everything above already landed (or was recorded as failed) —
      // a pull-back failure shouldn't undo that or be reported as if the
      // pushes themselves failed.
      console.error('Pull-back after push failed:', err);
    }

    const pendingCount = failedSessions.length + failedCbtResults.length + failedAttempts.length;
    this.syncStatus.lastSync = Date.now();
    this.syncStatus.pendingCount = pendingCount;
    this.syncStatus.status = pendingCount > 0 ? 'partial' : 'synced';

    return {
      remoteProfile, remoteConceptStates, remoteAttempts,
      syncedAt: this.syncStatus.lastSync,
      failed: { sessions: failedSessions, cbtResults: failedCbtResults, attempts: failedAttempts }
    };
  }

  getSyncStatus() {
    return { ...this.syncStatus };
  }
}
