/**
 * Kairo — AdminCMS
 * Content management, analytics, and student monitoring for the TECHMED team.
 * Runs server-side or from an admin dashboard using the Supabase SERVICE
 * ROLE key (not the anon key) — every method here bypasses RLS by design,
 * since only the curriculum/admin team should ever call this class.
 *
 * All tables are in the `kairo` schema, mirroring the shapes in
 * src/qim/Question.js, src/core/ConceptNode.js, and src/student/StudentProfile.js.
 */

export class AdminCMS {
  constructor(supabaseServiceClient) {
    this.supabase = supabaseServiceClient;
  }

  _table(name) {
    return this.supabase.schema('kairo').from(name);
  }

  // ═══════════════════════════════════════════════════════════════
  // CONTENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Upload a batch of questions from CSV/JSON.
   * Input shape matches qim/Question.js's constructor fields (camelCase);
   * this maps them to kairo.questions' actual columns (snake_case).
   */
  async bulkUploadQuestions(questions) {
    const formatted = questions.map(q => ({
      id: q.id || `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      subject: q.subject,
      topic: q.topic,
      subtopic: q.subtopic || null,
      learning_objective: q.learningObjective || null,
      concepts_tested: q.conceptsTested || [],
      prerequisite_concepts: q.prerequisiteConcepts || [],
      difficulty_rating: q.difficultyRating || 1,
      cognitive_level: q.cognitiveLevel || 'recall',
      estimated_solving_time_sec: q.estimatedSolvingTimeSec || 30,
      reading_load: q.readingLoad || 'low',
      calculation_load: q.calculationLoad || 'none',
      distractors: q.distractors || [],
      skills_assessed: q.skillsAssessed || [],
      source: q.source || 'techmed_authored',
      year: q.year || null,
      exam_body: q.examBody || 'JAMB',
      related_question_ids: q.relatedQuestionIds || [],
      stem: q.stem,
      options: q.options || [],
      correct_option: q.correctOption,
      explanation: q.explanation || null,
      lifecycle_state: q.lifecycleState || 'imported',
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await this._table('questions')
      .insert(formatted)
      .select();

    if (error) throw error;
    return { uploaded: data.length, questions: data };
  }

  /**
   * Create or update a concept node in the curriculum (static Content
   * Map fields only — kairo.concepts, not the per-student kairo.concept_states).
   */
  async upsertConcept(concept) {
    const { data, error } = await this._table('concepts')
      .upsert({
        id: concept.id,
        name: concept.name,
        subject: concept.subject,
        topic: concept.topic,
        subtopic: concept.subtopic || null,
        difficulty_weight: concept.difficultyWeight ?? 1.0,
        dependency_ids: concept.dependencyIds || [],
        question_pool_ids: concept.questionPoolIds || [],
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;
    return data[0];
  }

  /**
   * Get all questions with filtering.
   */
  async getQuestions({ subject, topic, subtopic, difficultyRating, lifecycleState, limit = 100, offset = 0 } = {}) {
    let query = this._table('questions').select('*');
    if (subject) query = query.eq('subject', subject);
    if (topic) query = query.eq('topic', topic);
    if (subtopic) query = query.eq('subtopic', subtopic);
    if (difficultyRating) query = query.eq('difficulty_rating', difficultyRating);
    if (lifecycleState) query = query.eq('lifecycle_state', lifecycleState);

    const { data, error } = await query.range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  }

  // ═══════════════════════════════════════════════════════════════
  // ANALYTICS
  // ═══════════════════════════════════════════════════════════════

  async getPlatformAnalytics({ startDate, endDate }) {
    // Active students (by last update to their profile)
    const { count: activeStudents, error: e1 } = await this._table('students')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', startDate)
      .lte('updated_at', endDate);
    if (e1) throw e1;

    // Total sessions
    const { count: totalSessions, error: e2 } = await this._table('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('completed_at', startDate)
      .lte('completed_at', endDate);
    if (e2) throw e2;

    // Total attempts
    const { count: totalAttempts, error: e3 } = await this._table('attempts')
      .select('*', { count: 'exact', head: true })
      .gte('answered_at', startDate)
      .lte('answered_at', endDate);
    if (e3) throw e3;

    // Average accuracy
    const { data: accuracyData, error: e4 } = await this._table('attempts')
      .select('correct')
      .gte('answered_at', startDate)
      .lte('answered_at', endDate);
    if (e4) throw e4;
    const avgAccuracy = accuracyData?.length > 0
      ? Math.round((accuracyData.filter(a => a.correct).length / accuracyData.length) * 100)
      : 0;

    // Subject distribution — attempts don't carry `subject` directly, so
    // this joins through concept_id -> kairo.concepts.subject.
    const { data: attemptConceptIds, error: e5 } = await this._table('attempts')
      .select('concept_id')
      .gte('answered_at', startDate)
      .lte('answered_at', endDate);
    if (e5) throw e5;

    const subjects = {};
    if (attemptConceptIds?.length > 0) {
      const uniqueIds = [...new Set(attemptConceptIds.map(a => a.concept_id))];
      const { data: conceptRows, error: e6 } = await this._table('concepts')
        .select('id, subject')
        .in('id', uniqueIds);
      if (e6) throw e6;

      const subjectById = Object.fromEntries((conceptRows || []).map(c => [c.id, c.subject]));
      for (const a of attemptConceptIds) {
        const subj = subjectById[a.concept_id] || 'unknown';
        subjects[subj] = (subjects[subj] || 0) + 1;
      }
    }

    return {
      period: { startDate, endDate },
      activeStudents,
      totalSessions,
      totalAttempts,
      avgAccuracy,
      subjectDistribution: subjects
    };
  }

  async getStudentAnalytics(studentId) {
    const { data: profile, error: e1 } = await this._table('students')
      .select('*')
      .eq('id', studentId)
      .single();
    if (e1) throw e1;

    const { data: attempts, error: e2 } = await this._table('attempts')
      .select('*')
      .eq('student_id', studentId)
      .order('answered_at', { ascending: false })
      .limit(100);
    if (e2) throw e2;

    const { data: sessions, error: e3 } = await this._table('sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false })
      .limit(30);
    if (e3) throw e3;

    // Error pattern analysis
    const errorTags = {};
    for (const a of attempts || []) {
      if (a.error_tag) {
        errorTags[a.error_tag] = (errorTags[a.error_tag] || 0) + 1;
      }
    }

    return {
      profile,
      recentAttempts: attempts,
      recentSessions: sessions,
      errorPatternBreakdown: errorTags,
      totalAttempts: attempts?.length || 0,
      recentAccuracy: attempts?.length > 0
        ? Math.round((attempts.filter(a => a.correct).length / attempts.length) * 100)
        : 0
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // LEADERBOARD ADMIN
  // ═══════════════════════════════════════════════════════════════

  /**
   * NOTE: this method assumes a `kairo.leaderboard_segments` table that
   * does not exist yet — no migration has created it. It is left here,
   * clearly flagged, rather than silently invented as a real feature.
   * The segmented-leaderboard logic itself (SegmentedLeaderboard,
   * UniversityLeaderboard in src/leaderboard/LeaderboardSystem.js)
   * currently runs in-memory only. Wiring this up is a real product +
   * schema decision (what counts as a "tier," how elite_score is
   * actually computed/stored) that hasn't been made yet — see the
   * open item in docs/SUPABASE_SETUP.md.
   */
  async updateLeaderboards() {
    throw new Error(
      'updateLeaderboards() is not wired to a real table yet — kairo.leaderboard_segments ' +
      'does not exist. This needs a schema + product decision before it can run against ' +
      'live data. See docs/SUPABASE_SETUP.md "What is NOT done yet".'
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // CONTENT QUALITY
  // ═══════════════════════════════════════════════════════════════

  async getQuestionQualityReport() {
    // Find questions with high error rates (potential quality issues)
    const { data, error } = await this._table('attempts')
      .select('question_id, correct, error_tag')
      .not('question_id', 'is', null);
    if (error) throw error;

    const byQuestion = {};
    for (const a of data || []) {
      if (!byQuestion[a.question_id]) {
        byQuestion[a.question_id] = { total: 0, correct: 0, errors: {} };
      }
      byQuestion[a.question_id].total++;
      if (a.correct) byQuestion[a.question_id].correct++;
      if (a.error_tag) {
        byQuestion[a.question_id].errors[a.error_tag] =
          (byQuestion[a.question_id].errors[a.error_tag] || 0) + 1;
      }
    }

    const problematic = Object.entries(byQuestion)
      .map(([qid, stats]) => ({
        questionId: qid,
        totalAttempts: stats.total,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        errorBreakdown: stats.errors
      }))
      .filter(q => q.totalAttempts >= 10 && q.accuracy < 30)
      .sort((a, b) => a.accuracy - b.accuracy);

    return {
      totalQuestionsAnalyzed: Object.keys(byQuestion).length,
      problematicQuestions: problematic,
      recommendation: problematic.length > 0
        ? `${problematic.length} questions have <30% accuracy with 10+ attempts. Review for errors or excessive difficulty.`
        : 'Question quality looks good. No major red flags.'
    };
  }
}
