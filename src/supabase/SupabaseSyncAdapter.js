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
 *   kairo.students        <-> StudentProfile.js
 *   kairo.concepts        <-> ConceptNode.js (static fields)
 *   kairo.concept_states  <-> ConceptNode.js (per-student dynamic fields)
 *   kairo.questions       <-> qim/Question.js
 *   kairo.sessions        <-> session lifecycle (index.js)
 *   kairo.attempts        <-> per-attempt records (append-only)
 *   kairo.notifications   <-> NotificationEngine.js
 */

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

  async signUp(email, password, metadata = {}) {
    const { data, error } = await this.supabase.auth.signUp({
      email, password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
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

  _profileToRow(profileData, authUserId) {
    return {
      auth_user_id: authUserId,
      name: profileData.name,
      exam_date: profileData.examDate ? new Date(profileData.examDate).toISOString().slice(0, 10) : null,
      target_subjects: profileData.targetSubjects || [],
      target_course: profileData.targetCourse || null,
      target_university: profileData.targetUniversity || null,
      macro_state: profileData.macroState || 'orienting',
      macro_state_history: profileData.macroStateHistory || [],
      response_time_baselines: profileData.responseTimeBaselines || {},
      elite_score_history: profileData.eliteScoreHistory || [],
      last_session_at: profileData.lastSessionAt ? new Date(profileData.lastSessionAt).toISOString() : null,
      total_questions_answered: profileData.totalQuestionsAnswered || 0,
      total_correct: profileData.totalCorrect || 0,
      streak_current_momentum: profileData.streakData?.currentMomentum || 0,
      streak_protected_gaps_used: profileData.streakData?.protectedGapsUsed || 0,
      streak_last_session_date: profileData.streakData?.lastSessionDate || null,
      streak_window_sessions: profileData.streakData?.windowSessions || [],
      at_risk_triggered_at: profileData.atRiskTriggeredAt ? new Date(profileData.atRiskTriggeredAt).toISOString() : null,
      recovery_session_count: profileData.recoverySessionCount || 0,
      updated_at: new Date().toISOString()
    };
  }

  _rowToProfile(row) {
    if (!row) return null;
    return {
      studentId: row.id,
      authUserId: row.auth_user_id,
      name: row.name,
      examDate: row.exam_date ? new Date(row.exam_date).getTime() : null,
      targetSubjects: row.target_subjects || [],
      targetCourse: row.target_course,
      targetUniversity: row.target_university,
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
        lastSessionDate: row.streak_last_session_date,
        windowSessions: row.streak_window_sessions || []
      },
      atRiskTriggeredAt: row.at_risk_triggered_at ? new Date(row.at_risk_triggered_at).getTime() : null,
      recoverySessionCount: row.recovery_session_count,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : null
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

    return this._rowToProfile(created);
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

  // ─────────────────────────────────────────────
  // Read-only shared content (kairo.concepts, kairo.questions)
  // ─────────────────────────────────────────────

  async fetchConcepts(filter = {}) {
    let query = this._table('concepts').select('*');
    if (filter.subject) query = query.eq('subject', filter.subject);
    if (filter.topic) query = query.eq('topic', filter.topic);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async fetchQuestions(filter = {}) {
    let query = this._table('questions').select('*').eq('lifecycle_state', 'live');
    if (filter.subject) query = query.eq('subject', filter.subject);
    if (filter.topic) query = query.eq('topic', filter.topic);
    if (filter.conceptId) query = query.contains('concepts_tested', [{ conceptId: filter.conceptId }]);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // ─────────────────────────────────────────────
  // Full bidirectional sync
  // Push-then-pull, matching SyncManager's "most recent wins for state,
  // all attempts retained" conflict rule.
  // ─────────────────────────────────────────────

  async fullSync({ authUserId, studentId, profile, conceptNodes, pendingAttempts, since }) {
    this.syncStatus.status = 'syncing';
    try {
      await this.pushProfile(profile, authUserId, studentId);
      await this.pushConceptStates(conceptNodes, studentId);
      await this.pushAttempts(pendingAttempts, studentId);

      const remoteProfile = await this.pullProfile(studentId);
      const remoteConceptStates = await this.pullConceptStates(studentId);
      const remoteAttempts = await this.pullAttempts(studentId, since);

      this.syncStatus.lastSync = Date.now();
      this.syncStatus.pendingCount = 0;
      this.syncStatus.status = 'synced';

      return { remoteProfile, remoteConceptStates, remoteAttempts, syncedAt: this.syncStatus.lastSync };
    } catch (err) {
      this.syncStatus.status = 'error';
      this.syncStatus.error = err.message;
      throw err;
    }
  }

  getSyncStatus() {
    return { ...this.syncStatus };
  }
}
