import { courses } from '../features/onboarding/data';

/** Canonical subject names used by onboarding, the engine, and Supabase content. */
export const SEEDED_SUBJECTS = ['English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics'] as const;

const aliases: Record<string, string> = {
  english: 'English Language',
  eng: 'English Language',
  maths: 'Mathematics',
  math: 'Mathematics',
  biology: 'Biology',
  bio: 'Biology',
  chemistry: 'Chemistry',
  chem: 'Chemistry',
  physics: 'Physics',
  phy: 'Physics',
};

export function canonicalSubject(value: string): string {
  const trimmed = value.trim();
  return aliases[trimmed.toLowerCase()] || trimmed;
}

/** The selected course is authoritative whenever it is one of KAIRO's known courses. */
export function getCourseSubjects(targetCourse?: string | null, targetSubjects: string[] = []): string[] {
  const course = courses.find((item) => item.name.toLowerCase() === String(targetCourse || '').trim().toLowerCase());
  const source = course?.subjects?.length ? course.subjects : targetSubjects;
  return [...new Set(source.map(canonicalSubject))];
}

export function isSubjectAllowed(subject: string, targetCourse?: string | null, targetSubjects: string[] = []): boolean {
  const allowed = getCourseSubjects(targetCourse, targetSubjects);
  return allowed.length === 0 || allowed.includes(canonicalSubject(subject));
}

export function getSeededCourseSubjects(targetCourse?: string | null, targetSubjects: string[] = []): string[] {
  const allowed = getCourseSubjects(targetCourse, targetSubjects);
  return SEEDED_SUBJECTS.filter((subject) => allowed.includes(subject));
}

export function toSubjectKey(subject: string): string {
  return canonicalSubject(subject).toLowerCase().replace(/\s+language$/, '').replace(/\s+/g, '_');
}
