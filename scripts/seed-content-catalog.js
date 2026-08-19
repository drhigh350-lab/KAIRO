/**
 * Kairo — Content Catalog Seeder
 *
 * Repeatable path for getting QIM-shaped question-bank JSON (the output of
 * scripts/import-question-bank.js) into the live kairo.concepts/
 * kairo.questions tables. Both are read-only to authenticated clients by
 * design (see kairo RLS policies) — this script requires the service role
 * key and is meant to be run by hand from a trusted machine, never
 * embedded in client code.
 *
 * What it does, per run:
 *   1. Derives one concept per distinct (subject, topic) pair across all
 *      input files, using the same conceptId() hash engine.addConcept()
 *      uses at runtime — never a separate/reimplemented hash, so seeded
 *      IDs always match what the engine would independently compute.
 *   2. Upserts those concepts into kairo.concepts (onConflict: 'id', so
 *      re-running is safe and never duplicates or clobbers existing rows'
 *      dependency_ids/question_pool_ids).
 *   3. Links every question's conceptsTested to its (subject, topic)
 *      concept before upload.
 *   4. Upserts questions into kairo.questions (onConflict: 'id').
 *   5. Leaves lifecycle_state at whatever the input JSON already has
 *      (normally 'imported') UNLESS --promote-live is passed, in which
 *      case each question is run through the real QuestionLifecycle
 *      QA gates (imported from src/qim/QuestionLifecycle.js, not
 *      reimplemented) and only set to 'live' if it passes — content that
 *      fails is left alone and reported, never force-promoted.
 *
 * Robustness: input JSON doesn't have to be complete. Every kairo.questions
 * column with a DB-side default (difficulty_rating, cognitive_level,
 * estimated_solving_time_sec, reading_load, calculation_load, source,
 * exam_body, lifecycle_state) gets a real, schema-legal value here even if
 * missing/invalid on the input — never left undefined, which a bulk insert
 * of an array with inconsistent keys would otherwise turn into an explicit
 * NULL and a NOT NULL violation. A missing id gets a deterministic
 * fallback (hash of subject+examBody+year+stem, not random — reruns of
 * the same input upsert the same rows instead of duplicating). Rows still
 * missing something with no safe default (subject/topic/stem/options/
 * correct_option) are skipped and reported, not sent to Supabase to fail
 * their whole 100-row chunk.
 *
 * Safety: dry-run by default. Nothing is written until --apply is passed,
 * since the service role key bypasses every RLS policy in this project,
 * not just the kairo schema.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/seed-content-catalog.js content/question-banks/**\/*.json [--apply] [--promote-live]
 */
import fs from 'fs';
import path from 'path';
import { conceptId } from '../src/utils/helpers.js';
import { QuestionLifecycle } from '../src/qim/QuestionLifecycle.js';

export function parseArgs(argv) {
  const files = [];
  const flags = {};
  for (const arg of argv) {
    if (arg.startsWith('--')) flags[arg.slice(2)] = true;
    else files.push(arg);
  }
  return { files, flags };
}

// kairo.questions has several NOT NULL columns with DB-side defaults
// (difficulty_rating, cognitive_level, estimated_solving_time_sec,
// reading_load, calculation_load, source, exam_body, lifecycle_state).
// Those defaults only apply when a column is *omitted* from the insert —
// but supabase-js/PostgREST bulk-inserts an array of objects by unioning
// every key present across the whole array, so a row that's merely
// *missing* one of these keys (rather than every row consistently missing
// it) gets an explicit NULL for that column instead of falling through to
// the default, which trips the NOT NULL constraint. The fix is to never
// let questionToRow() emit undefined/invalid for any of these — always a
// real, schema-legal value, regardless of what shape the input JSON is in.

export function slugify(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Deterministic fallback id (stable hash of subject+examBody+year+stem) so
// re-running the same input twice upserts the same rows instead of
// inserting fresh duplicates each time — unlike a random id generator.
export function deriveId(q) {
  let h = 0;
  const basis = `${q.subject || ''}|${q.examBody || ''}|${q.year ?? ''}|${q.stem || ''}`;
  for (let i = 0; i < basis.length; i++) {
    h = (Math.imul(31, h) + basis.charCodeAt(i)) | 0;
  }
  const hex = (h >>> 0).toString(16).padStart(8, '0');
  const yearPart = q.year ? String(q.year) : 'na';
  return `${slugify(q.subject || 'question')}_${slugify(q.examBody || 'jamb')}${yearPart}_${hex}`;
}

export function coerceEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

// Tolerates a numeric word-count (as a hand-patched file might set) as
// well as the real low/medium/high enum, and anything else falls back to
// 'low' rather than violating the reading_load CHECK constraint.
export function coerceReadingLoad(value) {
  if (typeof value === 'number') {
    if (value < 60) return 'low';
    if (value < 120) return 'medium';
    return 'high';
  }
  return coerceEnum(value, ['low', 'medium', 'high'], 'low');
}

export function coerceDifficultyRating(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export function coerceSolvingTime(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 30;
}

export function questionToRow(q) {
  return {
    id: q.id || deriveId(q),
    subject: q.subject,
    topic: q.topic,
    subtopic: q.subtopic ?? null,
    learning_objective: q.learningObjective ?? null,
    concepts_tested: q.conceptsTested || [],
    prerequisite_concepts: q.prerequisiteConcepts || [],
    difficulty_rating: coerceDifficultyRating(q.difficultyRating),
    cognitive_level: coerceEnum(
      q.cognitiveLevel,
      ['recall', 'comprehension', 'application', 'analysis', 'synthesis'],
      'recall'
    ),
    estimated_solving_time_sec: coerceSolvingTime(q.estimatedSolvingTimeSec),
    reading_load: coerceReadingLoad(q.readingLoad),
    calculation_load: coerceEnum(
      q.calculationLoad,
      ['none', 'light', 'moderate', 'heavy'],
      'none'
    ),
    distractors: q.distractors || [],
    skills_assessed: q.skillsAssessed || [],
    source: q.source || 'techmed_authored',
    year: q.year ?? null,
    exam_body: q.examBody || 'JAMB',
    related_question_ids: q.relatedQuestionIds || [],
    stem: q.stem,
    options: q.options || [],
    correct_option: q.correctOption,
    explanation: q.explanation ?? null,
    distractor_rationale: q.distractorRationale ?? null,
    lifecycle_state: coerceEnum(
      q.lifecycleState,
      ['imported', 'reviewed', 'tagged', 'linked', 'assigned', 'ready', 'live', 'deprecated'],
      'imported'
    ),
    empirical_stats: q.empiricalStats || { totalAttempts: 0, correctCount: 0, avgResponseTimeMs: 0, distractorSelectionCounts: {} }
  };
}

// Fields with no safe default -- real content has to be present, or the
// row is dropped (reported, never silently discarded) rather than sent to
// Supabase to fail the whole chunk's insert.
export function validateRow(row) {
  const problems = [];
  if (!row.subject) problems.push('missing subject');
  if (!row.topic) problems.push('missing topic');
  if (!row.stem) problems.push('missing stem');
  if (!Array.isArray(row.options) || row.options.length < 2) problems.push('fewer than 2 options');
  if (!row.correct_option) problems.push('missing correct_option');
  else if (Array.isArray(row.options) && !row.options.some(o => o.label === row.correct_option)) {
    problems.push(`correct_option "${row.correct_option}" doesn't match any option label`);
  }
  return problems;
}

export function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function main() {
  const { files, flags } = parseArgs(process.argv.slice(2));

  if (files.length === 0) {
    console.error('Usage: node scripts/seed-content-catalog.js <file1.json> [file2.json ...] [--apply] [--promote-live]');
    process.exit(1);
  }

  const dryRun = !flags.apply;
  const promoteLive = !!flags['promote-live'];

  let questions = [];
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.resolve(f), 'utf-8'));
    questions = questions.concat(Array.isArray(data) ? data : [data]);
  }
  console.log(`Loaded ${questions.length} questions from ${files.length} file(s).`);

  // Resolve a stable id up front for anything that arrived without one, so
  // every downstream step (QA-gate reporting, concept linking, the actual
  // upsert) refers to the same id consistently, and re-running the same
  // input twice never mints a fresh random id for the same question.
  for (const q of questions) {
    if (!q.id) q.id = deriveId(q);
  }

  // 1. Derive concepts from distinct (subject, topic) pairs.
  const conceptsByKey = new Map();
  for (const q of questions) {
    const key = `${q.subject}|${q.topic}`;
    if (!conceptsByKey.has(key)) {
      conceptsByKey.set(key, {
        id: conceptId(q.subject, q.topic, null, q.topic),
        name: q.topic,
        subject: q.subject,
        topic: q.topic,
        subtopic: null,
        difficulty_weight: 1.0,
        dependency_ids: [],
        question_pool_ids: []
      });
    }
  }
  const concepts = Array.from(conceptsByKey.values());
  console.log(`Derived ${concepts.length} concept(s) from ${concepts.length === conceptsByKey.size ? 'distinct subject+topic pairs' : ''}.`);

  // 2. Link concepts_tested on every question.
  const conceptIdByKey = new Map(concepts.map(c => [`${c.subject}|${c.topic}`, c.id]));
  for (const q of questions) {
    const cid = conceptIdByKey.get(`${q.subject}|${q.topic}`);
    q.conceptsTested = [{ conceptId: cid, weight: 'primary' }];
  }

  // 3. Optionally promote — validate() before ever setting lifecycle_state: 'live'.
  let promoted = 0, failedGates = [];
  if (promoteLive) {
    const lifecycle = new QuestionLifecycle();
    for (const q of questions) {
      const result = lifecycle.validate(q);
      if (result.passed) {
        q.lifecycleState = 'live';
        promoted++;
      } else {
        failedGates.push({ id: q.id, errors: result.errors });
      }
    }
    console.log(`--promote-live: ${promoted}/${questions.length} passed QA gates and will be set live.`);
    if (failedGates.length > 0) {
      console.log(`${failedGates.length} question(s) failed QA gates and are left untouched:`);
      for (const f of failedGates.slice(0, 20)) console.log(`  ${f.id}: ${f.errors.join('; ')}`);
      if (failedGates.length > 20) console.log(`  ...and ${failedGates.length - 20} more`);
    }
  }

  if (dryRun) {
    console.log('\nDRY RUN — nothing written. Re-run with --apply to write to Supabase.');
    console.log(`Would upsert ${concepts.length} concepts and ${questions.length} questions.`);
    return;
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment to --apply.');
    process.exit(1);
  }

  // Imported lazily so dry runs (the default) work without
  // @supabase/supabase-js installed — it's an optional peerDependency.
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceKey);
  const table = (name) => supabase.schema('kairo').from(name);

  for (const batch of chunk(concepts, 100)) {
    const { error } = await table('concepts').upsert(batch, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw error;
  }
  console.log(`Upserted ${concepts.length} concepts.`);

  // Validate before sending anything to Supabase: a single row missing a
  // field with no safe default (subject/topic/stem/options/correct_option)
  // would otherwise fail its entire 100-row chunk's bulk insert. Bad rows
  // are reported and skipped instead of blocking everything else.
  const allRows = questions.map(questionToRow);
  const rows = [];
  const invalidRows = [];
  for (const row of allRows) {
    const problems = validateRow(row);
    if (problems.length === 0) rows.push(row);
    else invalidRows.push({ id: row.id, stem: (row.stem || '').slice(0, 60), problems });
  }
  if (invalidRows.length > 0) {
    console.log(`${invalidRows.length} question(s) skipped (missing required content, not uploaded):`);
    for (const r of invalidRows.slice(0, 20)) console.log(`  ${r.id} "${r.stem}...": ${r.problems.join('; ')}`);
    if (invalidRows.length > 20) console.log(`  ...and ${invalidRows.length - 20} more`);
  }

  for (const batch of chunk(rows, 100)) {
    const { error } = await table('questions').upsert(batch, { onConflict: 'id' });
    if (error) throw error;
  }
  console.log(`Upserted ${rows.length} questions.`);
}

// Only run the CLI when this file is executed directly (`node
// scripts/seed-content-catalog.js ...`), not when its helpers are imported
// for testing.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
