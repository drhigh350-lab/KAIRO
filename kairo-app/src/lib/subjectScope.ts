import { courses } from '../features/onboarding/data';

/** Canonical subject names used by onboarding, the engine, and Supabase content. */
export const SEEDED_SUBJECTS = ['English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics'] as const;

const aliases: Record<string, string> = {
  english: 'English Language',
  englishlanguage: 'English Language',
  useofenglish: 'English Language',
  eng: 'English Language',
  maths: 'Mathematics',
  math: 'Mathematics',
  mathematics: 'Mathematics',
  biology: 'Biology',
  bio: 'Biology',
  chemistry: 'Chemistry',
  chem: 'Chemistry',
  physics: 'Physics',
  phy: 'Physics',
};

export function canonicalSubject(value: string): string {
  const trimmed = value.trim();
  const compact = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
  return aliases[compact] || trimmed;
}

function comparableCourseName(value: string | null | undefined): string {
  return String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
}

/** The selected course is authoritative whenever it is one of KAIRO's known courses. */
export function getCourseSubjects(targetCourse?: string | null, targetSubjects: string[] = []): string[] {
  const requestedCourse = comparableCourseName(targetCourse);
  const course = courses.find((item) => comparableCourseName(item.name) === requestedCourse);
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
