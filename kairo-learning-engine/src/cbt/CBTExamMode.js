/**
 * Kairo — CBTExamMode
 * Full UTME simulation with JAMB-style timing, navigation, and scoring.
 */

export class CBTExamMode {
  // JAMB standard: English is compulsory and carries 60 questions;
  // every other subject in the combination carries 40 (CBT Exam Mode
  // Spec §4.5 — treated as ground truth, not configurable, for a real
  // UTME Mock). A uniform per-subject count would misrepresent the
  // actual exam format the module exists to rehearse. Keyed to
  // 'Use of English' to match the subject name actually seeded in
  // kairo.questions/concepts (JAMB calls the subject "English" for
  // short, but TECHMED's content catalog uses its full JAMB name).
  static JAMB_QUESTION_COUNT = { 'Use of English': 60, default: 40 };
  static JAMB_TOTAL_TIME_MIN = 120;

  constructor(kairoEngine) {
    this.engine = kairoEngine;
    this.config = {
      subjects: [],
      totalQuestions: 180, // UTME standard
      totalTimeMin: CBTExamMode.JAMB_TOTAL_TIME_MIN
    };
    this.state = 'idle'; // idle | setup | running | paused | submitted | finished
    this.examData = null;
  }

  _questionCountFor(subject) {
    return CBTExamMode.JAMB_QUESTION_COUNT[subject] ?? CBTExamMode.JAMB_QUESTION_COUNT.default;
  }

  /**
   * Configure a mock exam.
   */
  setup({ subjects = ['Use of English', 'Biology', 'Chemistry', 'Physics'],
          difficultyMix = 'mixed' }) {
    // JAMB's UTME CBT is a fixed 2-hour sitting regardless of subject count
    // — it was previously computed as subjects.length * 26 (104 min for the
    // standard 4-subject combination), which doesn't match the real exam
    // and doesn't match this class's own JAMB_TOTAL_TIME_MIN constant.
    const totalTimeMin = CBTExamMode.JAMB_TOTAL_TIME_MIN;
    this.config = { subjects, totalTimeMin, difficultyMix };
    this.state = 'setup';

    const totalQuestions = subjects.reduce((sum, s) => sum + this._questionCountFor(s), 0);

    return {
      mode: 'cbt_mock',
      subjects,
      totalQuestions,
      totalTimeMin
    };
  }

  /**
   * Build the exam paper by pulling questions from downloaded packs.
   */
  async buildPaper() {
    const paper = [];
    let globalIndex = 0;

    for (const subject of this.config.subjects) {
      const questions = await this.engine.contentPacks.getOfflineQuestions({
        subject,
        count: this._questionCountFor(subject)
      });

      for (let i = 0; i < questions.length; i++) {
        paper.push({
          globalIndex: globalIndex++,
          subjectIndex: i,
          subject,
          ...questions[i],
          studentAnswer: null,
          timeSpentMs: 0,
          flagged: false,
          visited: false
        });
      }
    }

    this.examData = {
      paper,
      startTime: null,
      endTime: null,
      currentIndex: 0,
      answers: {},
      subjectTimes: {},
      flagged: new Set()
    };

    return {
      totalQuestions: paper.length,
      subjects: this.config.subjects,
      paper: paper.map(q => ({
        globalIndex: q.globalIndex,
        subject: q.subject,
        questionId: q.questionId || q.id,
        text: q.text,
        options: q.options
      }))
    };
  }

  start() {
    if (!this.examData) throw new Error('Exam paper not built. Call buildPaper() first.');
    this.state = 'running';
    this.examData.startTime = Date.now();

    // Initialize subject timers
    for (const subject of this.config.subjects) {
      this.examData.subjectTimes[subject] = 0;
    }

    return {
      started: true,
      startTime: this.examData.startTime,
      currentQuestion: this.examData.paper[0]
    };
  }

  /**
   * Navigate to a specific question.
   */
  navigateTo(globalIndex) {
    if (this.state !== 'running') return { error: 'Exam not running' };
    if (globalIndex < 0 || globalIndex >= this.examData.paper.length) {
      return { error: 'Invalid question index' };
    }

    this.examData.currentIndex = globalIndex;
    const q = this.examData.paper[globalIndex];
    q.visited = true;

    return {
      globalIndex,
      subject: q.subject,
      question: {
        text: q.text,
        options: q.options,
        questionId: q.questionId || q.id
      },
      studentAnswer: this.examData.answers[globalIndex] || null,
      flagged: this.examData.flagged.has(globalIndex),
      isFirst: globalIndex === 0,
      isLast: globalIndex === this.examData.paper.length - 1
    };
  }

  /**
   * Submit an answer for the current question.
   *
   * CBT Exam Mode Spec §2.3 / §5.2 / §5.4: no correctness signal of any
   * kind — not isCorrect, not the correct option, not an explanation —
   * may reach the student during a live attempt. Feedback is withheld
   * entirely until finish()/_calculateResults() runs after submission.
   */
  submitAnswer(globalIndex, selectedOption, timeSpentMs) {
    if (this.state !== 'running') return { error: 'Exam not running' };

    const q = this.examData.paper[globalIndex];
    this.examData.answers[globalIndex] = selectedOption;
    q.studentAnswer = selectedOption;
    q.timeSpentMs = timeSpentMs;
    this.examData.subjectTimes[q.subject] += timeSpentMs;

    return {
      globalIndex,
      recorded: true,
      nextIndex: globalIndex + 1 < this.examData.paper.length ? globalIndex + 1 : null
    };
  }

  toggleFlag(globalIndex) {
    if (this.examData.flagged.has(globalIndex)) {
      this.examData.flagged.delete(globalIndex);
      return { flagged: false };
    } else {
      this.examData.flagged.add(globalIndex);
      return { flagged: true };
    }
  }

  /**
   * Get exam progress overview (for the sidebar/nav).
   */
  getProgress() {
    const total = this.examData.paper.length;
    const answered = Object.keys(this.examData.answers).length;
    const flagged = this.examData.flagged.size;
    const visited = this.examData.paper.filter(q => q.visited).length;
    const unanswered = total - answered;

    // Per-subject breakdown
    const bySubject = {};
    for (const subject of this.config.subjects) {
      const subjectQs = this.examData.paper.filter(q => q.subject === subject);
      const subjectAnswered = subjectQs.filter(q => q.studentAnswer !== null).length;
      bySubject[subject] = {
        total: subjectQs.length,
        answered: subjectAnswered,
        unanswered: subjectQs.length - subjectAnswered
      };
    }

    // Time remaining
    const elapsedMs = Date.now() - this.examData.startTime;
    const totalTimeMs = this.config.totalTimeMin * 60 * 1000;
    const remainingMs = Math.max(0, totalTimeMs - elapsedMs);

    return {
      total,
      answered,
      unanswered,
      flagged,
      visited,
      bySubject,
      elapsedMin: Math.floor(elapsedMs / 60000),
      remainingMin: Math.ceil(remainingMs / 60000),
      percentComplete: Math.round((answered / total) * 100)
    };
  }

  /**
   * Auto-submit when time expires.
   */
  autoSubmit() {
    this.state = 'submitted';
    return this.finish();
  }

  /**
   * Student manually submits.
   */
  submit() {
    this.state = 'submitted';
    return this.finish();
  }

  finish() {
    this.examData.endTime = Date.now();
    const results = this._calculateResults();
    this.state = 'finished';

    // Feed results into main engine for retention tracking
    for (const r of results.questionResults) {
      if (r.conceptId) {
        this.engine.submitAnswer({
          conceptId: r.conceptId,
          correct: r.isCorrect,
          responseTimeMs: r.timeSpentMs,
          selectedOption: r.studentAnswer,
          correctOption: r.correctOption,
          questionId: r.questionId,
          questionDifficulty: r.difficulty || 2
        });
      }
    }

    // CBT manages its own attempt lifecycle outside engine.currentSession
    // (Section 5.4 forbids the adaptive session machinery from touching a
    // live attempt at all), so unlike standard Practice's endSession(),
    // nothing else queues a kairo.sessions row for a completed mock —
    // do that here, matching the 'cbt_exam' value already reserved in the
    // mode CHECK constraint.
    this.engine.sync.queue({
      type: 'session',
      data: {
        id: `cbt_${this.examData.startTime}`,
        mode: 'cbt_exam',
        plan: this.config.subjects,
        questionsAnswered: results.answered,
        correctCount: results.correct,
        eliteScore: { percentage: results.percentage, score: results.score, maxScore: results.maxScore },
        startedAt: this.examData.startTime,
        completedAt: this.examData.endTime
      }
    });

    return results;
  }

  _calculateResults() {
    const paper = this.examData.paper;
    const results = [];
    let totalCorrect = 0;
    let totalScore = 0;

    const bySubject = {};
    for (const subject of this.config.subjects) {
      bySubject[subject] = { correct: 0, total: 0, score: 0 };
    }

    for (const q of paper) {
      const isCorrect = q.studentAnswer === q.correctOption;
      if (isCorrect) {
        totalCorrect++;
        bySubject[q.subject].correct++;
      }
      bySubject[q.subject].total++;

      results.push({
        globalIndex: q.globalIndex,
        subject: q.subject,
        questionId: q.questionId || q.id,
        conceptId: q.conceptId,
        studentAnswer: q.studentAnswer,
        correctOption: q.correctOption,
        isCorrect,
        timeSpentMs: q.timeSpentMs,
        difficulty: q.difficulty || 2,
        flagged: this.examData.flagged.has(q.globalIndex)
      });
    }

    // UTME scoring: each question typically 1 mark
    totalScore = totalCorrect;
    const maxScore = paper.length;
    const percentage = Math.round((totalScore / maxScore) * 100);

    // Time analysis
    const totalTimeMs = this.examData.endTime - this.examData.startTime;
    const avgTimePerQuestion = totalTimeMs / paper.length;

    return {
      mode: 'cbt_mock',
      totalQuestions: paper.length,
      answered: Object.keys(this.examData.answers).length,
      correct: totalCorrect,
      score: totalScore,
      maxScore,
      percentage,
      bySubject: Object.entries(bySubject).map(([subject, data]) => ({
        subject,
        ...data,
        percentage: Math.round((data.correct / data.total) * 100)
      })),
      timeAnalysis: {
        totalTimeMin: Math.round(totalTimeMs / 60000),
        avgTimePerQuestionSec: Math.round(avgTimePerQuestion / 1000),
        subjectBreakdown: Object.entries(this.examData.subjectTimes).map(([s, t]) => ({
          subject: s,
          timeMin: Math.round(t / 60000)
        }))
      },
      questionResults: results,
      kaiSummary: this._generateKaiSummary(totalCorrect, maxScore, bySubject)
    };
  }

  _generateKaiSummary(correct, total, bySubject) {
    const pct = correct / total;
    if (pct >= 0.8) {
      return `Strong performance. You're operating at exam-readiness level. Focus on speed consistency.`;
    } else if (pct >= 0.6) {
      return `Solid foundation with clear gaps. I've identified the specific concepts to prioritize next.`;
    } else if (pct >= 0.4) {
      return `This is a starting point, not a verdict. The gaps are specific and fixable. Let's build from here.`;
    } else {
      return `No shame in this score — it tells me exactly where to begin. We'll rebuild systematically.`;
    }
  }
}
