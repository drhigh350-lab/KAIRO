/**
 * Kairo — LearnModule (Learn Module spec, docs/specs/KAIRO_LEARN_MODULE.md)
 *
 * Learn is Kairo's understanding-repair layer — the module a student reaches
 * when a question has just revealed a gap, and the honest next step is not
 * "try again" but "understand this first" (§1.1). It is not a second Review
 * (Review is about timing, Learn is about comprehension — §1.4) and it does
 * not run its own intelligence layer (§7.1) — every read and write here
 * flows through the same Learning Engine, Knowledge Graph, and Question
 * Intelligence Model every other module already uses.
 */

import { RetentionState, ErrorTag, DecayConstants } from "../utils/constants.js";
import { isExamProximity, isPrimaryConceptLink } from "../utils/helpers.js";

// First real batch — Mathematics only, matching the 10 concepts seeded
// alongside kairo.questions' first Mathematics content batch. Keyed by
// concept.name (exact match against kairo.concepts.name).
const TEACHING_HOOKS = {
  'Number Bases': {
    hook: 'You already switch number systems every day without noticing.',
    analogy: "Base ten is just how many fingers you have. Binary works the same way, but with only two \"fingers\" — 0 and 1 — so each place value doubles instead of multiplying by ten."
  },
  'Indices and Logarithms': {
    hook: 'A logarithm is just an index question asked backward.',
    analogy: "Indices ask \"what do I get if I raise 2 to the power 3?\" A logarithm asks the reverse: \"what power do I need to turn 2 into 8?\" Same relationship, viewed from opposite ends."
  },
  'Simultaneous Equations': {
    hook: 'Two clues together can pin down an answer that neither clue could alone.',
    analogy: "Being told a bag has 10 sweets total doesn't tell you how many are red. Add a second clue — \"there are 2 more red than blue\" — and suddenly there's only one possible answer. That's what solving two equations together does."
  },
  'Quadratic Equations': {
    hook: 'Some equations have two honest answers, not one.',
    analogy: 'A ball thrown straight up passes the same height twice — once going up, once coming back down. Factorizing a quadratic finds both of those moments at once.'
  },
  'Simple Interest and Percentages': {
    hook: 'Interest is just a rental fee, for money instead of an object.',
    analogy: "Paying a fixed fee to borrow a friend's bicycle for a week is the same idea as simple interest — a fixed charge for borrowing money for a fixed time, calculated the same way every period."
  },
  'Mensuration': {
    hook: 'Every mensuration formula is really just counting, in disguise.',
    analogy: 'Area is counting how many unit squares fit inside a shape; volume is counting how many unit cubes fit inside a solid. The formulas are shortcuts so you never have to count one by one.'
  },
  'Trigonometry': {
    hook: 'A right-angled triangle keeps the same ratios no matter how big it gets.',
    analogy: "A short ladder leaning at 60° and a tall ladder leaning at the same 60° are completely different sizes, but the ratio between height and length is identical — that fixed ratio is what a trig function captures."
  },
  'Statistics': {
    hook: 'Mean, median, and mode all answer "what\'s typical here?" — just differently.',
    analogy: 'If nine classmates score around 60% and one scores 5%, the mean gets dragged down by that one outlier, but the median barely moves — like one unusually short person standing in an otherwise average-height crowd.'
  },
  'Probability': {
    hook: "Probability is just counting the ways something can happen, out of every way anything could.",
    analogy: 'Picking a red sweet from a bag of 5 red and 3 blue is not magic — it is simply that 5 out of the 8 total sweets are red.'
  },
  'Sequences and Series': {
    hook: 'A sequence is a rule you can predict, not a list you have to memorize.',
    analogy: "Saving ₦500 in week one, then ₦500 more every week after, is an arithmetic progression — the pattern itself tells you what week 20 looks like, without writing out every week in between."
  }
};

export class LearnModule {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
    this.activeLessons = new Map();  // conceptId -> { lesson, reinforcementAttempts, startedAt, entryPoint, questionId }
    this.completedLessons = [];      // { conceptId, conceptName, completedAt, entryPoint, masteryHolding, reinforcementAttempts }
    this.abandonCounts = new Map();  // conceptId -> count (§10.1)
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3 — STUDENT ENTRY POINTS
  // Every entry point carries context — Learn never opens on a blank
  // slate the student has to orient themselves within (§3.1).
  // ═══════════════════════════════════════════════════════════════

  /** §3.2 — the primary, highest-frequency entry point. */
  fromIncorrectAnswer({ questionId, conceptId, selectedOption, errorTag, responseTimeMs = null }) {
    return this._buildLesson({
      conceptId, questionId, selectedOption, errorTag, responseTimeMs,
      entryPoint: 'incorrect_answer',
      framing: { tone: 'immediate_recovery', message: "Let's fix what just happened." }
    });
  }

  /** §3.3 — a session's worth of corroborated pattern, not a single miss. */
  fromPracticeSummary({ conceptId, sessionMisses = [] }) {
    const anchor = sessionMisses[sessionMisses.length - 1] || {};
    const lesson = this._buildLesson({
      conceptId,
      questionId: anchor.questionId ?? null,
      selectedOption: anchor.selectedOption ?? null,
      errorTag: anchor.errorTag ?? null,
      entryPoint: 'practice_summary',
      framing: {
        tone: 'corroborated_gap',
        message: sessionMisses.length > 1
          ? `This came up ${sessionMisses.length} times this session.`
          : 'This came up during your session.'
      }
    });
    lesson.corroboration = { missCount: sessionMisses.length };
    return lesson;
  }

  /** §3.4 — Review handing off where "due" and "not understood" overlap. */
  fromReview({ conceptId, reason = 'due_and_not_understood' }) {
    return this._buildLesson({
      conceptId,
      entryPoint: 'review',
      framing: {
        tone: 'combined_timing_comprehension',
        message: reason === 'due_and_not_understood'
          ? "This one's due for review, and it looks like it never fully landed — let's fix that first."
          : "Let's make sure this actually holds before it comes back around."
      }
    });
  }

  /** §3.5 — the DDE proactively routing a Critical/Repeated gap before more practice would help. */
  fromWeakTopicRecommendation({ conceptId, gapSeverity = 'critical' }) {
    return this._buildLesson({
      conceptId,
      entryPoint: 'weak_topic_recommendation',
      framing: { tone: 'preventative', message: "Let's fix this before it blocks more.", gapSeverity }
    });
  }

  /** §3.6 — minor, secondary route from an achievement story or a known weak spot. */
  fromDashboard({ conceptId }) {
    return this._buildLesson({
      conceptId,
      entryPoint: 'home_dashboard',
      framing: { tone: 'minor_secondary', message: "Let's take a closer look at this one." }
    });
  }

  /** §3.7 — self-directed, analytical origin rather than a reactive one. */
  fromInsights({ conceptId }) {
    return this._buildLesson({
      conceptId,
      entryPoint: 'insights',
      framing: { tone: 'self_improvement', message: "Let's strengthen this." }
    });
  }

  /** §3.9 — the student flagged this themselves; acknowledge that intent directly. */
  fromBookmark({ conceptId }) {
    return this._buildLesson({
      conceptId,
      entryPoint: 'bookmark',
      framing: { tone: 'acknowledged_intent', message: 'You marked this as worth revisiting.' }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4 — LEARN HOME
  // A query over the student's own diagnostic history, never a
  // browsable catalogue of everything Kairo could teach (§4.2).
  // ═══════════════════════════════════════════════════════════════

  getLearnHome() {
    const graph = this.engine.graph;
    const concepts = Array.from(graph.nodes.values());
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const coldStart = concepts.every(c => c.attemptHistory.length === 0);

    const repairCandidates = concepts.filter(c => this._needsUnderstandingRepair(c));

    // §4.3.3 — Recommended Concepts.
    const recommended = repairCandidates
      .slice()
      .sort((a, b) => this._learnPriority(b) - this._learnPriority(a))
      .slice(0, 4)
      .map(c => ({ id: c.id, name: c.name, reason: this._recommendReason(c) }));

    // §4.3.4 — Weak Topics, a topic-level rollup of the same candidates.
    const byTopic = {};
    for (const c of repairCandidates) {
      const key = `${c.subject}::${c.topic}`;
      byTopic[key] = byTopic[key] || { subject: c.subject, topic: c.topic, count: 0 };
      byTopic[key].count++;
    }
    const weakTopics = Object.values(byTopic).sort((a, b) => b.count - a.count).slice(0, 5);

    // §4.3.5 — Recently Learned Concepts.
    const recentlyLearned = this.completedLessons
      .filter(l => (now - l.completedAt) < 5 * day)
      .slice(-5)
      .map(l => ({ conceptId: l.conceptId, conceptName: l.conceptName, holding: l.masteryHolding, completedAt: l.completedAt }));

    // §4.3.6 — Mastered Concepts, collapsed by default (concept must
    // actually still be Held/Reinforced now, not just at lesson-close time).
    const masteredIds = new Set(this.completedLessons.filter(l => l.masteryHolding).map(l => l.conceptId));
    const masteredConcepts = [...masteredIds]
      .map(id => graph.getConcept(id))
      .filter(c => c && (c.retentionState === RetentionState.HELD || c.retentionState === RetentionState.REINFORCED))
      .map(c => ({ id: c.id, name: c.name }));

    // §4.3.2 — Continue Learning outranks starting fresh.
    const continueEntry = [...this.activeLessons.entries()].find(([, active]) => !active.lesson.masteryCheck);
    const continueLearning = continueEntry
      ? { conceptId: continueEntry[0], conceptName: continueEntry[1].lesson.conceptName, entryPoint: continueEntry[1].entryPoint }
      : null;

    // §4.3.8 — Suggested Next Lessons: lower-priority remainder, quiet.
    const recommendedIds = new Set(recommended.map(r => r.id));
    const suggestedNextLessons = repairCandidates
      .filter(c => !recommendedIds.has(c.id))
      .slice(0, 3)
      .map(c => ({ id: c.id, name: c.name }));

    return {
      kaiFraming: this._learnHomeFraming({ recommendedCount: recommended.length, coldStart }),
      continueLearning,
      recommendedConcepts: coldStart ? [] : recommended,
      weakTopics: coldStart ? [] : weakTopics,
      recentlyLearned,
      masteredConcepts,
      suggestedNextLessons: coldStart ? [] : suggestedNextLessons,
      coldStart
    };
  }

  _needsUnderstandingRepair(concept) {
    // Learn's scope is comprehension, not timing (§1.4) — a Forming concept
    // or a Fading one that was never genuinely confident (a "Hidden gap")
    // needs Learn; a Fading concept that was solidly Held belongs to Review.
    if (concept.retentionState === RetentionState.FORMING) return true;
    if (concept.retentionState === RetentionState.FADING && concept.confidenceScore < DecayConstants.HELD_CONFIDENCE_THRESHOLD) return true;
    return false;
  }

  _learnPriority(concept) {
    let score = (concept.errorPatternTags.get(ErrorTag.CONCEPTUAL_GAP) || 0) * 10;
    if (concept.retentionState === RetentionState.FORMING) score += 5;
    score += this.engine.graph.getDependents(concept.id).length * 2; // Importance-like weighting
    return score;
  }

  _recommendReason(concept) {
    const gapCount = concept.errorPatternTags.get(ErrorTag.CONCEPTUAL_GAP) || 0;
    if (gapCount >= 2) return `This came up ${gapCount} times recently.`;
    if (concept.retentionState === RetentionState.FADING) return "This is fading and wasn't fully solid to begin with.";
    return 'Still forming — worth locking in now.';
  }

  _learnHomeFraming({ recommendedCount, coldStart }) {
    if (coldStart) {
      return { text: "Once you've done a bit of practice, I'll know exactly what to help you understand here.", tone: 'cold_start_honest' };
    }
    if (recommendedCount === 0) {
      return { text: "Nothing urgent to untangle right now — everything's holding up.", tone: 'genuinely_clear' };
    }
    return { text: `${recommendedCount} concept${recommendedCount > 1 ? 's' : ''} could use a closer look.`, tone: 'grounded_summary' };
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTIONS 5 & 6 — CONCEPT LEARNING FLOW / LESSON STRUCTURE
  // A maximum shape, not a mandatory checklist (§5.13) — every
  // applicable component is present and accurate, not every possible
  // component filled in regardless of fit (§6.4).
  // ═══════════════════════════════════════════════════════════════

  _buildLesson({ conceptId, questionId = null, selectedOption = null, errorTag = null, responseTimeMs = null, entryPoint = 'direct', framing = {} }) {
    const concept = this.engine.graph.getConcept(conceptId);
    if (!concept) {
      throw new Error(`Learn: concept ${conceptId} not found.`);
    }

    // §10.1 — a fresh generation request for a concept with an already
    // unfinished lesson means the previous one was abandoned, not resumed.
    if (this.activeLessons.has(conceptId)) {
      this.abandonCounts.set(conceptId, (this.abandonCounts.get(conceptId) || 0) + 1);
    }

    const priorAttempts = this._priorAttemptsFor(conceptId);
    const abandonedBefore = this.abandonCounts.get(conceptId) || 0;

    // §10.3 — genuinely already mastered; respect it, don't re-litigate it.
    if (this._isAlreadyMastered(concept) && !errorTag) {
      const lesson = this._buildAlreadyMasteredLesson(concept, entryPoint, framing, priorAttempts);
      this.activeLessons.set(conceptId, { lesson, reinforcementAttempts: [], startedAt: Date.now(), entryPoint, questionId: null });
      return lesson;
    }

    const question = questionId ? this.engine.questionGraph.getQuestion(questionId) : null;
    const referenceQuestion = question || this._representativeQuestion(concept);
    const contentSparse = !referenceQuestion;

    // §5.4 — the same trusted explanation structure everywhere else in
    // Kairo (Question Experience §6.2), never a parallel one. A real
    // attempt gets the full distractor breakdown; a concept-only entry
    // with no real wrong answer gets the lighter correct-answer rendering.
    const explanation = referenceQuestion
      ? this.engine.explanations.generate({
          question: referenceQuestion,
          attempt: { correct: question ? !errorTag : true, selectedOption, errorTag, responseTimeMs },
          concept,
          macroState: this.engine.profile.macroState
        })
      : null;
    const explanationParts = explanation ? Object.fromEntries(explanation.parts.map(p => [p.type, p])) : {};

    // §5.13 / §8.3 / §8.6 / §8.7 / §10.1 — every one of these personalisation
    // dimensions points the same direction (trim toward the minimum viable
    // flow); they're tracked separately for transparency but drive one
    // shared compression behaviour rather than combinatorial special-casing.
    const compressionReasons = [];
    if (errorTag === ErrorTag.CARELESS_SLIP) compressionReasons.push('careless_slip');
    if (abandonedBefore >= 2) compressionReasons.push('repeated_abandonment');
    if (['wavering', 'recovering', 'at_risk'].includes(this.engine.profile.macroState)) compressionReasons.push('fragile_consistency');
    if (isExamProximity(this.engine.profile.examDate) && concept.confidenceScore > 0.3 && errorTag !== ErrorTag.CONCEPTUAL_GAP) {
      compressionReasons.push('exam_proximity_partial_knowledge');
    }
    const compressed = compressionReasons.length > 0;

    // §5.5 / §6.2.1 — Learning Objective, sourced from an anchoring
    // question, never invented from scratch.
    const learningObjective = referenceQuestion?.learningObjective
      || `Understand ${concept.name} well enough to apply it, not just recall it.`;

    // §5.6 / §8.3 / §10.2 — Simple Breakdown; rotates to a genuinely
    // different authored explanation on repeat lessons rather than
    // re-serving one that already didn't land.
    const breakdownSource = this._selectBreakdownSource(concept, referenceQuestion, priorAttempts);
    const simpleBreakdown = breakdownSource?.explanation
      ? { text: breakdownSource.explanation, sourceQuestionId: breakdownSource.id, sparse: false }
      : { text: null, sparse: true }; // §10.4 — honest, never padded

    // §5.7 / §8.2 — Common Misconceptions, the student's own error named first.
    const commonMisconceptions = this._collectMisconceptions(concept, questionId, selectedOption);

    // §5.8 / §6.2.6 — Exam Insight, reused directly from the explanation engine.
    const examInsight = explanationParts.exam_tip?.content || null;

    // §5.9 / §6.2.3 — Key Idea / Memory Aid, omitted cleanly when nothing genuine exists.
    const keyIdea = explanationParts.memory_anchor?.content || null;

    // §5.10 / §6.2.7 — 1-3 questions, never the identical one just seen.
    const reinforcementQuestions = this._selectReinforcementQuestions(concept, questionId);

    // §5.11 — Related Questions, optional extension carousel.
    const relatedQuestions = this._selectRelatedQuestions(concept, questionId);

    // §8.5 — acknowledge genuine surrounding strength, when it exists.
    const topicContext = this._topicContext(concept);

    const lesson = {
      conceptId,
      conceptName: concept.name,
      subject: concept.subject,
      topic: concept.topic,
      subtopic: concept.subtopic,
      entryPoint,
      framing,
      compressed,
      compressionReasons,
      contentSparse,
      priorAttempts,
      repeatedGap: priorAttempts >= 2, // Subject Knowledge Graph §8.2's threshold, mirrored here
      abandonedBefore,
      topicContext,
      alreadyMastered: false,
      steps: {
        question: question ? { id: question.id, stem: question.stem, selectedOption, correctOption: question.correctOption } : null,
        explanation: question
          ? {
              correctReasoning: explanationParts.correct_reasoning?.content || null,
              distractorBreakdown: explanationParts.distractor_breakdown?.content || null
            }
          : null,
        coreConcept: { learningObjective, conceptSummary: compressed ? null : this._conceptSummary(concept, referenceQuestion) },
        teachingHook: compressed ? null : this._teachingHook(concept),
        simpleBreakdown: compressed ? null : simpleBreakdown,
        commonMisconceptions: compressed ? commonMisconceptions.slice(0, 1) : commonMisconceptions,
        examInsight,
        keyIdea,
        reinforcementQuestions: reinforcementQuestions.map(q => ({ id: q.id, stem: q.stem })),
        relatedQuestions: compressed ? [] : relatedQuestions.map(q => ({ id: q.id, stem: q.stem }))
      },
      masteryCheck: null, // §6.2.8 — filled in by submitReinforcementAttempt
      kaiOpening: this._kaiOpeningMessage({ concept, framing, priorAttempts, contentSparse }),
      generatedAt: Date.now()
    };

    this.activeLessons.set(conceptId, { lesson, reinforcementAttempts: [], startedAt: Date.now(), entryPoint, questionId });
    return lesson;
  }

  /** §10.3 — a lightweight lesson for a concept the student doesn't need re-explained. */
  _buildAlreadyMasteredLesson(concept, entryPoint, framing, priorAttempts) {
    const related = this._selectRelatedQuestions(concept, null);
    return {
      conceptId: concept.id,
      conceptName: concept.name,
      subject: concept.subject,
      topic: concept.topic,
      subtopic: concept.subtopic,
      entryPoint,
      framing,
      compressed: true,
      compressionReasons: ['already_mastered'],
      contentSparse: false,
      priorAttempts,
      repeatedGap: false,
      abandonedBefore: this.abandonCounts.get(concept.id) || 0,
      topicContext: null,
      alreadyMastered: true,
      steps: {
        question: null,
        explanation: null,
        coreConcept: null,
        teachingHook: null,
        simpleBreakdown: null,
        commonMisconceptions: [],
        examInsight: null,
        keyIdea: null,
        reinforcementQuestions: [],
        relatedQuestions: related.map(q => ({ id: q.id, stem: q.stem }))
      },
      masteryCheck: null,
      kaiOpening: {
        text: `You've already got a solid handle on "${concept.name}" — want a quick confidence check, or just head back to Practice?`,
        tone: 'respecting_mastery'
      },
      generatedAt: Date.now()
    };
  }

  _isAlreadyMastered(concept) {
    return (concept.retentionState === RetentionState.HELD || concept.retentionState === RetentionState.REINFORCED)
      && concept.confidenceScore >= DecayConstants.HELD_CONFIDENCE_THRESHOLD;
  }

  _priorAttemptsFor(conceptId) {
    return this.completedLessons.filter(l => l.conceptId === conceptId).length;
  }

  _representativeQuestion(concept) {
    const forConcept = this.engine.questionGraph.getQuestionsForConcept(concept.id);
    const primary = forConcept.filter(q => q.conceptsTested.some(c => c.conceptId === concept.id && isPrimaryConceptLink(c)));
    const pool = primary.length > 0 ? primary : forConcept;
    if (pool.length === 0) return null;
    return pool.slice().sort((a, b) => a.difficultyRating - b.difficultyRating)[0];
  }

  _selectBreakdownSource(concept, referenceQuestion, priorAttempts) {
    const pool = this.engine.questionGraph.getQuestionsForConcept(concept.id).filter(q => q.explanation);
    if (pool.length === 0) return referenceQuestion;
    // §8.3 / §10.2 — rotate through genuinely different authored
    // explanations on repeat lessons rather than re-serving the same one.
    const distinct = [...new Map(pool.map(q => [q.explanation, q])).values()];
    return distinct[Math.min(priorAttempts, distinct.length - 1)] || referenceQuestion;
  }

  _conceptSummary(concept, referenceQuestion) {
    const place = [concept.subject, concept.topic, concept.subtopic].filter(Boolean).join(' → ');
    if (referenceQuestion?.explanation) {
      return `${concept.name} (${place}). ${referenceQuestion.explanation}`;
    }
    // §10.4 — honest about sparse content, never a padded or invented paragraph.
    return `${concept.name} (${place}). Full authored content for this concept is still being built out.`;
  }

  /**
   * A relatable opening hook + everyday analogy, shown before the formal
   * concept explanation — not part of the documented §5.x lesson flow,
   * added because the lesson otherwise jumps straight into technical
   * content with nothing easing a student into unfamiliar ground. Same
   * discipline as §5.9's Memory Aid: a real, hand-authored entry per
   * concept, or cleanly omitted — never a generic or forced analogy.
   * First batch covers Mathematics only (TEACHING_HOOKS below); every
   * other concept returns null until a real one is authored for it.
   */
  _teachingHook(concept) {
    return TEACHING_HOOKS[concept?.name] || null;
  }

  _collectMisconceptions(concept, questionId, selectedOption) {
    const results = [];
    const seen = new Set();

    // §8.2 — the student's own error becomes the lesson's entry point, named first.
    if (questionId && selectedOption) {
      const questionObj = this.engine.questionGraph.getQuestion(questionId);
      const own = this.engine.misconceptions.diagnoseQuestion(questionObj, selectedOption);
      if (own) {
        results.push({ ...own, ownMistake: true });
        seen.add(own.id);
      }
    }

    for (const q of this.engine.questionGraph.getQuestionsForConcept(concept.id)) {
      for (const entry of this.engine.misconceptions.misconceptionsForQuestion(q)) {
        if (entry.misconception && !seen.has(entry.misconception.id)) {
          seen.add(entry.misconception.id);
          results.push({ ...entry.misconception, ownMistake: false });
        }
      }
    }
    return results;
  }

  _selectReinforcementQuestions(concept, excludeQuestionId) {
    let candidates = excludeQuestionId
      ? this.engine.questionGraph.findReinforcement(excludeQuestionId, [excludeQuestionId])
      : [];
    if (candidates.length === 0) {
      const exclude = excludeQuestionId ? [excludeQuestionId] : [];
      candidates = this.engine.questionGraph.getQuestionsForConcept(concept.id).filter(q => !exclude.includes(q.id));
    }
    return candidates.slice(0, 3);
  }

  _selectRelatedQuestions(concept, excludeQuestionId) {
    if (!excludeQuestionId) {
      return this.engine.questionGraph.getQuestionsForConcept(concept.id).slice(0, 3);
    }
    return this.engine.questionGraph.findExtension(excludeQuestionId, [excludeQuestionId]).slice(0, 3);
  }

  _topicContext(concept) {
    const siblings = this.engine.graph.filter({ subject: concept.subject, topic: concept.topic })
      .filter(c => c.id !== concept.id && c.attemptHistory.length > 0);
    if (siblings.length < 2) return null;
    const strongRatio = siblings.filter(c => c.retentionState === RetentionState.HELD || c.retentionState === RetentionState.REINFORCED).length / siblings.length;
    if (strongRatio < 0.7) return null;
    return { strongElsewhereInTopic: true, text: `You've got the rest of ${concept.topic} solid — this is just one piece.` };
  }

  _kaiOpeningMessage({ concept, framing, priorAttempts, contentSparse }) {
    // §8.3 / §9.5 — a repeated gap is normalised, never drawing attention
    // to the count itself as evidence of failure.
    if (priorAttempts >= 2) {
      return { text: `Let's look at "${concept.name}" from a different angle.`, tone: 'normalizing_repeat' };
    }
    if (contentSparse) {
      return { text: `Full material for "${concept.name}" is still being built out — here's what we have so far.`, tone: 'honest_sparse' };
    }
    if (framing?.message) {
      return { text: framing.message, tone: framing.tone || 'grounding' };
    }
    return { text: `Let's understand "${concept.name}" before you head back in.`, tone: 'grounding' };
  }

  // ═══════════════════════════════════════════════════════════════
  // §5.10 / §6.2.7-8 / §7.3 / §7.4 / §7.7 — MINI REINFORCEMENT ACTIVITY
  // ═══════════════════════════════════════════════════════════════

  submitReinforcementAttempt({ conceptId, correct, responseTimeMs = null, questionId = null }) {
    const concept = this.engine.graph.getConcept(conceptId);
    if (!concept) {
      throw new Error(`Learn: concept ${conceptId} not found.`);
    }
    const active = this.activeLessons.get(conceptId);
    const stateBefore = concept.retentionState;

    const attempt = { conceptId, correct, responseTimeMs, timestamp: Date.now(), errorTag: null, questionId, difficulty: null };
    if (!correct) {
      attempt.errorTag = this.engine.classifier.classify({
        concept, selectedOption: null, correctOption: null, responseTimeMs,
        question: { id: questionId, distractorTags: [], difficulty: 1, type: 'single' }
      });
    } else {
      this.engine.classifier.updateBaseline(concept, responseTimeMs || 0);
    }

    concept.recordAttempt(attempt);

    // §7.3 — a freshly-taught correct answer cannot yet demonstrate genuine
    // Reinforced, which specifically requires recall AFTER forgetting had a
    // chance to occur (Learning Engine §2.2). Cap the promotion at Held;
    // Review is architecturally where Reinforced is actually earned
    // (Review Module §7.3).
    let cappedToHeld = false;
    if (stateBefore === RetentionState.FADING && concept.retentionState === RetentionState.REINFORCED) {
      concept.retentionState = RetentionState.HELD;
      concept.reinforcedCycles = Math.max(0, concept.reinforcedCycles - 1);
      cappedToHeld = true;
    }

    this.engine.store.logAttempt(attempt);
    this.engine.sync.queue({ type: 'attempt', data: attempt });
    if (active) active.reinforcementAttempts.push(attempt);

    // §6.2.8 — honest, never a raw percentage, never a gate on finishing the lesson.
    const holding = concept.retentionState === RetentionState.HELD || concept.retentionState === RetentionState.REINFORCED;
    const masteryCheck = {
      holding,
      text: holding ? "That's looking solid." : "Let's come back to this one soon.",
      cappedToHeld
    };
    if (active) active.lesson.masteryCheck = masteryCheck;

    // §7.7 — the revision clock restarts from this moment, same personalized
    // decay model used everywhere else; Learn fixes the gap, the Learning
    // Engine stays responsible for making sure it stays fixed.
    this.engine.decayModel.computeNextReview(concept, this.engine.profile.examDate);

    return { attempt, conceptState: concept.retentionState, masteryCheck };
  }

  // ═══════════════════════════════════════════════════════════════
  // §5.12 / §6.2.9 — COMPLETION
  // ═══════════════════════════════════════════════════════════════

  completeLesson({ conceptId, returnTo = 'practice' }) {
    const active = this.activeLessons.get(conceptId);
    const concept = this.engine.graph.getConcept(conceptId);
    if (!active || !concept) {
      throw new Error(`Learn: no active lesson for concept ${conceptId}.`);
    }

    const holding = active.lesson.masteryCheck ? active.lesson.masteryCheck.holding : null;

    this.completedLessons.push({
      conceptId,
      conceptName: concept.name,
      completedAt: Date.now(),
      entryPoint: active.entryPoint,
      masteryHolding: holding,
      reinforcementAttempts: active.reinforcementAttempts.length
    });

    this.activeLessons.delete(conceptId);
    this.abandonCounts.delete(conceptId); // a completed lesson clears the concept's abandon history

    // §5.12 — never strand the student; always a specific, one-tap way back.
    const kaiClosing = holding === false
      ? { text: "This one might need a little more time. Let's come back to it soon.", tone: 'unresolved_but_not_alarmed' }
      : { text: 'Good — back to it. That should feel a little steadier now.', tone: 'confident_handoff' };

    return { conceptId, returnTo, masteryHolding: holding, kaiClosing };
  }

  // ═══════════════════════════════════════════════════════════════
  // §10.1 — EDGE CASES: ABANDON / RESUME
  // ═══════════════════════════════════════════════════════════════

  abandonLesson(conceptId) {
    if (!this.activeLessons.has(conceptId)) return { abandoned: false };
    this.abandonCounts.set(conceptId, (this.abandonCounts.get(conceptId) || 0) + 1);
    this.activeLessons.delete(conceptId);
    return { abandoned: true, abandonCount: this.abandonCounts.get(conceptId) };
  }

  resumeLesson(conceptId) {
    const active = this.activeLessons.get(conceptId);
    return active ? active.lesson : null;
  }

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  toJSON() {
    return {
      activeLessons: Object.fromEntries(
        [...this.activeLessons.entries()].map(([id, a]) => [id, {
          lesson: a.lesson,
          reinforcementAttempts: a.reinforcementAttempts,
          startedAt: a.startedAt,
          entryPoint: a.entryPoint,
          questionId: a.questionId || null
        }])
      ),
      completedLessons: this.completedLessons,
      abandonCounts: Object.fromEntries(this.abandonCounts)
    };
  }

  static fromJSON(engine, data) {
    const mod = new LearnModule(engine);
    if (!data) return mod;
    for (const [id, a] of Object.entries(data.activeLessons || {})) {
      mod.activeLessons.set(id, a);
    }
    mod.completedLessons = data.completedLessons || [];
    mod.abandonCounts = new Map(Object.entries(data.abandonCounts || {}));
    return mod;
  }
}
