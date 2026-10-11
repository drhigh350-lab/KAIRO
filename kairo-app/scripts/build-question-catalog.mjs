#!/usr/bin/env node
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const subjectFiles = new Map([
  ['Biology', 'biology'],
  ['Chemistry', 'chemistry'],
  ['Mathematics', 'mathematics'],
  ['Physics', 'physics'],
  ['Use of English', 'use-of-english'],
]);
const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/build-question-catalog.mjs <supabase-export.json>');
  process.exit(2);
}

const source = JSON.parse(await readFile(path.resolve(inputPath), 'utf8'));
if (!Array.isArray(source)) throw new Error('Input must be a JSON array of kairo.questions rows.');
const ids = new Set();
const grouped = new Map([...subjectFiles.keys()].map((subject) => [subject, []]));
for (const row of source) {
  if (!row?.id || ids.has(row.id)) throw new Error(`Missing or duplicate question ID: ${row?.id ?? '(missing)'}`);
  ids.add(row.id);
  if (row.lifecycle_state !== 'live') throw new Error(`Non-live record included: ${row.id}`);
  const bank = grouped.get(row.subject);
  if (!bank) throw new Error(`Unexpected question subject: ${row.subject}`);
  bank.push({
    id: row.id,
    subject: row.subject,
    topic: row.topic,
    subtopic: row.subtopic,
    learningObjective: row.learning_objective,
    conceptsTested: row.concepts_tested || [],
    prerequisiteConcepts: row.prerequisite_concepts || [],
    difficultyRating: row.difficulty_rating,
    cognitiveLevel: row.cognitive_level,
    estimatedSolvingTimeSec: row.estimated_solving_time_sec,
    readingLoad: row.reading_load,
    calculationLoad: row.calculation_load,
    distractors: row.distractors || [],
    skillsAssessed: row.skills_assessed || [],
    source: row.source,
    year: row.year,
    examBody: row.exam_body,
    relatedQuestionIds: row.related_question_ids || [],
    stem: row.stem,
    options: row.options || [],
    correctOption: row.correct_option,
    explanation: row.explanation,
    distractorRationale: row.distractor_rationale,
    lifecycleState: row.lifecycle_state,
    updatedAt: row.updated_at || null,
    empiricalStats: row.empirical_stats || { totalAttempts: 0, correctCount: 0, avgResponseTimeMs: 0, distractorSelectionCounts: {} },
    imageUrl: row.image_url || null,
  });
}
if (!source.length) throw new Error('Refusing to generate an empty catalog.');

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, '../public/question-catalog/v1');
await mkdir(outputDir, { recursive: true });
const manifest = {
  version: 1,
  source: 'Supabase kairo.questions',
  selection: "lifecycle_state = 'live'",
  questionCount: source.length,
  subjects: {},
};
for (const [subject, slug] of subjectFiles) {
  const questions = grouped.get(subject);
  if (!questions.length) throw new Error(`No questions found for ${subject}.`);
  const filename = `${slug}.json`;
  await writeFile(path.join(outputDir, filename), JSON.stringify(questions), 'utf8');
  manifest.subjects[subject] = {
    file: filename,
    questionCount: questions.length,
    withImageUrl: questions.filter((question) => question.imageUrl).length,
  };
}
await writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${source.length} unique live questions across ${subjectFiles.size} subject packs to ${outputDir}`);
