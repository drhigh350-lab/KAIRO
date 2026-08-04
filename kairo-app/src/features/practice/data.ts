export interface Subject {
  key: string;
  label: string;
}

export interface Difficulty {
  key: string;
  label: string;
  desc: string;
}

export interface PracticeQuestion {
  id: string;
  subject: string;
  topic: string;
  subtopic: string;
  stem: string;
  options: string[];
  correct: number;
  why: string;
  kai: string;
}

export const subjects: Subject[] = [
  { key: 'physics', label: 'Physics' },
  { key: 'chemistry', label: 'Chemistry' },
  { key: 'biology', label: 'Biology' },
  { key: 'english', label: 'English Language' },
  { key: 'mathematics', label: 'Mathematics' },
];

export const difficulties: Difficulty[] = [
  { key: 'adaptive', label: 'Adaptive', desc: 'Kairo adjusts difficulty as you answer' },
  { key: 'easy', label: 'Easy', desc: 'Build confidence with fundamentals' },
  { key: 'medium', label: 'Medium', desc: 'Standard UTME difficulty' },
  { key: 'hard', label: 'Hard', desc: 'Challenge yourself with tougher questions' },
];

export const sessionLengths: number[] = [10, 15, 20, 30];
