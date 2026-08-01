/**
 * Kairo — Utility Functions
 */

/**
 * Time-safe date comparison. Returns days between two timestamps.
 */
export function daysBetween(a, b) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs((a - b) / msPerDay);
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
