import type { PracticeQuestion } from '../features/practice/data';

// Shape returned by KairoEngine.getQuestionForConcept() (see
// kairo-learning-engine/src/index.js _flattenQuestion) — a flattened view of
// the full qim/Question.js shape meant for exactly this kind of consumer.
export interface EngineFlatQuestion {
  id: string;
  subject: string;
  topic: string;
  text: string;
  options: { label: string; text: string; isCorrect: boolean }[];
  correctOption: string;
  explanation?: string | null;
  conceptId?: string | null;
  difficulty?: number;
  imageUrl?: string | null;
}

/** Converts an engine question into the shape kairo-app's Practice screens already render. */
export function toUiQuestion(q: EngineFlatQuestion): PracticeQuestion {
  const correct = q.options.findIndex((o) => o.label === q.correctOption);
  return {
    id: q.id,
    subject: q.subject,
    topic: q.topic,
    subtopic: '',
    stem: q.text,
    options: q.options.map((o) => o.text),
    correct: correct === -1 ? 0 : correct,
    why: q.explanation || 'Review the option above marked correct.',
    kai: q.explanation || "Let's look at this one together.",
    imageUrl: q.imageUrl ?? null,
  };
}

/** The option label (e.g. "B") the student actually picked, for engine.submitAnswer(). */
export function selectedOptionLabel(q: EngineFlatQuestion, selectedIndex: number | null): string | undefined {
  if (selectedIndex == null) return undefined;
  return q.options[selectedIndex]?.label;
}
