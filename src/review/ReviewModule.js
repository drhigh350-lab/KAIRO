/**
 * Kairo — ReviewModule
 * Dedicated revision experience. Not a separate tab students must remember to visit.
 * Instead, this powers the "Daily Recap" and "Weakness Review" flows.
 */

import { RetentionState } from "../utils/constants.js";

export class ReviewModule {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
  }

  /**
   * Daily Recap: personalized review session before new practice.
   * Shows concepts that are Fading or were missed recently.
   */
  buildDailyRecap() {
    const graph = this.engine.graph;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Priority 1: Fading concepts
    const fading = Array.from(graph.nodes.values())
      .filter(c => c.retentionState === RetentionState.FADING)
      .sort((a, b) => a.decayEstimate - b.decayEstimate);

    // Priority 2: Recently missed (last 48h)
    const recentlyMissed = Array.from(graph.nodes.values()).filter(c => {
      const recentWrong = c.attemptHistory.slice(-3).filter(a => !a.correct && (now - a.timestamp) < 2 * oneDay);
      return recentWrong.length > 0 && c.retentionState !== RetentionState.REINFORCED;
    });

    // Priority 3: Held but not seen in 7+ days
    const staleHeld = Array.from(graph.nodes.values()).filter(c => {
      return c.retentionState === RetentionState.HELD &&
        c.lastSeenAt && (now - c.lastSeenAt) > 7 * oneDay;
    });

    const queue = [
      ...fading.map(c => ({ id: c.id, name: c.name, reason: 'fading', priority: 'urgent' })),
      ...recentlyMissed.map(c => ({ id: c.id, name: c.name, reason: 'recently_missed', priority: 'high' })),
      ...staleHeld.map(c => ({ id: c.id, name: c.name, reason: 'stale', priority: 'medium' }))
    ];

    return {
      mode: 'daily_recap',
      totalConcepts: queue.length,
      queue: queue.slice(0, 15), // cap at 15 for daily recap
      breakdown: {
        fading: fading.length,
        recentlyMissed: recentlyMissed.length,
        stale: staleHeld.length
      },
      estimatedTimeMin: Math.ceil(queue.length * 1.5)
    };
  }

  /**
   * Weakness Review: deep-dive into specific error patterns.
   * Groups concepts by error tag for targeted practice.
   */
  buildWeaknessReview() {
    const graph = this.engine.graph;
    const concepts = Array.from(graph.nodes.values());

    const byErrorTag = {};
    for (const c of concepts) {
      for (const [tag, count] of c.errorPatternTags.entries()) {
        if (!byErrorTag[tag]) byErrorTag[tag] = [];
        byErrorTag[tag].push({ concept: c, count });
      }
    }

    // Sort each group by frequency
    for (const tag in byErrorTag) {
      byErrorTag[tag].sort((a, b) => b.count - a.count);
    }

    // Find the dominant weakness
    const dominantTag = Object.entries(byErrorTag)
      .sort((a, b) => b[1].reduce((s, x) => s + x.count, 0) - a[1].reduce((s, x) => s + x.count, 0))[0];

    return {
      mode: 'weakness_review',
      byErrorTag,
      dominantWeakness: dominantTag ? {
        tag: dominantTag[0],
        conceptCount: dominantTag[1].length,
        totalOccurrences: dominantTag[1].reduce((s, x) => s + x.count, 0)
      } : null,
      kaiMessage: dominantTag
        ? `I've noticed a pattern: ${dominantTag[0].replace(/_/g, ' ')}. Let's fix that together.`
        : "No clear weakness pattern yet. Keep practicing — I'm watching."
    };
  }

  /**
   * Spaced Repetition Review: concepts due based on nextReviewEstimate.
   */
  buildSpacedReview() {
    const due = this.engine.scheduler.getDueForRevision(this.engine.graph);
    return {
      mode: 'spaced_review',
      dueConcepts: due.slice(0, 20).map(c => ({
        id: c.id,
        name: c.name,
        state: c.retentionState,
        daysOverdue: c.nextReviewEstimate
          ? Math.max(0, Math.floor((Date.now() - c.nextReviewEstimate) / (24 * 60 * 60 * 1000)))
          : 0
      })),
      totalDue: due.length
    };
  }

  /**
   * Pre-Session Recap: shown before main practice if Fading concepts exist.
   * Returns null if nothing urgent — student proceeds to normal practice.
   */
  getPreSessionRecap() {
    const recap = this.buildDailyRecap();
    if (recap.totalConcepts === 0) return null;

    return {
      hasUrgentReview: true,
      fadingCount: recap.breakdown.fading,
      message: `You have ${recap.totalConcepts} concept${recap.totalConcepts > 1 ? 's' : ''} waiting for review. ` +
        recap.breakdown.fading > 0
          ? `${recap.breakdown.fading} ${recap.breakdown.fading > 1 ? 'are' : 'is'} fading — let's reinforce them first.`
          : `Let's do a quick recap before new material.`,
      recap
    };
  }
}
