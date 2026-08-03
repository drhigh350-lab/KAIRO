/**
 * Kairo — RapidFire Engine
 * Timed burst practice. No explanations between questions.
 * Builds speed under pressure + raw recall fluency.
 */

import { clamp } from "../utils/helpers.js";

export class RapidFireEngine {
  constructor(kairoEngine, options = {}) {
    this.engine = kairoEngine;
    this.config = {
      questionCount: options.questionCount || 20,
      timePerQuestionSec: options.timePerQuestionSec || 30,
      subjects: options.subjects || [],
      topics: options.topics || [],
      difficultyCap: options.difficultyCap || 3,
      ...options
    };
    this.state = 'idle'; // idle | running | paused | finished
    this.sessionData = {
      answers: [],
      startTime: null,
      endTime: null,
      streak: 0,
      bestStreak: 0,
      totalTimeMs: 0
    };
  }

  start() {
    this.state = 'running';
    this.sessionData = {
      answers: [],
      startTime: Date.now(),
      endTime: null,
      streak: 0,
      bestStreak: 0,
      totalTimeMs: 0
    };

    // Build queue: mix of Held (speed test) + Fading (urgent review)
    const concepts = this._selectConcepts();
    this.queue = concepts.map(c => c.id);
    this.currentIndex = 0;

    return {
      mode: 'rapid_fire',
      totalQuestions: this.queue.length,
      timePerQuestion: this.config.timePerQuestionSec,
      firstConceptId: this.queue[0]
    };
  }

  _selectConcepts() {
    const all = this.engine.getAllConcepts();
    let pool = all.filter(c => {
      if (this.config.subjects.length > 0 && !this.config.subjects.includes(c.subject)) return false;
      if (this.config.topics.length > 0 && !this.config.topics.includes(c.topic)) return false;
      return c.state === 'held' || c.state === 'fading' || c.state === 'reinforced';
    });

    // Prioritize Fading, then Held, then Reinforced
    pool.sort((a, b) => {
      const order = { fading: 0, held: 1, reinforced: 2, forming: 3, unseen: 4 };
      return (order[a.state] || 5) - (order[b.state] || 5);
    });

    return pool.slice(0, this.config.questionCount);
  }

  submitAnswer({ conceptId, correct, responseTimeMs, selectedOption, correctOption, questionId }) {
    if (this.state !== 'running') return { error: 'Session not running' };

    const now = Date.now();
    this.sessionData.answers.push({
      conceptId, correct, responseTimeMs, selectedOption, correctOption, questionId, answeredAt: now
    });

    if (correct) {
      this.sessionData.streak++;
      this.sessionData.bestStreak = Math.max(this.sessionData.bestStreak, this.sessionData.streak);
    } else {
      this.sessionData.streak = 0;
    }

    this.currentIndex++;
    const nextId = this.currentIndex < this.queue.length ? this.queue[this.currentIndex] : null;

    // Also feed into main engine for retention tracking
    this.engine.submitAnswer({
      conceptId, correct, responseTimeMs, selectedOption, correctOption, questionId,
      questionDifficulty: this.config.difficultyCap
    });

    return {
      correct,
      streak: this.sessionData.streak,
      bestStreak: this.sessionData.bestStreak,
      progress: `${this.currentIndex}/${this.queue.length}`,
      nextConceptId: nextId,
      finished: !nextId
    };
  }

  finish() {
    this.state = 'finished';
    this.sessionData.endTime = Date.now();
    const correct = this.sessionData.answers.filter(a => a.correct).length;
    const accuracy = this.sessionData.answers.length > 0
      ? correct / this.sessionData.answers.length
      : 0;
    const avgTime = this.sessionData.answers.length > 0
      ? this.sessionData.answers.reduce((s, a) => s + a.responseTimeMs, 0) / this.sessionData.answers.length
      : 0;

    // RapidFire runs outside the adaptive engine.currentSession lifecycle
    // (its own queue/streak logic, per this module's own design), so unlike
    // standard Practice's endSession(), nothing else queues a kairo.sessions
    // row for it — do that here, matching the 'rapid_fire' value already
    // reserved in the mode CHECK constraint.
    this.engine.sync.queue({
      type: 'session',
      data: {
        id: `rapidfire_${this.sessionData.startTime}`,
        mode: 'rapid_fire',
        plan: this.queue || [],
        questionsAnswered: this.sessionData.answers.length,
        correctCount: correct,
        eliteScore: null,
        startedAt: this.sessionData.startTime,
        completedAt: this.sessionData.endTime
      }
    });

    return {
      mode: 'rapid_fire',
      totalQuestions: this.sessionData.answers.length,
      correct,
      accuracy: Math.round(accuracy * 100),
      avgTimeMs: Math.round(avgTime),
      bestStreak: this.sessionData.bestStreak,
      durationSec: Math.round((this.sessionData.endTime - this.sessionData.startTime) / 1000)
    };
  }
}
