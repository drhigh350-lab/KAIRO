/**
 * Evidence-based readiness profile.
 *
 * This module intentionally returns a structured evidence model rather than a
 * single opaque score. Each dimension has a minimum evidence rule and an
 * explicit confidence state. The result is safe to show from onboarding
 * onwards: insufficient evidence is a first-class state, not a fabricated 0.
 */

const CONFIDENCE = Object.freeze({
  INSUFFICIENT: 'insufficient',
  EMERGING: 'emerging',
  DEVELOPING: 'developing',
  RELIABLE: 'reliable',
  HIGH: 'high-confidence'
});

const STATES = new Set(['held', 'reinforced']);
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function confidenceFor(count, { emerging = 1, developing = 5, reliable = 15, high = 40 } = {}) {
  if (count < emerging) return CONFIDENCE.INSUFFICIENT;
  if (count < developing) return CONFIDENCE.EMERGING;
  if (count < reliable) return CONFIDENCE.DEVELOPING;
  if (count < high) return CONFIDENCE.RELIABLE;
  return CONFIDENCE.HIGH;
}

function dimension(key, label, value, confidence, evidenceCount, summary, details = {}) {
  return { key, label, value, confidence, evidenceCount, summary, ...details };
}

function allAttempts(concepts) {
  return concepts.flatMap((concept) => (concept.attemptHistory || []).map((attempt) => ({ ...attempt, concept })));
}

function accuracy(attempts) {
  return attempts.length ? Math.round((attempts.filter((attempt) => attempt.correct).length / attempts.length) * 100) : null;
}

function sessionAccuracy(session) {
  return session.questionsAnswered > 0 ? (session.correctCount || 0) / session.questionsAnswered : null;
}

function calculateReadinessProfile({ profile, concepts = [], sessions = [], now = Date.now() }) {
  const attempts = allAttempts(concepts);
  const subjects = profile?.targetSubjects || [];
  const targetScore = Number.isFinite(profile?.targetUTMEScore) ? profile.targetUTMEScore : null;
  const completedSessions = sessions.filter((session) => session.completedAt && session.questionsAnswered > 0);
  const recentSessions = completedSessions.slice(-7);
  const masteredConcepts = concepts.filter((concept) => STATES.has(concept.retentionState));
  const repeatedConcepts = concepts.filter((concept) => (concept.attemptHistory || []).length >= 2);
  const retainedConcepts = concepts.filter((concept) => {
    const history = concept.attemptHistory || [];
    if (history.length < 2) return false;
    const first = history[0];
    return history.slice(1).some((attempt) => attempt.timestamp - first.timestamp >= ONE_DAY_MS && attempt.correct);
  });

  const masteryValue = concepts.length ? Math.round((masteredConcepts.length / concepts.length) * 100) : null;
  const masteryConfidence = confidenceFor(repeatedConcepts.length, { emerging: 1, developing: 5, reliable: 15, high: 40 });
  const accuracyValue = accuracy(attempts);
  const accuracyConfidence = confidenceFor(attempts.length, { emerging: 1, developing: 10, reliable: 30, high: 100 });

  const timedAttempts = attempts.filter((attempt) => Number.isFinite(attempt.responseTimeMs) && attempt.responseTimeMs > 0 && attempt.responseTimeMs < 15 * 60 * 1000);
  const averageResponseMs = timedAttempts.length
    ? Math.round(timedAttempts.reduce((sum, attempt) => sum + attempt.responseTimeMs, 0) / timedAttempts.length)
    : null;
  const speedConfidence = confidenceFor(timedAttempts.length, { emerging: 3, developing: 10, reliable: 30, high: 100 });
  const speedSummary = averageResponseMs == null
    ? 'KAIRO has not measured enough response times yet.'
    : `${Math.round(averageResponseMs / 1000)}s average on measured questions; speed is interpreted alongside accuracy.`;

  const sessionAccuracies = recentSessions.map(sessionAccuracy).filter((value) => value != null);
  const consistencyValue = sessionAccuracies.length >= 2
    ? Math.max(0, Math.round(100 - Math.sqrt(sessionAccuracies.reduce((sum, value) => sum + Math.pow(value - (sessionAccuracies.reduce((a, b) => a + b, 0) / sessionAccuracies.length), 2), 0) / sessionAccuracies.length) * 100))
    : null;
  const consistencyConfidence = confidenceFor(sessionAccuracies.length, { emerging: 2, developing: 3, reliable: 5, high: 7 });

  const retentionConfidence = confidenceFor(retainedConcepts.length, { emerging: 1, developing: 3, reliable: 10, high: 25 });
  const retentionValue = repeatedConcepts.length ? Math.round((retainedConcepts.length / repeatedConcepts.length) * 100) : null;

  const cbtSessions = completedSessions.filter((session) => session.mode === 'cbt_exam');
  const enduranceSessions = cbtSessions.filter((session) => session.questionsAnswered >= 40);
  const enduranceValue = enduranceSessions.length
    ? Math.round(enduranceSessions.reduce((sum, session) => sum + (sessionAccuracy(session) * 100), 0) / enduranceSessions.length)
    : null;
  const enduranceConfidence = confidenceFor(enduranceSessions.length, { emerging: 1, developing: 2, reliable: 3, high: 5 });

  const subjectRisk = subjects.map((subject) => {
    const subjectConcepts = concepts.filter((concept) => concept.subject === subject);
    const subjectAttempts = attempts.filter((attempt) => attempt.concept.subject === subject);
    const weak = subjectConcepts.filter((concept) => !STATES.has(concept.retentionState)).length;
    const subjectAccuracy = accuracy(subjectAttempts);
    const evidence = subjectAttempts.length;
    const risk = weak * 2 + (subjectAccuracy == null ? 1 : Math.max(0, 100 - subjectAccuracy));
    return {
      subject,
      risk: Math.round(risk),
      accuracy: subjectAccuracy,
      evidenceCount: evidence,
      confidence: confidenceFor(evidence, { emerging: 1, developing: 10, reliable: 30, high: 100 })
    };
  }).filter((entry) => entry.evidenceCount > 0 || concepts.some((concept) => concept.subject === entry.subject && (concept.attemptHistory || []).length > 0))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 3);

  const strongOverallEvidence = Boolean(
    targetScore != null && subjects.length > 0 && attempts.length >= 50 && completedSessions.length >= 3 && enduranceSessions.length >= 1 && retainedConcepts.length >= 3
  );
  const overallConfidence = strongOverallEvidence ? CONFIDENCE.DEVELOPING : CONFIDENCE.INSUFFICIENT;
  const demonstratedScore = strongOverallEvidence
    ? Math.round((recentSessions.reduce((sum, session) => sum + (sessionAccuracy(session) * 400), 0) / recentSessions.length))
    : null;

  const dimensions = [
    dimension('knowledge', 'Knowledge / Mastery', masteryValue, masteryConfidence, repeatedConcepts.length, masteryValue == null ? 'No concept evidence yet.' : `${masteredConcepts.length} of ${concepts.length} tracked concepts currently held or reinforced.`, { unit: '%' }),
    dimension('accuracy', 'Accuracy', accuracyValue, accuracyConfidence, attempts.length, accuracyValue == null ? 'Answer more questions to establish a baseline.' : `${attempts.length} answered questions contribute to this provisional accuracy.`, { unit: '%' }),
    dimension('speed', 'Speed', averageResponseMs, speedConfidence, timedAttempts.length, speedSummary, { unit: 'ms', averageResponseMs }),
    dimension('consistency', 'Consistency', consistencyValue, consistencyConfidence, sessionAccuracies.length, consistencyValue == null ? 'Complete more separate sessions to compare performance.' : 'Measured across separate completed sessions.', { unit: '%' }),
    dimension('retention', 'Retention', retentionValue, retentionConfidence, retainedConcepts.length, retentionValue == null ? 'KAIRO needs a later retrieval opportunity after learning.' : `${retainedConcepts.length} concepts were recalled after a meaningful gap.`, { unit: '%' }),
    dimension('endurance', 'Exam Endurance', enduranceValue, enduranceConfidence, enduranceSessions.length, enduranceValue == null ? 'Complete a longer CBT simulation to measure endurance.' : `${enduranceSessions.length} longer CBT simulation${enduranceSessions.length === 1 ? '' : 's'} measured.`, { unit: '%' }),
  ];

  return {
    targetScore,
    targetSubjects: subjects,
    confidenceScale: Object.values(CONFIDENCE),
    overall: {
      confidence: overallConfidence,
      demonstratedScore,
      targetScore,
      status: strongOverallEvidence ? 'evidence-backed-estimate' : 'insufficient-evidence',
      summary: strongOverallEvidence
        ? `Recent evidence places demonstrated performance around ${demonstratedScore}, against a target of ${targetScore}.`
        : 'KAIRO is still gathering the evidence needed to estimate performance under realistic exam conditions.',
    },
    dimensions,
    risks: subjectRisk,
    nextEvidence: strongOverallEvidence
      ? 'Keep alternating targeted practice, spaced retrieval, and realistic CBTs to strengthen confidence.'
      : 'Start with the diagnostic, then complete targeted practice and a longer CBT simulation so KAIRO can compare knowledge, speed, retention, and endurance.',
    evidence: {
      attempts: attempts.length,
      concepts: concepts.length,
      repeatedConcepts: repeatedConcepts.length,
      retainedConcepts: retainedConcepts.length,
      completedSessions: completedSessions.length,
      enduranceSessions: enduranceSessions.length,
      generatedAt: now,
    },
  };
}

export { CONFIDENCE, calculateReadinessProfile };
