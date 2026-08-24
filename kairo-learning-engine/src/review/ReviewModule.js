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
   * Builds a real Review Session plan — Review Module Spec §5.3's flow
   * (Session Framing -> Reflection Moment -> Resolution -> Pattern
   * Surfacing -> Reinforcement Attempt -> Consolidation Summary) needs a
   * concrete list of items plus, for each one, whether it's resurfacing a
   * genuine prior mistake (Reflection Moment, §5.5) or just a due spaced
   * revisit (lighter framing, no prior answer to reconsider) — pulled from
   * buildDailyRecap()'s own queue and each concept's real attemptHistory,
   * not a new prioritisation model of its own (Review never runs a
   * separate intelligence layer, §7.8).
   */
  buildReviewSession({ limit = 8 } = {}) {
    const recap = this.buildDailyRecap();
    const items = recap.queue.slice(0, limit).map((entry) => {
      const concept = this.engine.graph.getConcept(entry.id);
      const history = concept ? concept.attemptHistory : [];
      const lastWrong = [...history].reverse().find((a) => !a.correct);
      return {
        conceptId: entry.id,
        conceptName: entry.name,
        subject: concept?.subject || null,
        topic: concept?.topic || null,
        reason: entry.reason, // 'fading' | 'recently_missed' | 'stale'
        priority: entry.priority,
        hasPriorMiss: !!lastWrong,
        priorQuestionId: lastWrong?.questionId || null,
        priorSelectedOption: lastWrong?.selectedOption || null,
        priorCorrectOption: lastWrong?.correctOption || null,
        priorErrorTag: lastWrong?.errorTag || null,
      };
    });

    // Pattern Surfacing (§5.7): the same misconception type recurring
    // across two or more items in this one session is the exact
    // cross-concept signal the Misconception Library already accumulates
    // (Question Intelligence Model §4.2) — named once here, not left for
    // the student to notice unaided across separate item explanations.
    const tagCounts = {};
    for (const it of items) {
      if (it.priorErrorTag) tagCounts[it.priorErrorTag] = (tagCounts[it.priorErrorTag] || 0) + 1;
    }
    const dominant = Object.entries(tagCounts).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1])[0];

    const fadingCount = items.filter((i) => i.reason === 'fading').length;
    const framing = items.length === 0
      ? "Nothing waiting for review right now."
      : fadingCount > 0
        ? `A quick pass on ${items.length} thing${items.length === 1 ? '' : 's'} — ${fadingCount} starting to fade.`
        : `Let's look back at ${items.length} thing${items.length === 1 ? '' : 's'} worth revisiting.`;

    return {
      items,
      framing,
      estimatedTimeMin: Math.max(1, Math.ceil(items.length * 1.5)),
      pattern: dominant ? { tag: dominant[0], count: dominant[1] } : null,
    };
  }

  /**
   * Pre-Session Recap: shown before main practice if Fading concepts exist.
   * Returns null if nothing urgent — student proceeds to normal practice.
   */
  getPreSessionRecap() {
    const recap = this.buildDailyRecap();
    if (recap.totalConcepts === 0) return null;

    const { fading, recentlyMissed, stale } = recap.breakdown;

    // Suggested Review Session (Review Module §4.3 item 9, §10.1): name
    // whichever category is actually driving urgency, in the same
    // fading > recently-missed > stale priority buildDailyRecap() already
    // ranks its own queue by — never claim "fading" when fadingCount is 0
    // (e.g. a student whose only waiting items are recent mistakes).
    const topCategory = fading > 0 ? 'fading' : recentlyMissed > 0 ? 'recently_missed' : 'stale';
    const topCategoryCount = fading > 0 ? fading : recentlyMissed > 0 ? recentlyMissed : stale;
    const headline = topCategory === 'fading'
      ? `Quick pass on ${topCategoryCount} fading concept${topCategoryCount === 1 ? '' : 's'}`
      : topCategory === 'recently_missed'
        ? `Quick pass on ${topCategoryCount} recent mistake${topCategoryCount === 1 ? '' : 's'}`
        : `Quick pass on ${topCategoryCount} thing${topCategoryCount === 1 ? '' : 's'} slipping away`;

    return {
      hasUrgentReview: true,
      fadingCount: fading,
      topCategory,
      topCategoryCount,
      headline,
      // Previously `+ fading > 0 ? … : …` — operator precedence made this a
      // string concatenated with a number then compared `> 0`, which always
      // evaluated to false, so this sentence silently always fell through to
      // the generic "before new material" branch regardless of fading count.
      message: `You have ${recap.totalConcepts} concept${recap.totalConcepts > 1 ? 's' : ''} waiting for review. ` +
        (fading > 0
          ? `${fading} ${fading > 1 ? 'are' : 'is'} fading — let's reinforce them first.`
          : `Let's do a quick recap before new material.`),
      recap
    };
  }
}
