/**
 * Kairo QIM — QuestionRelationshipGraph
 * Questions are nodes in a relationship graph, not items in a flat list.
 * This powers fast, intelligent question selection without scanning the entire bank.
 */

export class QuestionRelationshipGraph {
  constructor() {
    this.questions = new Map(); // id -> Question
    this.relationships = new Map(); // questionId -> { type: [relatedIds] }
  }

  addQuestion(question) {
    this.questions.set(question.id, question);
    if (!this.relationships.has(question.id)) {
      this.relationships.set(question.id, {
        prerequisite: [],
        reinforcement: [],
        extension: [],
        alternativeWording: [],
        higherDifficulty: [],
        lowerDifficulty: [],
        sameMisconception: [],
        sameLearningObjective: [],
        bridge: [],
        challenge: []
      });
    }
  }

  getQuestion(id) {
    return this.questions.get(id);
  }

  /**
   * Link two questions with a relationship type.
   */
  link(fromId, toId, type) {
    const rels = this.relationships.get(fromId);
    if (!rels) return;
    if (!rels[type]) rels[type] = [];
    if (!rels[type].includes(toId)) rels[type].push(toId);
  }

  /**
   * Get related questions by type.
   */
  getRelated(questionId, type) {
    const rels = this.relationships.get(questionId);
    if (!rels || !rels[type]) return [];
    return rels[type].map(id => this.questions.get(id)).filter(Boolean);
  }

  /**
   * Find a reinforcement question (same concept, different wording).
   */
  findReinforcement(questionId, excludeIds = []) {
    const candidates = this.getRelated(questionId, 'reinforcement')
      .concat(this.getRelated(questionId, 'alternativeWording'));
    return candidates.filter(q => !excludeIds.includes(q.id) && q.lifecycleState === 'live');
  }

  /**
   * Find an extension question (next step up in same concept).
   */
  findExtension(questionId, excludeIds = []) {
    const candidates = this.getRelated(questionId, 'extension')
      .concat(this.getRelated(questionId, 'higherDifficulty'));
    return candidates.filter(q => !excludeIds.includes(q.id) && q.lifecycleState === 'live');
  }

  /**
   * Find a prerequisite check question.
   */
  findPrerequisiteCheck(questionId) {
    const q = this.questions.get(questionId);
    if (!q) return [];

    // Look for prerequisite questions linked to this one
    const prereqQuestions = this.getRelated(questionId, 'prerequisite');

    // Also find questions testing the prerequisite concepts
    for (const prereqConceptId of q.prerequisiteConcepts) {
      for (const [id, question] of this.questions) {
        if (id === questionId) continue;
        const testsPrereq = question.conceptsTested.some(
          c => c.conceptId === prereqConceptId && c.weight === 'primary'
        );
        if (testsPrereq && question.lifecycleState === 'live') {
          prereqQuestions.push(question);
        }
      }
    }

    return [...new Set(prereqQuestions)]; // deduplicate
  }

  /**
   * Find a diagnostic question for a specific misconception.
   */
  findDiagnosticForMisconception(misconceptionId, conceptId, excludeIds = []) {
    const matches = [];
    for (const q of this.questions.values()) {
      if (excludeIds.includes(q.id)) continue;
      if (q.lifecycleState !== 'live') continue;

      const hasMisconception = q.distractors.some(d => d.misconceptionId === misconceptionId);
      const testsConcept = q.conceptsTested.some(c => c.conceptId === conceptId);

      if (hasMisconception && testsConcept) {
        matches.push(q);
      }
    }
    return matches;
  }

  /**
   * Find bridge questions (cross-concept) for compounding students.
   */
  findBridgeQuestions(conceptIds, excludeIds = []) {
    const matches = [];
    for (const q of this.questions.values()) {
      if (excludeIds.includes(q.id)) continue;
      if (q.lifecycleState !== 'live') continue;

      const testedIds = q.getAllConceptIds();
      const overlap = testedIds.filter(id => conceptIds.includes(id));
      if (overlap.length >= 2) {
        matches.push(q);
      }
    }
    return matches;
  }

  /**
   * Find challenge questions above current level.
   */
  findChallengeQuestions(conceptId, currentDifficulty, excludeIds = []) {
    const matches = [];
    for (const q of this.questions.values()) {
      if (excludeIds.includes(q.id)) continue;
      if (q.lifecycleState !== 'live') continue;

      const testsConcept = q.conceptsTested.some(c => c.conceptId === conceptId);
      if (testsConcept && q.difficultyRating > currentDifficulty) {
        matches.push(q);
      }
    }
    return matches.sort((a, b) => a.difficultyRating - b.difficultyRating);
  }

  /**
   * Auto-build relationships based on concept overlap and difficulty.
   */
  autoBuildRelationships() {
    const questions = Array.from(this.questions.values());

    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const a = questions[i];
        const b = questions[j];

        if (a.id === b.id) continue;

        const aConcepts = new Set(a.getAllConceptIds());
        const bConcepts = new Set(b.getAllConceptIds());

        // Check concept overlap
        const shared = [...aConcepts].filter(id => bConcepts.has(id));
        if (shared.length === 0) continue;

        // Alternative wording: same primary concept, similar difficulty
        const aPrimary = a.getPrimaryConcept()?.conceptId;
        const bPrimary = b.getPrimaryConcept()?.conceptId;
        if (aPrimary === bPrimary && Math.abs(a.difficultyRating - b.difficultyRating) <= 1) {
          this.link(a.id, b.id, 'alternativeWording');
          this.link(b.id, a.id, 'alternativeWording');
        }

        // Higher/lower difficulty
        if (aPrimary === bPrimary) {
          if (b.difficultyRating > a.difficultyRating) {
            this.link(a.id, b.id, 'higherDifficulty');
            this.link(b.id, a.id, 'lowerDifficulty');
          } else if (a.difficultyRating > b.difficultyRating) {
            this.link(b.id, a.id, 'higherDifficulty');
            this.link(a.id, b.id, 'lowerDifficulty');
          }
        }

        // Bridge: multiple shared concepts
        if (shared.length >= 2) {
          this.link(a.id, b.id, 'bridge');
          this.link(b.id, a.id, 'bridge');
        }
      }
    }
  }

  /**
   * Get all live questions for a concept.
   */
  getQuestionsForConcept(conceptId) {
    return Array.from(this.questions.values()).filter(q =>
      q.lifecycleState === 'live' &&
      q.conceptsTested.some(c => c.conceptId === conceptId)
    );
  }

  toJSON() {
    return {
      questions: Array.from(this.questions.values()).map(q => q.toJSON()),
      relationships: Object.fromEntries(this.relationships)
    };
  }

  static fromJSON(data) {
    const graph = new QuestionRelationshipGraph();
    for (const qData of data.questions || []) {
      graph.addQuestion(Question.fromJSON(qData));
    }
    for (const [id, rels] of Object.entries(data.relationships || {})) {
      graph.relationships.set(id, rels);
    }
    return graph;
  }
}

import { Question } from "./Question.js";
