/**
 * Kairo — Planner Topic Map: one-time candidate generator (Sciences only)
 *
 * Produces REVIEW CANDIDATES for kairo.planner_topic_map — never writes to
 * the database, never auto-applies anything. Per the Planner Handshake
 * design: a wrong topic mapping silently misapplies the 24h quarantine or
 * a due/critical boost to the wrong engine topic, so every row here needs
 * a human's eyes before it becomes real. Run once, review the output,
 * hand-author the actual INSERT statements from what's confirmed.
 *
 * Scope: Chemistry, Physics, Biology only (the phased-rollout decision —
 * Mathematics/Use of English have a genuine granularity mismatch, not
 * just a wording one, and need real content judgment, not this script).
 *
 * Inputs are literal snapshots, not live fetches, so this runs with
 * `node` alone, no Supabase credentials required:
 *   - PLANNER_TOPICS: kairo-app/src/lib/planner/syllabus.ts's
 *     FALLBACK_SUBJECTS, title field only, captured 2026-08-30.
 *   - DB_TOPICS: `select distinct subject, topic from kairo.questions`
 *     against the live TechMed-Daily Supabase project, captured 2026-08-30.
 * Re-run this against fresh exports if either source changes materially
 * before the mapping is finalized.
 *
 * Matching signal: character-bigram Dice coefficient on normalized
 * strings (lowercased, '&' -> 'and', punctuation stripped). Chosen over
 * word-level matching because the real mismatches are almost all
 * suffix/wording variants of the same words (e.g. "equilibrium" vs
 * "equilibria", "purification" vs "purification of chemical substances")
 * — bigram overlap tolerates that; whole-word Jaccard does not (it would
 * score "Chemical Equilibrium" vs "Chemical equilibria" far too low,
 * since "equilibrium" and "equilibria" are different tokens even though
 * they're obviously the same real-world topic).
 *
 * Usage: node scripts/generate-planner-topic-map-candidates.js
 * Output: scripts/planner-topic-map-candidates.json (full detail) +
 *         a summary table printed to stdout.
 */
import { writeFileSync } from 'fs';

const PLANNER_TOPICS = {
  Chemistry: [
    'Separation of Mixtures & Purification', 'Chemical Combination', 'Kinetic Theory & Gas Laws',
    'Atomic Structure & Bonding', 'Air', 'Water', 'Solubility', 'Environmental Pollution',
    'Acids, Bases & Salts', 'Oxidation & Reduction', 'Electrolysis', 'Energy Changes',
    'Rates of Chemical Reaction', 'Chemical Equilibrium', 'Non-metals & Their Compounds',
    'Metals & Their Compounds', 'Organic Compounds', 'Chemistry & Industry'
  ],
  Physics: [
    'Measurements and Units', 'Scalars and Vectors', 'Motion', 'Gravitational Field',
    'Equilibrium of Forces', 'Simple Machines', 'Friction', 'Elasticity', 'Work, Energy and Power',
    'Liquids at Rest', 'Pressure', 'Temperature and Its Measurement', 'Quantity of Heat',
    'Change of State', 'Thermal Expansion', 'Kinetic Theory of Matter', 'Gas Laws',
    'Propagation of Sound Waves', 'Waves', 'Light Energy', 'Reflection of Light',
    'Refraction of Light', 'Dispersion of Light and Colours', 'Optical Instruments',
    'Electrostatics', 'Current Electricity', 'Electrical Energy and Power', 'Electric Cells',
    'Electrical Measuring Instruments', 'Capacitors', 'Magnetic Field', 'Electromagnetic Induction',
    'Alternating Current', 'Semiconductors', 'Energy Quantization', 'Elementary Modern Physics',
    'Nuclear Physics', 'Heat Transfer'
  ],
  Biology: [
    'Living organisms', 'Structural/functional and behavioural adaptations of organisms',
    'Natural habitats', 'Local (Nigerian) biomes', 'The ecology of populations',
    'Factors affecting the distribution of organisms', 'Symbiotic interactions of plants and animals',
    'Internal structure of plants and animals', 'Nutrition', 'Transport', 'Respiration',
    'Excretion', 'Support and movement', 'Co-ordination and control', 'Growth', 'Reproduction',
    'Variation in population', 'Heredity', 'Evolution among organisms', 'Theories of evolution',
    'Evidence of evolution', 'Humans and environment'
  ]
};

const DB_TOPICS = {
  Chemistry: [
    'Acids, bases and salts', 'Air', 'Atomic structure and bonding', 'Chemical combination',
    'Chemical equilibria', 'Chemistry and Industry', 'Electrolysis', 'Energy changes',
    'Environmental Pollution', 'Kinetic theory of matter and Gas Laws', 'Metals and their compounds',
    'Non-metals and their compounds', 'Organic Compounds', 'Oxidation and reduction',
    'Rates of Chemical Reaction', 'Separation of mixtures and purification of chemical substances',
    'Solubility', 'Water'
  ],
  Physics: [
    'Alternating Current', 'Capacitors', 'Change of State', 'Current Electricity',
    'Dispersion of Light and Colours', 'Elasticity', 'Electric Cells', 'Electrical Energy and Power',
    'Electrical Measuring Instruments', 'Electromagnetic Induction', 'Electrostatics',
    'Elementary Modern Physics', 'Energy Quantization', 'Equilibrium of Forces', 'Friction',
    'Gas Laws', 'Gravitational Field', 'Heat Transfer', 'Kinetic Theory of Matter', 'Light Energy',
    'Liquids at Rest', 'Magnetic Field', 'Measurements and Units', 'Motion', 'Nuclear Physics',
    'Optical Instruments', 'Pressure', 'Propagation of Sound Waves', 'Quantity of Heat',
    'Reflection of Light', 'Refraction of Light', 'Scalars and Vectors', 'Semiconductors',
    'Simple Machines', 'Temperature and its Measurement', 'Thermal Expansion', 'Vapours', 'Waves',
    'Work, Energy and Power'
  ],
  Biology: [
    'Co-ordination and control', 'Evidence of evolution', 'Evolution among organisms', 'Excretion',
    'Factors affecting the distribution of organisms', 'Growth', 'Heredity',
    'Humans and environment', 'Internal structure of plants and animals', 'Living organisms',
    'Local (Nigerian) biomes', 'Natural habitats', 'Nutrition', 'Reproduction', 'Respiration',
    'Soil', 'Structural/functional and behavioural adaptations of organisms', 'Support and movement',
    'Symbiotic interactions of plants and animals', 'The ecology of populations',
    'Theories of evolution', 'Transport', 'Variation in population'
  ]
};

function normalize(s) {
  return s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function bigrams(s) {
  const set = new Set();
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
}

function diceCoefficient(a, b) {
  const A = bigrams(normalize(a));
  const B = bigrams(normalize(b));
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  for (const bg of A) if (B.has(bg)) shared++;
  return (2 * shared) / (A.size + B.size);
}

function confidenceTier(score) {
  if (score >= 0.65) return 'HIGH';
  if (score >= 0.45) return 'MEDIUM';
  return 'LOW';
}

const report = {};
for (const subject of Object.keys(PLANNER_TOPICS)) {
  const plannerTopics = PLANNER_TOPICS[subject];
  const dbTopics = DB_TOPICS[subject];
  const rows = plannerTopics.map(topicTitle => {
    const scored = dbTopics
      .map(dbTopic => ({ dbTopic, score: diceCoefficient(topicTitle, dbTopic) }))
      .sort((a, b) => b.score - a.score);
    return {
      topicTitle,
      bestMatch: scored[0].dbTopic,
      score: Math.round(scored[0].score * 1000) / 1000,
      confidence: confidenceTier(scored[0].score),
      runnerUp: scored[1] ? { dbTopic: scored[1].dbTopic, score: Math.round(scored[1].score * 1000) / 1000 } : null
    };
  });

  // Flag DB topics never chosen as anyone's best match — either genuinely
  // uncovered by the Blueprint, or the real other half of a many-to-one
  // case this simple 1:1 scan can't resolve on its own.
  const claimed = new Set(rows.map(r => r.bestMatch));
  const unclaimedDbTopics = dbTopics.filter(t => !claimed.has(t));

  // Flag the same DB topic claimed as best-match by more than one Planner
  // topic — a real collision, not a fuzzy-matching artifact, since both
  // Planner topics computed it as their single strongest candidate.
  const claimCounts = new Map();
  for (const r of rows) claimCounts.set(r.bestMatch, (claimCounts.get(r.bestMatch) || 0) + 1);
  const collisions = [...claimCounts.entries()].filter(([, n]) => n > 1).map(([dbTopic]) => dbTopic);

  report[subject] = { rows, unclaimedDbTopics, collisions };
}

writeFileSync(new URL('./planner-topic-map-candidates.json', import.meta.url), JSON.stringify(report, null, 2));

for (const subject of Object.keys(report)) {
  const { rows, unclaimedDbTopics, collisions } = report[subject];
  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const r of rows) counts[r.confidence]++;
  console.log(`\n=== ${subject} (${rows.length} Planner topics) ===`);
  console.log(`HIGH: ${counts.HIGH}  MEDIUM: ${counts.MEDIUM}  LOW: ${counts.LOW}`);
  if (unclaimedDbTopics.length) console.log(`Unclaimed DB topics (no Planner topic's best match): ${JSON.stringify(unclaimedDbTopics)}`);
  if (collisions.length) console.log(`Collisions (2+ Planner topics claim the same DB topic): ${JSON.stringify(collisions)}`);
  for (const r of rows.filter(r => r.confidence !== 'HIGH')) {
    console.log(`  [${r.confidence}] "${r.topicTitle}" -> best "${r.bestMatch}" (${r.score}), runner-up "${r.runnerUp?.dbTopic}" (${r.runnerUp?.score})`);
  }
}
