/**
 * Kairo — RevisionScheduler
 * Converts decay estimates into an actual operating calendar.
 * Revision is dissolved into ordinary practice — no separate "revision tab."
 */

import { DecayConstants } from "../utils/constants.js";
import { clamp, isExamProximity } from "../utils/helpers.js";

export class RevisionScheduler {
  constructor(decayModel, examDate = null) {
    this.decayModel = decayModel;
    this.examDate = examDate;
  }

  /**
   * Build a revision-integrated session plan.
   * Fading concepts become high-priority items in the next session's queue.
   * @param {KnowledgeGraph} graph
   * @returns {Array<ConceptNode>} concepts due for interleaved revision
   */
  getDueForRevision(graph) {
    const now = Date.now();
    const due = [];

    for (const concept of graph.nodes.values()) {
      if (concept.retentionState === 'unseen') continue;

      const nextReview = concept.nextReviewEstimate;
      const isDue = !nextReview || nextReview <= now;
      const isFading = concept.retentionState === 'fading';

      if (isDue || isFading) {
        due.push(concept);
      }
    }

    // Sort by urgency: lower decayEstimate = more urgent
    due.sort((a, b) => a.decayEstimate - b.decayEstimate);
    return due;
  }

  /**
   * After a session, update nextReviewEstimate for all touched concepts.
   */
  scheduleNextReviews(graph, touchedConceptIds) {
    for (const id of touchedConceptIds) {
      const concept = graph.getConcept(id);
      if (!concept) continue;
      this.decayModel.computeNextReview(concept, this.examDate);
    }
  }

  /**
   * Interleave revision items with new material.
   * Never group all revision into one block.
   */
  interleaveSessionQueue(revisionConcepts, newConcepts, maxLength = 20) {
    const queue = [];
    let r = 0, n = 0;

    // Alternate: revision, new, revision, new...
    while ((r < revisionConcepts.length || n < newConcepts.length) && queue.length < maxLength) {
      if (r < revisionConcepts.length) queue.push(revisionConcepts[r++]);
      if (n < newConcepts.length) queue.push(newConcepts[n++]);
    }

    return queue;
  }

  /**
   * Exam proximity compression: in final 6–8 weeks, all intervals shrink.
   */
  applyExamProximity(graph) {
    if (!this.examDate || !isExamProximity(this.examDate)) return;

    for (const concept of graph.nodes.values()) {
      if (concept.nextReviewEstimate) {
        const interval = concept.nextReviewEstimate - Date.now();
        const compressed = interval * DecayConstants.EXAM_PROXIMITY_COMPRESSION;
        concept.nextReviewEstimate = Date.now() + compressed;
      }
    }
  }
}
