/**
 * Kairo — CustomPractice Engine
 * Student chooses: subjects, topics, difficulty range, question count.
 * Engine still injects Fading concepts as priority.
 */

export class CustomPracticeEngine {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
  }

  buildSession({ subjects = [], topics = [], subtopics = [], difficultyRange = [1, 5], count = 15, includeFading = true }) {
    const all = this.engine.getAllConcepts();

    let pool = all.filter(c => {
      if (subjects.length > 0 && !subjects.includes(c.subject)) return false;
      if (topics.length > 0 && !topics.includes(c.topic)) return false;
      if (subtopics.length > 0 && !subtopics.includes(c.subtopic)) return false;
      return true;
    });

    // If includeFading, prioritize Fading concepts even outside selected filters
    if (includeFading) {
      const fading = all.filter(c => c.state === 'fading');
      // Merge: fading first, then selected pool
      const fadingIds = new Set(fading.map(c => c.id));
      pool = [...fading, ...pool.filter(c => !fadingIds.has(c.id))];
    }

    // Deduplicate and slice
    const seen = new Set();
    const queue = [];
    for (const c of pool) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        queue.push(c.id);
      }
      if (queue.length >= count) break;
    }

    return {
      mode: 'custom_practice',
      queue,
      subjects,
      topics,
      count: queue.length
    };
  }
}
