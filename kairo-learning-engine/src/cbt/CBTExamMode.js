/**
 * Kairo — CBTExamMode
 * Full UTME simulation with JAMB-style timing, navigation, and scoring.
 */

import { EliteScore } from "../engine/EliteScore.js";
import { KairoPointsAwards } from "../utils/constants.js";

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
  // The real JAMB UTME combination is always 1 compulsory + 3 electives —
  // 60 + 40*3 = 180 — regardless of which specific subjects fill the
  // elective slots. Used as the reference ratio for Subject-Specific Mock's
  // "proportional share of the full exam" pacing (CBT Exam Mode Spec §4.3),
  // not as a count of any one student's actual combination.
  static JAMB_FULL_COMBO_QUESTIONS = 180;

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
    if (this.config.customQuestionCounts?.[subject] != null) return this.config.customQuestionCounts[subject];
    return CBTExamMode.JAMB_QUESTION_COUNT[subject] ?? CBTExamMode.JAMB_QUESTION_COUNT.default;
  }

  /**
   * Configure a mock exam.
   *
   * examType distinguishes the three setup shapes CBT Exam Mode Spec §4.3
   * defines that this engine can honestly serve today from real seeded
   * content — 'full' (the complete JAMB combination, fixed 2-hour sitting),
   * 'subject' (one subject at its own proportional share of the full
   * exam's pacing), and 'custom' (student-set scope and bounded
   * question-count/duration presets). Past Question Simulation and
   * Official TECHMED Mock Events are separate, not-yet-built content
   * pipelines (tagged past papers, admin-scheduled events) — out of scope
   * here.
   */
  setup({ subjects = ['Use of English', 'Biology', 'Chemistry', 'Physics'],
          difficultyMix = 'mixed',
          examType = 'full',
          customQuestionCounts = null,
          customTotalTimeMin = null }) {
    this.config = { subjects, difficultyMix, examType, customQuestionCounts };
    this.state = 'setup';

    const totalQuestions = customQuestionCounts
      ? Object.values(customQuestionCounts).reduce((sum, n) => sum + n, 0)
      : subjects.reduce((sum, s) => sum + this._questionCountFor(s), 0);

    // JAMB's UTME CBT is a fixed 2-hour sitting regardless of subject count
    // — it was previously computed as subjects.length * 26 (104 min for the
    // standard 4-subject combination), which doesn't match the real exam
    // and doesn't match this class's own JAMB_TOTAL_TIME_MIN constant.
    // That fixed duration is exam-accurate only for the *full* combination;
    // a Subject-Specific or Custom Mock covering fewer questions gets that
    // same share of the full exam's pacing instead (Section 4.3), not the
    // full 120 minutes for a fraction of the paper.
    let totalTimeMin;
    if (examType === 'full') {
      totalTimeMin = CBTExamMode.JAMB_TOTAL_TIME_MIN;
    } else if (customTotalTimeMin) {
      totalTimeMin = customTotalTimeMin;
    } else {
      totalTimeMin = Math.max(1, Math.round(
        (CBTExamMode.JAMB_TOTAL_TIME_MIN * totalQuestions) / CBTExamMode.JAMB_FULL_COMBO_QUESTIONS
      ));
    }
    this.config.totalTimeMin = totalTimeMin;

    return {
      mode: 'cbt_mock',
      examType,
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

    // Feed results into main engine for retention tracking. A question the
    // student never answered (left blank under time pressure — completely
    // normal in a real timed CBT mock, not an edge case) keeps buildPaper()'s
    // default timeSpentMs: 0 all the way through — that's not a genuine
    // attempt with a real response time, it's an absence of one, and
    // kairo.attempts' own anti-cheat trigger (check_attempt_before_insert,
    // response_time_ms < 150ms) correctly rejects it. Since pushAttempts()
    // inserts the whole pending batch in one statement, one rejected
    // 0ms attempt previously aborted that entire insert — and because
    // fullSync() ran attempts before sessions/cbt_results, it silently took
    // the exam's own session record and score with it too, with the
    // failure swallowed by SyncManager.sync()'s catch and never shown to
    // the student. Confirmed against production Postgres logs after a
    // real CBT run: "Invalid attempt: response_time_ms implausibly low (0
    // ms)" — the exam finished and scored correctly, but never synced.
    for (const r of results.questionResults) {
      if (r.conceptId && r.studentAnswer != null) {
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
    // mode CHECK constraint. Also record it onto the local profile
    // directly — endSession() is the only other place that calls
    // recordSession(), so without this a finished CBT mock never counted
    // toward totalQuestionsAnswered/totalCorrect/lastSessionAt (locally or,
    // since those only sync as part of a profile push, remotely either),
    // and never showed up in "today's" activity.
    this.engine.profile.recordSession({
      sessionId: `cbt_${this.examData.startTime}`,
      mode: 'cbt_exam',
      startedAt: this.examData.startTime,
      completedAt: this.examData.endTime,
      questionsAnswered: results.answered,
      correctCount: results.correct
    });

    // Unlike standard Practice's endSession(), nothing here ever
    // recalculated the real weighted Kairo Score for a completed CBT mock
    // — the submitAnswer() loop above feeds real accuracy/retention
    // signals into the graph, and recordSession() above feeds a real
    // consistency day, but until now nothing turned those into an updated
    // eliteScoreHistory entry. Computed here, same as endSession() —
    // Kairo Score itself stays pure/bonus-free; the High-Yield Session
    // award (a full CBT simulation is one of the two session types that
    // earns it) goes entirely to Kairo Points below instead.
    const previousTotal = this.engine.eliteScore.history.length > 0
      ? this.engine.eliteScore.history[this.engine.eliteScore.history.length - 1].total
      : 0;
    const eliteScore = this.engine.eliteScore.calculate(this.engine.graph, this.engine.profile.sessions);
    results.eliteScore = eliteScore;
    results.scoreDelta = EliteScore.computeSessionDelta(previousTotal, eliteScore.total, 'cbt');

    // Unlike standard Practice's endSession(), nothing here ever called
    // levelSystem.update() either — a finished CBT mock earned no Kairo
    // Points at all. Kairo Points Tight Economy: +2 per correct answer,
    // plus the flat CBT_SESSION bonus — a full JAMB-length simulation is
    // the one session type that earns it, matching the endurance it takes.
    results.level = this.engine.levelSystem.update(results.correct, KairoPointsAwards.CBT_SESSION);

    // Same gap as levelSystem.update() had above: CBT runs outside
    // endSession()'s lifecycle, so nothing here ever checked the Badge
    // Vault either — a finished CBT mock is exactly the kind of high-
    // volume, high-accuracy session the Execution track is meant to
    // credit, and recordSession() above already feeds it into
    // profile.sessions, so skipping this check would silently exclude a
    // student's exam runs from their own accuracy signal.
    results.newBadges = this.engine.badgeSystem.checkAndAward(this.engine.graph);

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

    // kairo.cbt_results holds the full per-question/per-subject breakdown —
    // real RLS policies for it have existed since the schema was created,
    // but nothing ever wrote to it, so a student had no exam log or
    // performance history at all once they left the summary screen.
    this.engine.sync.queue({
      type: 'cbt_result',
      data: {
        id: `cbt_${this.examData.startTime}`,
        subjects: this.config.subjects,
        questionResults: results.questionResults,
        bySubject: results.bySubject,
        timeAnalysis: results.timeAnalysis,
        totalQuestions: results.totalQuestions,
        score: results.score,
        maxScore: results.maxScore,
        percentage: results.percentage,
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
        // q is the full flattened question (buildPaper() spreads it in) —
        // it already carries the real explanation, just never propagated
        // this far. Withheld from the paper/question shown *during* the
        // exam (correct, that's Section 2.3/5.2/5.4's rule) — but this
        // runs only after finish(), when the review is exactly where the
        // explanation belongs (Section 6.5).
        explanation: q.explanation || null,
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
