/**
 * Kairo V1 shell — the ONLY place internal engine vocabulary
 * (retentionState, macroState, errorTag, learningState...) is allowed to
 * touch human-facing copy. Screens never render an internal label
 * directly — they call one of these and render the sentence back.
 *
 * Where the engine already returns a human sentence itself (Kai's
 * respondToAnswer/proactiveMessage, ReviewModule.getPreSessionRecap,
 * MomentumStreak's status message, EliteScore.explainChange...) screens
 * use that directly instead of duplicating it here — this file only
 * covers the gaps where the engine hands back a raw state/tag.
 */

export function retentionSentence(concept) {
  const state = concept.state || concept.retentionState;
  switch (state) {
    case 'unseen':
      return "You haven't studied this yet.";
    case 'forming':
      return "You're just starting to learn this — it hasn't settled in yet.";
    case 'held':
      return "This is holding steady.";
    case 'fading':
      return "You got this right before, but it's beginning to fade. A quick review now can strengthen it.";
    case 'reinforced':
      return "You remembered this after time had passed — that's real learning, not luck.";
    default:
      return 'This is worth a look.';
  }
}

// A short causal fragment for "Kairo recommends this because ___." —
// deliberately a controlled phrase, not a full Kai sentence, so the
// combined sentence always reads grammatically (Kai's own voice messages
// are shown separately, attributed, never spliced mid-sentence).
export function reasonClauseForConcept(concept) {
  const state = concept.state || concept.retentionState;
  switch (state) {
    case 'unseen':
      return "it's new, and a good place to start";
    case 'forming':
      return "it's still settling in";
    case 'held':
      return 'a quick touch-up keeps it solid';
    case 'fading':
      return "it's starting to fade";
    case 'reinforced':
      return 'keeping it sharp matters too';
    default:
      return "it's next in line";
  }
}

export function reviewReasonClause(breakdown) {
  if (breakdown.fading > 0) return "some of it is starting to fade";
  if (breakdown.recentlyMissed > 0) return 'it tripped you up recently';
  return "it's been a little while since you looked at it";
}

export function reviewReasonSentence(reason) {
  switch (reason) {
    case 'fading':
      return 'Starting to fade — worth reinforcing now.';
    case 'recently_missed':
      return 'This tripped you up in the last couple of days.';
    case 'stale':
      return "You haven't touched this in over a week.";
    default:
      return 'Worth revisiting.';
  }
}

const MACRO_STATE_FRAMING = {
  orienting: {
    where: "Kairo is still getting to know you.",
    tone: 'orienting'
  },
  building: {
    where: "You're building steady progress.",
    tone: 'steady'
  },
  compounding: {
    where: "You're in a strong rhythm right now.",
    tone: 'confident'
  },
  wavering: {
    where: "Things have felt a little harder lately — that's normal.",
    tone: 'gentle'
  },
  at_risk: {
    where: "It's been a little while. Whenever you're ready, I've kept your place.",
    tone: 'gentle'
  },
  recovering: {
    where: "Welcome back — starting light today, on purpose.",
    tone: 'gentle'
  },
  peak_readiness: {
    where: "The exam is close. Let's sharpen what you already know.",
    tone: 'confident'
  }
};

export function macroStateFraming(macroState) {
  return MACRO_STATE_FRAMING[macroState] || MACRO_STATE_FRAMING.building;
}

// Never used for "weakness" language — a shared vocabulary for describing
// a genuine gap without it reading as a verdict. Mirrors Kai's own hard
// rule: never "wrong" as a standalone judgment.
const ERROR_TAG_LABEL = {
  conceptual_gap: 'a genuine gap in understanding',
  careless_slip: 'a small slip under pressure, not a knowledge gap',
  misapplied_rule: 'two similar ideas getting mixed up',
  partial_understanding: 'a mostly-right approach that broke down at one step',
  guessed: "a moment where the real level wasn't clear yet",
  misread_question: 'a reading slip, not a knowledge gap'
};

export function errorTagLabel(tag) {
  return ERROR_TAG_LABEL[tag] || 'something worth a closer look';
}

// A gap tag worth offering an inline Learn detour for. Careless slips and
// guesses get Kai's light-touch in-the-moment response instead — routing
// those into a full lesson would be noise, not help.
export function isRepairWorthy(errorTag) {
  return ['conceptual_gap', 'misapplied_rule', 'partial_understanding'].includes(errorTag);
}

export function masteryPctSentence(subject, pct) {
  if (pct >= 70) return `${subject} is where you're strongest right now.`;
  if (pct >= 40) return `${subject} is coming along steadily.`;
  return `${subject} could use a bit more time — nothing urgent, just a place to grow.`;
}

export function scoreTrendSentence(trend) {
  switch (trend) {
    case 'rising':
      return 'Trending up over your recent sessions.';
    case 'falling':
      return "Dipped a little recently — perfectly normal, not a verdict.";
    case 'stable':
      return 'Holding steady.';
    default:
      return "A few more sessions and I'll be able to show you a trend.";
  }
}

export function relativeDay(timestamp) {
  if (!timestamp) return null;
  const days = Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return 'over a week ago';
}

export function daysUntil(timestamp) {
  if (!timestamp) return null;
  return Math.ceil((timestamp - Date.now()) / (24 * 60 * 60 * 1000));
}
