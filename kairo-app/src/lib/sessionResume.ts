/**
 * Session Resume — "Quick Resume" (Practice Module §2.5/§3.2), referenced by
 * its own spec as an existing precedent the module didn't actually have:
 * engine.currentSession is in-memory only, lost on any reload. Persisted
 * client-side (one active snapshot per signed-in student) rather than a
 * new kairo.sessions row — an interrupted session isn't a "real" session
 * yet, it's scratch state for picking back up on the same device. Cleared
 * on natural completion, kept across an explicit exit, mirroring how
 * LearnModule.activeLessons already treats a lesson left without finishing
 * (resumable, not lost).
 */

const STORAGE_PREFIX = 'kairo_session_resume_v1';

export interface PracticeSessionSnapshot {
  kind: 'practice';
  entryFlow: string;
  subjectKey: string;
  subjectLabel: string;
  /** null for a mixed/weak-areas session spanning every seeded subject. */
  loadSubjectLabel: string | null;
  topic: string | null;
  subtopic: string | null;
  difficulty: string | null;
  questionIds: string[];
  qIndex: number;
  resultsJson: string;
  savedAt: number;
}

/**
 * CBT Exam Mode's snapshot (Batch 1's Anti-Refresh Wipeout fix) — unlike
 * Practice, CBTExamMode's whole `examData` lives only in memory on the
 * `kairo` engine singleton, which a real page reload wipes entirely, so
 * this carries everything needed to rebuild it exactly: the same
 * questions in the same order (`paper`, which already has each
 * question's id), every answer/flag/subject-time recorded so far, and the
 * real absolute start time so a resumed countdown reflects genuine
 * elapsed wall-clock time rather than a re-armed full timer.
 */
export interface CbtSessionSnapshot {
  kind: 'cbt';
  subjects: string[];
  totalTimeMin: number;
  startTime: number;
  paper: { globalIndex: number; subject: string; questionId: string; text: string; options: { label: string; text: string }[]; imageUrl?: string | null }[];
  answers: Record<number, string>;
  flaggedIndices: number[];
  subjectTimes: Record<string, number>;
  current: number;
  savedAt: number;
}

type SessionSnapshot = PracticeSessionSnapshot | CbtSessionSnapshot;

function storageKey(studentId: string | null | undefined): string | null {
  if (!studentId || studentId === 'pending') return null;
  return `${STORAGE_PREFIX}:${studentId}`;
}

export function saveSessionSnapshot(studentId: string | null | undefined, snapshot: SessionSnapshot): void {
  const key = storageKey(studentId);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(snapshot));
  } catch {
    // Storage full/unavailable — resuming is a convenience, never worth surfacing an error for.
  }
}

export function getPracticeSessionSnapshot(studentId: string | null | undefined): PracticeSessionSnapshot | null {
  const key = storageKey(studentId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSnapshot;
    return parsed.kind === 'practice' ? parsed : null;
  } catch {
    return null;
  }
}

export function getCbtSessionSnapshot(studentId: string | null | undefined): CbtSessionSnapshot | null {
  const key = storageKey(studentId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSnapshot;
    return parsed.kind === 'cbt' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Clears the snapshot — scoped to `kind` so completing a session in one
 * mode can't wipe out an unrelated, still-resumable snapshot from another
 * (there's only one active slot per student across practice/cbt) and vice
 * versa.
 */
export function clearSessionSnapshot(studentId: string | null | undefined, kind: 'practice' | 'cbt'): void {
  const key = storageKey(studentId);
  if (!key) return;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw) as SessionSnapshot;
    if (parsed.kind !== kind) return;
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
