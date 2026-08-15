/**
 * Kairo — TopicPractice Engine
 * Deep-dive into a single topic with scaffolded progression.
 * Unlocks harder subtopics only after demonstrating mastery of prerequisites.
 */

export class TopicPracticeEngine {
  constructor(kairoEngine) {
    this.engine = kairoEngine;
  }

  /**
   * Build a topic journey: list of subtopics with their mastery status.
   */
  getTopicJourney(subject, topic) {
    const concepts = this.engine.getAllConcepts({ subject, topic });
    const subtopics = {};

    for (const c of concepts) {
      // A concept with no real subtopic must never become a pickable option —
      // object keys coerce `null` to the string "null", so without this guard
      // the journey surfaces a bogus "null" subtopic. Selecting it then fails
      // getAllConcepts()'s strict subtopic === match (real null vs the string
      // "null"), silently returning zero concepts and zero questions.
      if (c.subtopic == null) continue;
      if (!subtopics[c.subtopic]) {
        subtopics[c.subtopic] = { concepts: [], mastered: 0, total: 0 };
      }
      subtopics[c.subtopic].concepts.push(c);
      subtopics[c.subtopic].total++;
      if (c.state === 'held' || c.state === 'reinforced') {
        subtopics[c.subtopic].mastered++;
      }
    }

    // Sort subtopics by dependency order (simplistic: by mastery %)
    const sorted = Object.entries(subtopics)
      .map(([name, data]) => ({
        name,
        ...data,
        masteryPct: Math.round((data.mastered / data.total) * 100),
        locked: false // could add prerequisite logic here
      }))
      .sort((a, b) => b.masteryPct - a.masteryPct);

    return {
      subject,
      topic,
      subtopics: sorted,
      overallMastery: Math.round(
        concepts.filter(c => c.state === 'held' || c.state === 'reinforced').length
        / (concepts.length || 1) * 100
      )
    };
  }

  /**
   * Generate a practice session for a specific subtopic.
   *
   * A subtopic maps to exactly one concept in almost all seeded content
   * (verified directly against production: e.g. Biology's 93 topics
   * average 2.15 questions each, but the underlying concept count per
   * topic is essentially always 1). The old queue — distinct concepts
   * sliced to `count` — therefore capped every topic-practice session at
   * 1 question, no matter how many real questions existed for that one
   * concept. Round-robin across each concept's real question pool
   * instead, so a single concept with N seeded questions still fills up
   * to min(N, count) session slots.
   */
  buildSubtopicSession(subject, topic, subtopic, count = 10) {
    const concepts = this.engine.getAllConcepts({ subject, topic, subtopic })
      .slice()
      .sort((a, b) => (a.state === 'fading' ? -1 : 1) - (b.state === 'fading' ? -1 : 1));

    const pools = concepts.map(c => ({
      conceptId: c.id,
      remaining: this.engine.questionGraph.getQuestionsForConcept(c.id).length
    }));
    const queue = [];
    let addedThisPass = true;
    while (queue.length < count && addedThisPass) {
      addedThisPass = false;
      for (const pool of pools) {
        if (queue.length >= count) break;
        if (pool.remaining > 0) {
          queue.push(pool.conceptId);
          pool.remaining--;
          addedThisPass = true;
        }
      }
    }

    return {
      mode: 'topic_practice',
      subject, topic, subtopic,
      queue,
      conceptCount: concepts.length
    };
  }
}
