/**
 * Session Resume — "Quick Resume" (Practice Module §2.5/§3.2) and
 * "Continue Reviewing" (Review Module §4.3 item 2), both referenced by
 * their own specs as an existing precedent neither module actually had:
 * engine.currentSession is in-memory only, lost on any reload, and
 * ReviewSession.tsx never even called startSession() at all. Persisted
 * client-side (one active snapshot per signed-in student) rather than a
 * new kairo.sessions row — an interrupted session isn't a "real" session
 * yet (Review Module §7.9's own consistency-contribution rule only counts
 * a *completed* session), it's scratch state for picking back up on the
 * same device. Cleared on natural completion, kept across an explicit
 * exit, mirroring how LearnModule.activeLessons already treats a lesson
 * left without finishing (resumable, not lost).
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

export interface ReviewSessionSnapshot {
  kind: 'review';
  planJson: string;
  /** Resume always restarts at the beginning of this item — mid-item (reflect vs. reinforce) position isn't preserved, to avoid reconstructing partial-item state. */
  itemIndex: number;
  resultsJson: string;
  savedAt: number;
}

type SessionSnapshot = PracticeSessionSnapshot | ReviewSessionSnapshot;

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

export function getReviewSessionSnapshot(studentId: string | null | undefined): ReviewSessionSnapshot | null {
  const key = storageKey(studentId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSnapshot;
    return parsed.kind === 'review' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Clears the snapshot — scoped to `kind` so completing a Review session
 * can't wipe out an unrelated, still-resumable Practice snapshot (there's
 * only one active slot per student across both modes) and vice versa.
 */
export function clearSessionSnapshot(studentId: string | null | undefined, kind: 'practice' | 'review'): void {
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
