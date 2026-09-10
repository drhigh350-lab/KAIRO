import type { QuestionOptionInput } from '../../lib/quizApi';

export interface ParsedMarkdownQuestion {
  row: number;
  subject: string;
  topic: string;
  difficulty: string;
  stem: string;
  options: QuestionOptionInput[];
  explanation: string;
  distractorExplanations: Record<string, string>;
  hint: string;
  imageUrl: string;
  errors: string[];
  warnings: string[];
}

const SUBJECTS = new Set(['Biology', 'Chemistry', 'Mathematics', 'Physics', 'Use of English']);
const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

function value(block: string, label: string): string {
  const match = block.match(new RegExp(`^${label}\\s*:\\s*(.+)$`, 'imim'));
  return match?.[1]?.trim() || '';
}

function section(block: string, heading: string): string {
  const match = block.match(new RegExp(`^${heading}\\s*:\\s*([\\s\\S]*?)(?=^\\w[\\w ]*\\s*:|^---\\s*$|$)`, 'im'));
  return match?.[1]?.trim() || '';
}

export function parseArenaMarkdown(markdown: string): ParsedMarkdownQuestion[] {
  const blocks = markdown.replace(/\r/g, '').split(/^---\s*$/m).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, index) => {
    const stem = value(block, 'Question');
    const subject = value(block, 'Subject');
    const topic = value(block, 'Topic');
    const difficulty = value(block, 'Difficulty').toLowerCase();
    const answer = value(block, 'Correct Answer').toUpperCase();
    const options: QuestionOptionInput[] = ['A', 'B', 'C', 'D'].map((label) => ({
      label,
      text: value(block, `${label}`),
      isCorrect: answer === label,
    }));
    const distractorExplanations: Record<string, string> = {};
    for (const label of ['A', 'B', 'C', 'D']) {
      const text = value(block, `Option ${label}`);
      if (text) distractorExplanations[label] = text;
    }
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!stem) errors.push('Missing Question');
    if (!SUBJECTS.has(subject)) errors.push('Subject must be Biology, Chemistry, Mathematics, Physics, or Use of English');
    if (!DIFFICULTIES.has(difficulty)) errors.push('Difficulty must be easy, medium, or hard');
    if (options.some((o) => !o.text)) errors.push('All four options A–D are required');
    if (!['A', 'B', 'C', 'D'].includes(answer)) errors.push('Correct Answer must be A, B, C, or D');
    if (!section(block, 'Explanation')) errors.push('Missing Explanation');
    if (!section(block, 'Hint')) errors.push('Missing Hint');
    for (const label of ['A', 'B', 'C', 'D']) {
      if (label !== answer && !distractorExplanations[label]) errors.push(`Missing Option ${label} explanation`);
    }
    if (new Set(options.map((o) => o.text.trim().toLowerCase())).size !== 4) errors.push('Options must be distinct');
    if (stem.length < 15) warnings.push('Question stem is very short');
    return {
      row: index + 1,
      subject,
      topic,
      difficulty,
      stem,
      options,
      explanation: section(block, 'Explanation'),
      distractorExplanations,
      hint: section(block, 'Hint'),
      imageUrl: value(block, 'Image') === 'optional/path-or-upload-id' ? '' : value(block, 'Image'),
      errors,
      warnings,
    };
  });
}

export const ARENA_MARKDOWN_TEMPLATE = `# KAIRO ARENA QUESTION

Question: Which organelle is primarily responsible for aerobic respiration in a cell?

A: Ribosome
B: Mitochondrion
C: Golgi apparatus
D: Lysosome

Correct Answer: B

Explanation: Mitochondria carry out the major stages of aerobic respiration and ATP production.

Option A: Ribosomes synthesize proteins.
Option C: The Golgi apparatus modifies and packages proteins.
Option D: Lysosomes digest unwanted cellular material.

Hint: Think about the organelle associated with releasing usable energy from food.

Subject: Biology
Topic: Cell Biology
Difficulty: medium
Image: optional/path-or-upload-id

---
`;
