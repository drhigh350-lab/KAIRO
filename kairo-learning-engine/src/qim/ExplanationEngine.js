/**
 * Kairo QIM — ExplanationEngine
 * Generates structured, adaptive explanations from question metadata.
 * An explanation is a teaching moment, not a correction notice.
 */

export class ExplanationEngine {
  constructor(kaiBehavior, misconceptionLibrary) {
    this.kai = kaiBehavior;
    this.lib = misconceptionLibrary;
  }

  /**
   * Generate a full structured explanation for a question attempt.
   * @param {Question} question
   * @param {Object} attempt — { correct, selectedOption, responseTimeMs, errorTag }
   * @param {ConceptNode} concept
   * @param {string} macroState
   */
  generate({ question, attempt, concept, macroState }) {
    const parts = [];

    // 1. Correct reasoning (always included)
    parts.push({
      type: 'correct_reasoning',
      title: 'The Right Path',
      content: question.explanation || this._generateCorrectReasoning(question)
    });

    // 2. Why each wrong option is wrong — shown for both correct and
    // incorrect attempts. Seeing why the distractors fail reinforces the
    // correct reasoning even on a right answer (Copy Framework: this is
    // teaching, not just correction), and it's the one place a student who
    // guessed right ever finds out the guess wouldn't hold up next time.
    const wrongOptions = question.options.filter(o => o.label !== question.correctOption);
    const distractorExplanations = wrongOptions.map(o => ({
      label: o.label,
      text: o.text,
      whyWrong: question.getDistractorExplanation(o.label) || this._genericWhyWrong(o.label, question),
      misconception: this.lib.diagnoseQuestion(question, o.label)
    }));

    parts.push({
      type: 'distractor_breakdown',
      title: 'Why Each Option Is Wrong',
      content: distractorExplanations
    });

    if (!attempt.correct) {
      // 3. Common mistake (only if backed by data) — "students often pick
      // X" only means something to surface to a student who picked it.
      const mostSelectedDistractor = this._getMostSelectedDistractor(question);
      if (mostSelectedDistractor) {
        parts.push({
          type: 'common_mistake',
          title: 'A Common Pattern',
          content: `Many students choose ${mostSelectedDistractor.label}. ${mostSelectedDistractor.whyWrong}`,
          neutral: true
        });
      }
    }

    // 4. Exam tip (transferable strategy)
    const examTip = this._generateExamTip(question);
    if (examTip) {
      parts.push({
        type: 'exam_tip',
        title: 'Exam Strategy',
        content: examTip
      });
    }

    // 5. Memory anchor (for future retrieval) — omitted when nothing genuine exists
    const memoryAnchor = this._generateMemoryAnchor(question, concept);
    if (memoryAnchor) {
      parts.push({
        type: 'memory_anchor',
        title: 'Remember This',
        content: memoryAnchor
      });
    }

    // 6. Related concept (from dependency graph)
    if (concept && concept.dependencyIds.length > 0) {
      parts.push({
        type: 'related_concept',
        title: 'Built On',
        content: `This question assumes you know: ${concept.dependencyIds.join(', ')}`
      });
    }

    // 7. Suggested follow-up (from relationship graph)
    parts.push({
      type: 'follow_up',
      title: 'Practice This Next',
      content: this._suggestFollowUp(question, attempt)
    });

    // 8. Kai's encouragement (adaptive by macro-state and error tag)
    parts.push({
      type: 'kai_encouragement',
      title: 'From Kai',
      content: this._kaiMessage(attempt, concept, macroState)
    });

    // 9. Length adaptation: shorter for careless_slip, longer for conceptual_gap
    const adaptedParts = this._adaptLength(parts, attempt.errorTag, macroState);

    return {
      questionId: question.id,
      conceptName: concept?.name || question.topic,
      parts: adaptedParts,
      fullLength: parts.length,
      shownLength: adaptedParts.length
    };
  }

  _generateCorrectReasoning(question) {
    return question.explanation || `The correct answer is ${question.correctOption}. This tests ${question.learningObjective || question.topic}.`;
  }

  _genericWhyWrong(optionLabel, question) {
    return `This option does not satisfy the conditions of the question.`;
  }

  _getMostSelectedDistractor(question) {
    const counts = question.empiricalStats?.distractorSelectionCounts || {};
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    const [label, count] = entries[0];
    const option = question.options.find(o => o.label === label);
    return option ? { label, text: option.text, whyWrong: question.getDistractorExplanation(label), count } : null;
  }

  /**
   * readingLoad is checked ahead of calculationLoad: the 'high' tip below
   * is about how to read the stem, which applies regardless of how much
   * calculation follows. calculationLoad's own tip runs only when reading
   * load isn't the bottleneck. Every real value of both fields (checked
   * directly against production: calculationLoad none|light|moderate|heavy,
   * readingLoad low|medium|high) resolves to a tip here — 'light' and
   * 'high' previously had no matching key in the old single calculationLoad-
   * only lookup, so calculation-light and reading-heavy questions silently
   * got no exam tip at all.
   */
  _generateExamTip(question) {
    if (question.readingLoad === 'high') {
      return 'Read the stem twice before looking at options. Long questions often hide key conditions in the middle.';
    }

    const calcTips = {
      'light': 'Plug in values carefully and sanity-check the answer\'s order of magnitude before selecting.',
      'moderate': 'Check your units before calculating. Many correct methods fail at the unit-conversion step.',
      'heavy': 'Break the calculation into steps. Write down each intermediate value — one early error compounds.'
    };
    if (question.calculationLoad !== 'none' && calcTips[question.calculationLoad]) {
      return calcTips[question.calculationLoad];
    }

    const cognitiveTips = {
      'recall': 'This is a fact-check question. If you do not know it immediately, eliminate obviously wrong options first.',
      'application': 'Identify the concept being tested before calculating. The numbers matter less than knowing which formula applies.',
      'analysis': 'Look for what the question is asking vs. what it seems to ask. The distractors often answer a different question.',
      'synthesis': 'Map out all given information first. Synthesis questions require you to connect multiple pieces before solving.'
    };
    return cognitiveTips[question.cognitiveLevel] || null;
  }

  /**
   * Real, hand-authored memory anchors require subject-matter authoring
   * per concept — out of scope to fabricate here, and a prior hardcoded
   * 5-entry map (keyed by concept/topic names like 'Stoichiometry',
   * 'Mole Concept') matched zero of the 201 concepts actually seeded in
   * production, so every question silently fell through to a generic
   * "Key idea: {learningObjective}" filler line dressed up as a memory
   * anchor. Returns null — omitted cleanly — until a real per-concept
   * anchor exists, matching the contract LearnModule already documents
   * for this field (§5.9/§6.2.3: "omitted cleanly when nothing genuine
   * exists").
   */
  _generateMemoryAnchor(question, concept) {
    const anchors = {};
    return anchors[concept?.name] || anchors[question.topic] || null;
  }

  _suggestFollowUp(question, attempt) {
    if (attempt.correct) {
      return attempt.errorTag === 'careless_slip' 
        ? 'A similar question to solidify the pattern — but slow down this time.'
        : 'An extension question that builds on this concept one step further.';
    } else {
      return attempt.errorTag === 'conceptual_gap'
        ? 'A foundational question on the prerequisite concept first.'
        : 'A reinforcement question on the same concept with different wording.';
    }
  }

  _kaiMessage(attempt, concept, macroState) {
    if (attempt.correct) {
      if (attempt.errorTag === 'careless_slip') {
        return 'Your reasoning was right — just a small slip. That happens under pressure. The knowledge is there.';
      }
      return `Clean on "${concept?.name || 'this'}". The pattern is building.`;
    }

    const messages = {
      'conceptual_gap': `Not quite — let's look at "${concept?.name || 'this'}" from a different angle. The concept is reachable.`,
      'careless_slip': 'Your approach was solid — small execution error. It happens.',
      'misapplied_rule': `This looks like a rule mix-up. Let's draw the line clearly between the two concepts.`,
      'partial_understanding': `You're almost there — the setup was right. Let's isolate the broken step.`,
      'guessed': `Let's find your actual starting point — no judgment, just accuracy.`,
      'misread_question': 'Take a closer look at what the question is actually asking. This is a reading signal, not a knowledge gap.'
    };

    return messages[attempt.errorTag] || messages['conceptual_gap'];
  }

  _adaptLength(parts, errorTag, macroState) {
    // Shorter for careless_slip or Peak Readiness
    if (errorTag === 'careless_slip') {
      return parts.filter(p => ['correct_reasoning', 'kai_encouragement'].includes(p.type));
    }
    if (macroState === 'peak_readiness') {
      return parts.filter(p => !['related_concept', 'memory_anchor'].includes(p.type));
    }
    // Longer for conceptual_gap in Orienting state
    if (errorTag === 'conceptual_gap' && macroState === 'orienting') {
      return parts; // show everything
    }
    // Default: show most parts
    return parts.filter(p => p.type !== 'related_concept');
  }
}
