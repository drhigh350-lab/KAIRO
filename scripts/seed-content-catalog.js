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

function parseArgs(argv) {
  const files = [];
  const flags = {};
  for (const arg of argv) {
    if (arg.startsWith('--')) flags[arg.slice(2)] = true;
    else files.push(arg);
  }
  return { files, flags };
}

function questionToRow(q) {
  return {
    id: q.id,
    subject: q.subject,
    topic: q.topic,
    subtopic: q.subtopic ?? null,
    learning_objective: q.learningObjective ?? null,
    concepts_tested: q.conceptsTested || [],
    prerequisite_concepts: q.prerequisiteConcepts || [],
    difficulty_rating: q.difficultyRating,
    cognitive_level: q.cognitiveLevel,
    estimated_solving_time_sec: q.estimatedSolvingTimeSec,
    reading_load: q.readingLoad,
    calculation_load: q.calculationLoad,
    distractors: q.distractors || [],
    skills_assessed: q.skillsAssessed || [],
    source: q.source,
    year: q.year ?? null,
    exam_body: q.examBody,
    related_question_ids: q.relatedQuestionIds || [],
    stem: q.stem,
    options: q.options || [],
    correct_option: q.correctOption,
    explanation: q.explanation,
    distractor_rationale: q.distractorRationale ?? null,
    lifecycle_state: q.lifecycleState || 'imported',
    empirical_stats: q.empiricalStats || { totalAttempts: 0, correctCount: 0, avgResponseTimeMs: 0, distractorSelectionCounts: {} }
  };
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
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

  const rows = questions.map(questionToRow);
  for (const batch of chunk(rows, 100)) {
    const { error } = await table('questions').upsert(batch, { onConflict: 'id' });
    if (error) throw error;
  }
  console.log(`Upserted ${rows.length} questions.`);
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
