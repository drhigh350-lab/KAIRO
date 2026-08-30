/**
 * Kairo — RecommendationEngine
 * The brain that decides: "What is the next best thing this student should do right now?"
 *
 * Kairo V1 architecture (replaces the old flat point-scorer that ranked
 * every concept into one top-N list): sessions are never a forced mix.
 * Each session is 100% one of three types —
 *
 *   Focused Sprint  (Targeted Gaps)   — one struggling topic, deep practice
 *   Frontier Push   (Breadth)         — one never-seen topic, syllabus progress
 *   UTME Mix        (Spaced Retrieval)— the only type that mixes subjects
 *
 * getDashboardOptions() decides which TWO of the three to actually offer
 * (Primary + Secondary) — variety lives at the dashboard-selection level,
 * not inside any single session.
 *
 * Operates at two levels:
 *   1. Session-level: the three generators above + getDashboardOptions().
 *   2. Question-level: processAnswer() re-evaluates after EVERY answer and
 *      can interrupt the queue (prerequisite reroute, fatigue pullback,
 *      guessed-answer diagnostic) — unchanged by the V1 rewrite.
 */

import { RetentionState, SessionConstants, ErrorTag, DashboardConstants } from "../utils/constants.js";
import { clamp, seededShuffle, daysBetween, isExamProximity } from "../utils/helpers.js";

export class RecommendationEngine {
  constructor({ knowledgeGraph, studentProfile, decayModel, examDate = null, scheduler = null }) {
    this.graph = knowledgeGraph;
    this.profile = studentProfile;
    this.decayModel = decayModel;
    // Optional: a RevisionScheduler instance, used by buildUtmeMix() to
    // find concepts genuinely due for review (nextReviewEstimate elapsed).
    // Falls back to an equivalent inline check when not provided, so
    // existing callers/tests that construct this class without one don't
    // break.
    this.scheduler = scheduler;
    this.examDate = examDate;
    this.sessionQueue = [];        // ordered list of concept IDs for this session
    this.sessionHistory = [];      // concepts already covered this session
    this.fatigueCounter = 0;       // consecutive careless slips
    this.interruptionBuffer = [];  // concepts inserted mid-session (prerequisites, diagnostics)
  }

  // ═══════════════════════════════════════════════════════════════
  // SHARED HELPERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Hard subject guardrail: a concept outside the student's own enrolled
   * subjects must never surface in a recommendation, even if it happens
   * to be loaded into this.graph (e.g. from a CBT session that covers
   * subjects beyond what the student is actually taking).
   */
  _enrolledConcepts() {
    const enrolled = this.profile.targetSubjects;
    return Array.from(this.graph.nodes.values())
      .filter(c => !enrolled || enrolled.length === 0 || enrolled.includes(c.subject));
  }

  /**
   * Per-concept urgency — used INSIDE a generator to rank candidates
   * within whatever scope that generator has already chosen (one topic,
   * one due-for-review pool), never again to build one global top-N list.
   *
   * Two fixes from the old _sessionPriorityScore() this replaces:
   *  - Fading tiebreaker was inverted: `decayEstimate * 100` rewarded the
   *    LESS-forgotten concept, since decayEstimate is retention strength
   *    (1 = fresh, 0 = gone). Now `(1 - decayEstimate) * 100` correctly
   *    rewards the MORE-forgotten one — matches what the dead
   *    ConceptNode.getPriorityScore() actually got right.
   *  - Exam-proximity pressure-testing was Held-only. A Reinforced concept
   *    (survived one real forgetting-and-recovery cycle already) is at
   *    least as worth pressure-testing as a merely-Held one — now both
   *    qualify.
   */
  _conceptUrgencyScore(concept) {
    let score = 0;

    if (concept.retentionState === RetentionState.FADING) {
      score += 1000 + ((1 - concept.decayEstimate) * 100);
    }

    if (concept.retentionState === RetentionState.FORMING) {
      const isPrerequisite = Array.from(this.graph.nodes.values())
        .some(n => n.dependencyIds.includes(concept.id) && n.retentionState !== RetentionState.UNSEEN);
      score += isPrerequisite ? 600 : 400;
    }

    if (this.examDate && isExamProximity(this.examDate) &&
        (concept.retentionState === RetentionState.HELD || concept.retentionState === RetentionState.REINFORCED) &&
        concept.decayEstimate < 0.7) {
      score += 200;
    }

    return score;
  }

  _groupBySubjectTopic(concepts) {
    const groups = new Map();
    for (const c of concepts) {
      const key = `${c.subject}::${c.topic}`;
      if (!groups.has(key)) groups.set(key, { subject: c.subject, topic: c.topic, concepts: [] });
      groups.get(key).concepts.push(c);
    }
    return Array.from(groups.values());
  }

  _orderConceptsByUrgency(concepts) {
    return seededShuffle(concepts, Date.now())
      .sort((a, b) => this._conceptUrgencyScore(b) - this._conceptUrgencyScore(a))
      .map(c => c.id);
  }

  // ═══════════════════════════════════════════════════════════════
  // THE THREE SESSION TYPES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Focused Sprint (Targeted Gaps) — 100% of the queue lives inside ONE
   * struggling topic, chosen by urgency (Fading topics outrank
   * Forming-only ones; ties broken by shuffle, not insertion order).
   *
   * Targets Fading OR Forming, not Fading alone: a real onboarding trace
   * shows a brand-new student's graph is entirely Forming/Unseen on day
   * one — never Fading (a concept's first-ever attempt can only become
   * Forming; Fading requires having already been Held/Reinforced and then
   * failing). A Fading-only rule would leave that student with zero
   * eligible Sprint, ever, until something first became Held and later
   * decayed — Forming-fallback keeps the Sprint option meaningful from
   * day one.
   *
   * "Expand to parent topic if the bank is exhausted": current content
   * doesn't meaningfully use `subtopic` as a level distinct from `topic`
   * (verified against live kairo.questions: subtopic is null or identical
   * to topic for effectively every seeded question), so the real
   * expansion axis is topic -> other struggling topics in the SAME
   * subject, never cross-subject (that's what UTME Mix is for). This
   * returns a primary pool (the chosen topic's own concepts, most urgent
   * first) plus an overflow pool (the same subject's other struggling
   * topics, most urgent topic first) — the caller that actually resolves
   * concept IDs into real questions (KairoEngine.getQuestionForConcept(),
   * the only place that knows real per-concept question counts) draws
   * from overflow only once primary runs dry.
   */
  buildFocusedSprint({ excludeSubjects = [] } = {}) {
    const pool = this._enrolledConcepts().filter(c =>
      !excludeSubjects.includes(c.subject) &&
      (c.retentionState === RetentionState.FADING || c.retentionState === RetentionState.FORMING)
    );
    if (pool.length === 0) return { eligible: false, type: 'focused_sprint' };

    const groups = this._groupBySubjectTopic(pool).map(g => ({
      ...g,
      urgency: Math.max(...g.concepts.map(c => this._conceptUrgencyScore(c))),
      hasFading: g.concepts.some(c => c.retentionState === RetentionState.FADING)
    }));

    const ranked = seededShuffle(groups, Date.now())
      .sort((a, b) => (Number(b.hasFading) - Number(a.hasFading)) || (b.urgency - a.urgency));

    const [primary, ...rest] = ranked;
    const overflow = rest
      .filter(g => g.subject === primary.subject)
      .sort((a, b) => (Number(b.hasFading) - Number(a.hasFading)) || (b.urgency - a.urgency))
      .flatMap(g => this._orderConceptsByUrgency(g.concepts));

    return {
      eligible: true,
      type: 'focused_sprint',
      subject: primary.subject,
      topic: primary.topic,
      conceptIds: this._orderConceptsByUrgency(primary.concepts),
      overflowConceptIds: overflow
    };
  }

  /**
   * Frontier Push (Breadth) — 100% of the queue is ONE never-seen topic,
   * to guarantee real syllabus progression regardless of how many things
   * are currently Fading/Forming. This is the direct fix for the old
   * scorer's breadth-vs-depth gap: Unseen's flat +50 could never compete
   * against Fading's 1000+, so once a student had enough struggling
   * concepts to fill a session, brand-new topics could stop appearing for
   * weeks. Frontier Push is now its own guaranteed session type, not one
   * more thing competing for space inside a mixed queue.
   *
   * Every Unseen topic scores identically (nothing to rank by yet), so
   * the choice is a shuffle rather than a sort — this also keeps rotating
   * which subject gets the Frontier slot rather than fixating on one.
   */
  buildFrontierPush({ excludeSubjects = [] } = {}) {
    const pool = this._enrolledConcepts().filter(c =>
      !excludeSubjects.includes(c.subject) && c.retentionState === RetentionState.UNSEEN
    );
    if (pool.length === 0) return { eligible: false, type: 'frontier_push' };

    const groups = seededShuffle(this._groupBySubjectTopic(pool), Date.now());
    const [primary, ...rest] = groups;

    return {
      eligible: true,
      type: 'frontier_push',
      subject: primary.subject,
      topic: primary.topic,
      conceptIds: seededShuffle(primary.concepts, Date.now()).map(c => c.id),
      overflowConceptIds: rest
        .filter(g => g.subject === primary.subject)
        .flatMap(g => seededShuffle(g.concepts, Date.now()).map(c => c.id))
    };
  }

  /**
   * UTME Mix (Spaced Retrieval) — the only session type that mixes
   * subjects, deliberately: a real UTME paper forces topic-to-topic and
   * subject-to-subject jumps, and no other session type here practices
   * that skill. Eligible once the student has built a "critical mass" of
   * Held/Reinforced concepts (mirrors computeMacroState()'s own
   * COMPOUNDING threshold — reinforcedRatio > 0.3 — for consistency, not
   * a new unrelated number), or unconditionally once macroState is
   * peak_readiness, where mixed exam-shaped pressure-testing is the
   * priority regardless of ratio.
   *
   * Draws from concepts genuinely due for review (nextReviewEstimate
   * elapsed) via the RevisionScheduler passed into this engine's
   * constructor — this is what finally gives that previously-unused
   * spaced-repetition due-date math (computed by DecayModel on every
   * session, never read by the old session-builder) a real job. Falls
   * back to an equivalent inline check if no scheduler was wired in.
   */
  buildUtmeMix() {
    const enrolled = this._enrolledConcepts();
    const touched = enrolled.filter(c => c.retentionState !== RetentionState.UNSEEN);
    const heldRatio = touched.length > 0
      ? touched.filter(c => c.retentionState === RetentionState.HELD || c.retentionState === RetentionState.REINFORCED).length / touched.length
      : 0;
    const criticalMass = touched.length >= DashboardConstants.UTME_MIX_MIN_TOUCHED_CONCEPTS &&
      heldRatio >= DashboardConstants.UTME_MIX_HELD_RATIO_THRESHOLD;
    const eligible = criticalMass || this.profile.macroState === 'peak_readiness';
    if (!eligible) return { eligible: false, type: 'utme_mix' };

    const now = Date.now();
    const due = this.scheduler
      ? this.scheduler.getDueForRevision(this.graph)
      : Array.from(this.graph.nodes.values()).filter(c =>
          (c.retentionState === RetentionState.HELD || c.retentionState === RetentionState.REINFORCED) &&
          (!c.nextReviewEstimate || c.nextReviewEstimate <= now)
        );
    const enrolledSubjects = this.profile.targetSubjects;
    const dueEnrolled = due.filter(c => !enrolledSubjects || enrolledSubjects.length === 0 || enrolledSubjects.includes(c.subject));

    if (dueEnrolled.length === 0) return { eligible: false, type: 'utme_mix' };

    // Interleave by subject (not a single urgency sort) so one subject
    // with many due concepts can't crowd out the "mix" this type exists
    // to be.
    const bySubject = new Map();
    for (const c of dueEnrolled) {
      if (!bySubject.has(c.subject)) bySubject.set(c.subject, []);
      bySubject.get(c.subject).push(c.id);
    }
    const lanes = Array.from(bySubject.values()).map(ids => seededShuffle(ids, Date.now()));
    const conceptIds = [];
    for (let i = 0; lanes.some(l => i < l.length); i++) {
      for (const lane of lanes) if (i < lane.length) conceptIds.push(lane[i]);
    }

    return { eligible: true, type: 'utme_mix', conceptIds };
  }

  // ═══════════════════════════════════════════════════════════════
  // THE 2-OPTION DASHBOARD
  // ═══════════════════════════════════════════════════════════════

  /**
   * Decides which TWO of the three session types to offer, and which is
   * Primary vs Secondary — the Anti-Fatigue Circuit Breaker lives here:
   * a subject whose last Focused Sprint/Frontier Push finished below
   * DashboardConstants.FRUSTRATION_ACCURACY_THRESHOLD (see
   * recordSessionOutcome()) is barred from the Primary slot. For Sprint/
   * Frontier specifically, a blocked natural pick first tries to PIVOT to a
   * different subject's topic (a real Chemistry Sprint instead of the
   * blocked Physics one) rather than just being dropped — only when no
   * alternative-subject topic exists does the blocked pick survive,
   * available for Secondary (or for Primary as an absolute last resort if
   * nothing else qualifies at all — never leave the dashboard empty to
   * enforce the breaker).
   */
  getDashboardOptions() {
    const macro = this.profile.macroState;
    const blockedSubject = this.profile.lastFrustratedSubject || null;

    // For a subject-scoped type (Sprint/Frontier), a blocked natural pick
    // doesn't just get excluded — it genuinely PIVOTS to a different
    // subject's topic first, per the spec's own example ("pivot to a
    // Chemistry or Biology Sprint"). Only when no alternative-subject topic
    // exists for that type does the natural (blocked) pick survive, marked
    // so it can't take Primary — still eligible for Secondary, or Primary
    // as an absolute last resort if nothing else qualifies at all.
    const buildSubjectScopedCandidate = (generatorFn) => {
      const natural = generatorFn();
      if (!natural.eligible || !blockedSubject || natural.subject !== blockedSubject) {
        return { ...natural, blockedFromPrimary: natural.eligible && natural.subject === blockedSubject };
      }
      const alternative = generatorFn({ excludeSubjects: [blockedSubject] });
      return alternative.eligible
        ? { ...alternative, blockedFromPrimary: false }
        : { ...natural, blockedFromPrimary: true };
    };

    const sprint = buildSubjectScopedCandidate((opts) => this.buildFocusedSprint(opts));
    const frontier = buildSubjectScopedCandidate((opts) => this.buildFrontierPush(opts));
    // Cross-subject by nature — a rough round can't fairly indict one
    // subject, so UTME Mix is never blocked from Primary.
    const utmeMix = { ...this.buildUtmeMix(), blockedFromPrimary: false };

    const candidates = [sprint, frontier, utmeMix].filter(c => c.eligible);

    if (candidates.length === 0) {
      // Genuine edge case: nothing is Fading/Forming (no Sprint), nothing
      // is Unseen (no Frontier), and there isn't yet enough Held/Reinforced
      // volume — or peak_readiness — for a real UTME Mix (a student with
      // only a handful of comfortably-Held concepts and nothing else, most
      // likely very early or a thin manually-seeded graph). Never leave the
      // dashboard empty when the student has ANY enrolled concept at all —
      // same "a filter should narrow, never erase" philosophy as
      // getQuestionForConcept()'s difficulty-window/cooldown fallbacks.
      const fallback = this._fallbackAnyConcept();
      return fallback
        ? { primary: this._withDashboardCopy(fallback), secondary: null }
        : { primary: null, secondary: null };
    }

    // peak_readiness prioritizes the mixed, exam-shaped session; every
    // other macro-state prioritizes fixing a real gap first, then breadth,
    // then the mix.
    const priorityOrder = macro === 'peak_readiness'
      ? ['utme_mix', 'focused_sprint', 'frontier_push']
      : ['focused_sprint', 'frontier_push', 'utme_mix'];
    const rank = (c) => priorityOrder.indexOf(c.type);

    const primaryPool = candidates.filter(c => !c.blockedFromPrimary);
    const primary = (primaryPool.length > 0 ? primaryPool : candidates)
      .sort((a, b) => rank(a) - rank(b))[0];
    const secondary = candidates
      .filter(c => c !== primary)
      .sort((a, b) => rank(a) - rank(b))[0] || null;

    return {
      primary: primary ? this._withDashboardCopy(primary) : null,
      secondary: secondary ? this._withDashboardCopy(secondary) : null
    };
  }

  /**
   * Last-resort fallback for getDashboardOptions() when all three real
   * session types are ineligible but the student has enrolled concepts at
   * all — any state, ranked by whatever urgency they do have. Framed as a
   * 'utme_mix' since it's the only type designed to hand back a plain,
   * unscoped concept list.
   */
  _fallbackAnyConcept() {
    const enrolled = this._enrolledConcepts();
    if (enrolled.length === 0) return null;
    const conceptIds = this._orderConceptsByUrgency(enrolled);
    const top = this.graph.getConcept(conceptIds[0]);
    return {
      eligible: true,
      type: 'utme_mix',
      subject: top.subject,
      topic: top.topic,
      conceptIds,
      overflowConceptIds: []
    };
  }

  _withDashboardCopy(option) {
    const reason = {
      focused_sprint: `"${option.topic}" needs focused work right now — this sprint stays on it until it locks in.`,
      frontier_push: `"${option.topic}" hasn't come up yet — a good next topic to bring into your syllabus coverage.`,
      utme_mix: `A real exam-shaped mix, pulling in topics across your subjects that are due for a check.`
    }[option.type];
    return { ...option, reason };
  }

  /**
   * Call once a Focused Sprint or Frontier Push session actually
   * finishes, with that session's real accuracy — records the Circuit
   * Breaker's frustration signal and clears the Avoidance Tracker for
   * that subject on a genuine completion. UTME Mix is deliberately
   * excluded: it mixes subjects, so a rough round can't fairly indict one
   * of them.
   */
  recordSessionOutcome({ type, subject, accuracy }) {
    if (type === 'utme_mix' || !subject) return;

    if (accuracy < DashboardConstants.FRUSTRATION_ACCURACY_THRESHOLD) {
      this.profile.lastFrustratedSubject = subject;
      this.profile.lastFrustratedAt = Date.now();
    } else if (this.profile.lastFrustratedSubject === subject) {
      this.profile.lastFrustratedSubject = null;
      this.profile.lastFrustratedAt = null;
    }

    if (type === 'focused_sprint') {
      this.profile.avoidanceStreaks[subject] = 0;
    }
  }

  /**
   * Avoidance Tracking: call when the student picks the Secondary option
   * over a Focused Sprint that was actually offered for `subject`.
   * Returns true once the streak crosses AVOIDANCE_STREAK_THRESHOLD, so
   * the caller (Kai) knows to shift that subject's next nudge from gentle
   * to direct — still bound by KaiRules.NEVER_GUILT_BASED_REENGAGEMENT and
   * the platform-wide banned-phrase list. This only counts the pattern;
   * it never decides or contains the actual copy shown to the student.
   */
  recordSprintDodged(subject) {
    if (!subject) return false;
    const streaks = this.profile.avoidanceStreaks;
    streaks[subject] = (streaks[subject] || 0) + 1;
    return streaks[subject] >= DashboardConstants.AVOIDANCE_STREAK_THRESHOLD;
  }

  // ═══════════════════════════════════════════════════════════════
  // BACKWARD-COMPATIBLE ENTRY POINTS
  // (buildSessionPlan/buildRankedQueue/buildTopicSessionPlan keep their
  // original signatures and return shapes — plain concept-ID arrays — so
  // startSession()/getTodayFocus()/prefetchRecommendationQueues() and the
  // Home MissionCard anchor flow don't need to change. Internally they
  // now run on the three generators + _conceptUrgencyScore instead of the
  // old flat _sessionPriorityScore, which no longer exists — replaced,
  // not left running alongside its replacement.)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Build the plan when the student opens Kairo — resolves to whatever
   * getDashboardOptions() picked as Primary (Circuit Breaker included),
   * capped to the macro-state session length, interleaved for pacing.
   */
  buildSessionPlan() {
    this.sessionQueue = this.buildRankedQueue(this._sessionLengthCap());
    this.sessionHistory = [];
    this.fatigueCounter = 0;
    this.interruptionBuffer = [];

    return this.sessionQueue.slice();
  }

  /**
   * The same Primary pick buildSessionPlan() uses, capped to an explicit
   * length instead of the macro-state cap, and without touching this
   * instance's live session state — a pure "what would Kairo recommend"
   * read, used to pre-build several sessions' worth of queue at once
   * (offline pre-fetch).
   */
  buildRankedQueue(maxLen) {
    const { primary } = this.getDashboardOptions();
    if (!primary) return [];

    const ordered = [...primary.conceptIds, ...(primary.overflowConceptIds || [])];
    if (ordered.length === 0) return [];

    // A Focused Sprint/Frontier topic can have fewer distinct concepts
    // than questions wanted for a longer prefetch window — cycle the same
    // ordered pool rather than returning short, since
    // getQuestionForConcept()'s own unseen-first logic is what actually
    // keeps repeat concepts from serving the same question twice.
    const selected = [];
    for (let i = 0; selected.length < maxLen; i++) {
      selected.push(ordered[i % ordered.length]);
    }
    return this._interleaveQueue(selected);
  }

  /**
   * Every concept in one subject+topic, scored and interleaved — used for
   * a recommendation anchored to one specific concept (a Home MissionCard
   * tap), where the whole session should stay on that concept's topic.
   * Not capped to any question count; a caller cycles through this list
   * to reach its own minimum.
   */
  buildTopicSessionPlan(subject, topic) {
    const inTopic = Array.from(this.graph.nodes.values())
      .filter(c => c.subject === subject && c.topic === topic);
    return this._interleaveQueue(this._orderConceptsByUrgency(inTopic));
  }

  _interleaveQueue(conceptIds) {
    // Split into revision (Fading/Forming) and new/compounding (Held/Reinforced/Unseen)
    const revision = [];
    const fresh = [];
    for (const id of conceptIds) {
      const c = this.graph.getConcept(id);
      if (c.retentionState === RetentionState.FADING || c.retentionState === RetentionState.FORMING) {
        revision.push(id);
      } else {
        fresh.push(id);
      }
    }

    // Interleave: revision, fresh, revision, fresh...
    const interleaved = [];
    let r = 0, f = 0;
    while (r < revision.length || f < fresh.length) {
      if (r < revision.length) interleaved.push(revision[r++]);
      if (f < fresh.length) interleaved.push(fresh[f++]);
    }
    return interleaved;
  }

  _sessionLengthCap() {
    const macro = this.profile.macroState;
    switch (macro) {
      case 'wavering':
      case 'recovering':
        return SessionConstants.MIN_SESSION_LENGTH;
      case 'orienting':
        return 10;
      case 'peak_readiness':
        return SessionConstants.MAX_SESSION_LENGTH;
      default:
        return SessionConstants.DEFAULT_SESSION_LENGTH;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // QUESTION-LEVEL: Decide the very next question after each answer
  // (unchanged by the V1 dashboard rewrite — this reacts within
  // whichever session is already running, regardless of which of the
  // three types it is)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Call this after EVERY student answer.
   * @param {Object} result — {conceptId, correct, responseTimeMs, errorTag, questionId, difficulty}
   * @returns {Object} decision — { nextConceptId, action, reason }
   */
  processAnswer(result) {
    const concept = this.graph.getConcept(result.conceptId);
    if (!concept) {
      return { nextConceptId: this._peekQueue(), action: 'continue', reason: 'Concept not found' };
    }

    // Update the concept node
    concept.recordAttempt(result);
    this.sessionHistory.push(result.conceptId);

    // Update fatigue tracking
    if (result.errorTag === ErrorTag.CARELESS_SLIP) {
      this.fatigueCounter++;
    } else if (result.correct) {
      this.fatigueCounter = Math.max(0, this.fatigueCounter - 1);
    } else {
      this.fatigueCounter = 0;
    }

    // ═══ INTERRUPT LOGIC ═══

    // A. Prerequisite gap detected
    if (result.errorTag === ErrorTag.CONCEPTUAL_GAP) {
      const weakPrereqs = this.graph.findWeakPrerequisites(result.conceptId);
      if (weakPrereqs.length > 0) {
        const target = weakPrereqs[0];
        this.interruptionBuffer.push(target.id);
        return {
          nextConceptId: target.id,
          action: 'reroute_prerequisite',
          reason: `Prerequisite "${target.name}" needs reinforcement before continuing.`
        };
      }
    }

    // B. Guessed → diagnostic
    if (result.errorTag === ErrorTag.GUESSED) {
      return {
        nextConceptId: result.conceptId,
        action: 'diagnostic',
        reason: 'Response pattern suggests guessing. Serving a lower-stakes diagnostic question.'
      };
    }

    // C. Careless slip → brief nudge, continue normally
    if (result.errorTag === ErrorTag.CARELESS_SLIP) {
      // Don't re-teach; just flag for Kai
    }

    // D. Fatigue detection
    if (this.fatigueCounter >= SessionConstants.FATIGUE_SLIP_THRESHOLD) {
      this.profile._softenSessionTemporarily();
      return {
        nextConceptId: this._peekQueue(),
        action: 'difficulty_pullback',
        reason: 'Multiple careless slips detected. Temporarily reducing difficulty.'
      };
    }

    // E. Correct on Fading → mark Reinforced candidate, continue
    if (result.correct && concept.retentionState === RetentionState.REINFORCED) {
      // This is a milestone moment — caller should trigger Wisdom Spark
    }

    // F. Correct on already-Held → reduce future priority slightly
    if (result.correct && concept.retentionState === RetentionState.HELD) {
      // Handled by priority score naturally (lastSeenAt updated)
    }

    // Pull from interruption buffer first, then main queue
    const nextId = this._dequeueNext();
    return {
      nextConceptId: nextId,
      action: nextId ? 'continue' : 'end_session',
      reason: nextId ? 'Proceeding to next queued concept.' : 'Session queue complete.'
    };
  }

  /**
   * Human-readable reason the top-priority concept was chosen — for
   * preview surfaces (Home) that need to explain today's recommendation
   * before committing to a real session via buildSessionPlan().
   */
  explainTopPick(concept, macroState, examDate = null) {
    if (concept.retentionState === RetentionState.FADING) {
      return `You're starting to forget "${concept.name}" — a quick review now will lock it back in before it slips further.`;
    }
    if (concept.retentionState === RetentionState.FORMING) {
      const blocksOthers = Array.from(this.graph.nodes.values())
        .some(n => n.dependencyIds.includes(concept.id) && n.retentionState !== RetentionState.UNSEEN);
      return blocksOthers
        ? `You're partway through "${concept.name}", and other topics build on it — worth strengthening first.`
        : `You're partway through "${concept.name}" — a bit more practice will make it stick.`;
    }
    if (examDate && isExamProximity(examDate) && concept.retentionState === RetentionState.HELD) {
      return `"${concept.name}" is solid, but with your exam approaching, it's worth a pressure-test to make sure it holds under pressure.`;
    }
    if (concept.retentionState === RetentionState.UNSEEN) {
      return `"${concept.name}" hasn't come up yet — a good place to start building real signal.`;
    }
    const macroFraming = {
      at_risk: `It's been a while — starting with "${concept.name}" is a gentle way back in.`,
      recovering: `Good to see you back — "${concept.name}" is a solid place to pick things up again.`,
      wavering: `"${concept.name}" is one of the steadier things to build confidence on right now.`
    };
    return macroFraming[macroState] || `Kairo picked "${concept.name}" as the most useful thing to practise right now.`;
  }

  _peekQueue() {
    if (this.interruptionBuffer.length > 0) return this.interruptionBuffer[0];
    if (this.sessionQueue.length > 0) return this.sessionQueue[0];
    return null;
  }

  _dequeueNext() {
    if (this.interruptionBuffer.length > 0) {
      return this.interruptionBuffer.shift();
    }
    while (this.sessionQueue.length > 0) {
      const id = this.sessionQueue.shift();
      // Skip if already done enough this session
      const timesThisSession = this.sessionHistory.filter(h => h === id).length;
      if (timesThisSession < 2) return id;
    }
    return null;
  }

  /**
   * Check if session should end early.
   * The engine is allowed to say "you've done enough for today."
   */
  shouldEndSession() {
    const macro = this.profile.macroState;
    const sessionLen = this.sessionHistory.length;

    // Wavering/Recovering: shorter sessions
    if ((macro === 'wavering' || macro === 'recovering') && sessionLen >= 8) {
      return { end: true, reason: 'Gentle session limit reached. Come back tomorrow.' };
    }

    // Queue exhausted
    if (this.sessionQueue.length === 0 && this.interruptionBuffer.length === 0) {
      return { end: true, reason: 'All planned concepts covered.' };
    }

    return { end: false };
  }
}
