/**
 * Kairo — Question Bank Importer
 *
 * Converts a flat, pre-verified UTME question-bank CSV (the
 * "Question Number, Section, Topic, Question, Option A-D, Correct Answer,
 * Explanation (Why Correct), Why Other Options Are Wrong" shape) into
 * QIM-shaped Question JSON at lifecycleState 'imported'.
 *
 * This does NOT run QuestionLifecycle.validate() QA gates or attach
 * concept/misconception IDs — those require the Subject Knowledge Graph
 * and Misconception Library to already have matching entries, which is a
 * separate content-modeling pass. This script only gets a clean CSV into
 * the QIM's expected shape so that pass has something to run against.
 *
 * Usage: node scripts/import-question-bank.js <input.csv> <output.json> --subject Biology --examBody JAMB
 */
import fs from 'fs';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(r => r.length > 1 || r[0] !== '');
}

function toRecords(rows) {
  const header = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const rec = {};
    header.forEach((h, i) => { rec[h] = (r[i] ?? '').trim(); });
    return rec;
  });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function toQuestion(rec, { subject, examBody, source }, index) {
  const optionLetters = ['A', 'B', 'C', 'D'];
  const correctLetter = (rec['Correct Answer'] || '').trim().toUpperCase();

  const options = optionLetters
    .filter(l => rec[`Option ${l}`])
    .map(l => ({
      label: l,
      text: rec[`Option ${l}`],
      isCorrect: l === correctLetter
    }));

  return {
    id: `${slugify(subject)}_${String(rec['Question Number'] || index + 1).padStart(4, '0')}`,
    subject,
    topic: rec['Topic'] || null,
    subtopic: rec['Section'] || null,
    learningObjective: null,
    conceptsTested: [],
    prerequisiteConcepts: [],
    difficultyRating: 1,
    cognitiveLevel: 'recall',
    estimatedSolvingTimeSec: 60,
    readingLoad: 'low',
    calculationLoad: 'none',
    distractors: options
      .filter(o => !o.isCorrect)
      .map(o => ({ option: o.label, misconceptionId: null, explanation: null })),
    skillsAssessed: [],
    source: source || 'partner_question_bank',
    year: null,
    examBody: examBody || 'JAMB',
    relatedQuestionIds: [],
    stem: rec['Question'],
    options,
    correctOption: correctLetter,
    explanation: rec['Explanation (Why Correct)'] || null,
    distractorRationale: rec['Why Other Options Are Wrong'] || null,
    lifecycleState: 'imported',
    empiricalStats: {
      totalAttempts: 0,
      correctCount: 0,
      avgResponseTimeMs: 0,
      distractorSelectionCounts: {}
    }
  };
}

function main() {
  const args = process.argv.slice(2);
  const [inputPath, outputPath] = args.filter(a => !a.startsWith('--'));
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) flags[args[i].slice(2)] = args[i + 1];
  }

  if (!inputPath || !outputPath) {
    console.error('Usage: node scripts/import-question-bank.js <input.csv> <output.json> --subject <Subject> [--examBody JAMB] [--source name]');
    process.exit(1);
  }

  const text = fs.readFileSync(inputPath, 'utf-8').replace(/^﻿/, '');
  const records = toRecords(parseCsv(text));

  const skipped = [];
  const questions = [];
  records.forEach((rec, i) => {
    const correctCount = ['A', 'B', 'C', 'D'].filter(l => rec[`Option ${l}`]).filter(l => l === (rec['Correct Answer'] || '').trim().toUpperCase()).length;
    if (!rec['Question'] || !rec['Correct Answer'] || correctCount !== 1) {
      skipped.push({ row: i + 2, reason: !rec['Question'] ? 'missing stem' : !rec['Correct Answer'] ? 'missing answer key' : 'answer key does not match an option' });
      return;
    }
    questions.push(toQuestion(rec, flags, i));
  });

  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));

  console.log(`Imported ${questions.length}/${records.length} questions -> ${outputPath}`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length}:`, skipped);
  }
}

main();
