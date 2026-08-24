/**
 * Kairo — Utility Functions
 */

/**
 * A concept link (Question.conceptsTested[i]) is "primary" when its weight
 * is the string 'primary' — the shape the Question model was originally
 * documented with — or a number of 1 or more. Every real question
 * currently seeded (kairo.questions, 800/800 concept links checked
 * directly against production) uses the numeric convention, weight: 1.0,
 * never the string — code that only checked `weight === 'primary'`
 * (QuestionRelationshipGraph.findPrerequisiteCheck, Question.
 * getPrimaryConcept, LearnModule._representativeQuestion) silently
 * treated every real concept link as non-primary. A fractional weight
 * (e.g. 0.5) reads naturally as a partial/secondary link and is excluded.
 */
export function isPrimaryConceptLink(c) {
  return c.weight === 'primary' || (typeof c.weight === 'number' && c.weight >= 1);
}

/**
 * Time-safe date comparison. Returns days between two timestamps.
 *
 * Both arguments must already be epoch-ms numbers (or Date instances) —
 * this does raw arithmetic subtraction, not Date parsing. A date-only
 * string (e.g. "2026-08-23", the shape Postgres `date` columns round-trip
 * as) silently coerces to NaN here instead of throwing, so a caller that
 * ever hands this a raw column value instead of toLocalDateNumber()'s
 * output gets a NaN gap that then satisfies no numeric comparison in
 * MomentumStreak.recordSession() and falls through every branch straight
 * to "genuine break" — resetting a real streak to 1 on every session that
 * isn't literally the same calendar day as the last one.
 */
export function daysBetween(a, b) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs((a - b) / msPerDay);
}

/**
 * Formats a timestamp's own LOCAL calendar date as YYYY-MM-DD — never
 * `.toISOString().slice(0, 10)`, which converts to UTC first. For anyone
 * in a positive UTC offset (Nigeria, this product's primary market, is
 * UTC+1), a session completed shortly after local midnight can land on
 * the *previous* UTC calendar day, silently storing the wrong date.
 */
export function toLocalDateString(timestamp) {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * The inverse of toLocalDateString() — parses a YYYY-MM-DD date-only
 * string (e.g. from a Postgres `date` column) back into an epoch-ms
 * number anchored to *local* midnight, not `new Date(dateString)`'s
 * UTC-midnight interpretation of a date-only ISO string. Restores the
 * exact type MomentumStreak.recordSession()'s arithmetic (daysBetween,
 * dayKey) expects — see the daysBetween() comment above for what breaks
 * when a raw string reaches it instead.
 */
export function fromLocalDateString(dateString) {
  return new Date(`${dateString}T00:00:00`).getTime();
}

/**
 * Weighted average with recency bias.
 * @param {Array<{value:number, timestamp:number}>} entries
 * @param {number} halfLifeDays — how fast old entries decay in weight
 */
export function weightedRecencyAverage(entries, halfLifeDays = 7) {
  if (!entries || entries.length === 0) return 0;
  const now = Date.now();
  let totalWeight = 0;
  let weightedSum = 0;
  const lambda = Math.log(2) / (halfLifeDays * 24 * 60 * 60 * 1000);

  for (const e of entries) {
    const age = now - e.timestamp;
    const weight = Math.exp(-lambda * age);
    weightedSum += e.value * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Simple hash for generating deterministic IDs.
 */
export function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

/**
 * Generate a unique concept node ID.
 */
export function conceptId(subject, topic, subtopic, conceptName) {
  return hashString(`${subject}|${topic}|${subtopic}|${conceptName}`);
}

/**
 * Deep clone an object (safe for serializable data).
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Is the student within exam proximity window?
 */
export function isExamProximity(examDateTimestamp, now = Date.now()) {
  if (!examDateTimestamp) return false;
  const weeks = daysBetween(now, examDateTimestamp) / 7;
  return weeks <= 6 && examDateTimestamp > now;
}

/**
 * Simple rolling window filter.
 */
export function inRollingWindow(entries, windowDays, now = Date.now()) {
  const cutoff = now - (windowDays * 24 * 60 * 60 * 1000);
  return entries.filter(e => e.timestamp > cutoff);
}

/**
 * Calculate percentile rank of a value in a distribution.
 */
export function percentileRank(value, sortedArray) {
  if (sortedArray.length === 0) return 50;
  let below = 0;
  for (const v of sortedArray) if (v < value) below++;
  return (below / sortedArray.length) * 100;
}

/**
 * Simple seeded random for deterministic interleaving.
 */
export function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Shuffle array deterministically by seed.
 */
export function seededShuffle(array, seed) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Real (non-seeded) Fisher-Yates shuffle — `pool.sort(() => Math.random() - 0.5)`
 * is a well-known broken shuffle (biased, not uniform); this is the real
 * algorithm. Used wherever a question/candidate pool must be randomized
 * before slicing off a fixed-size selection, so the same pool doesn't
 * keep handing back the same prefix/order on every call.
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Heuristic "does this question require calculation" classifier for the
// Theory vs. Calculation Insight. No authored per-question signal exists
// for this — every seeded question's calculationLoad field (Question.js)
// is 'none' across all 800 real seeded questions (Physics/Chemistry/
// Biology/Use of English), so it was never actually populated at content-
// authoring time and can't be trusted as-is. This infers it directly from
// the question stem instead: a genuine numeric value combined with either
// a computation verb/operator or a recognizable SI unit. Superscript
// unicode digits (ms⁻¹, kmh⁻¹, Nkg⁻¹ — common in Physics stems) are
// checked separately from plain ASCII digits, since \d alone misses them
// and silently under-counts real calculation questions that only express
// their exponent that way. Validated against the real seeded banks: flags
// ~32% of Physics, ~16% of Chemistry, ~1% of Biology/Use of English —
// matching the real shape of those subjects, not a guess.
const SUPERSCRIPT_DIGIT_RE = /[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/;
const CALC_OPERATOR_RE = /[=+*/^%-]|\b(calculate|compute|determine|find the value|how many|what is the value)\b/i;
const SI_UNIT_RE = /\b(m\/s|km\/h|kg|g|N|J|W|Pa|Ω|ohm|volt|V|A|Hz|mm|cm|m|°C|mol|atm|cal|s)\b|ms⁻|kmh⁻|Nkg⁻|LT⁻/;

export function isCalculationQuestion(stem) {
  if (!stem) return false;
  const hasNumber = /[0-9]/.test(stem) || SUPERSCRIPT_DIGIT_RE.test(stem);
  if (!hasNumber) return false;
  return CALC_OPERATOR_RE.test(stem) || SI_UNIT_RE.test(stem);
}
