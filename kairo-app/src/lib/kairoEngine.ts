import { KairoEngine, SupabaseSyncAdapter, CBTExamMode } from 'kairo-learning-engine';
import { getSupabase } from './supabaseClient';
import { selectedOptionLabel, type EngineFlatQuestion } from './engineAdapter';
import type { PracticeExplanation } from '../features/practice/PracticeQuestion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Engine = any;

let engine: Engine | null = null;

export function getEngine(): Engine | null {
  return engine;
}

/**
 * Whether the signed-in student has actually taken the real diagnostic —
 * `profile.diagnosticCompleted` is set exactly once, by
 * OnboardingEngine.buildInitialPlan() at the genuine end of onboarding
 * (see kairo-learning-engine/src/onboarding/OnboardingEngine.js), and
 * persists to kairo.students.diagnostic_completed so this holds even
 * after a cache clear / new device. Deliberately not `targetSubjects.
 * length > 0` — those profile fields are now saved as soon as the "About
 * You" step is submitted (savePartialOnboardingProgress(), below), well
 * before the diagnostic runs, so that signal alone would let a student
 * skip straight to /home without ever taking it. Used by route guards to
 * tell "authenticated but never finished onboarding" apart from
 * "authenticated and ready for the main app" — those previously looked
 * identical to every screen (both have a non-null engine), so an
 * abandoned onboarding silently landed on a blank Home instead of being
 * routed back.
 */
export function isOnboarded(): boolean {
  return engine?.profile?.diagnosticCompleted === true;
}

function createEngine(name: string): Engine {
  engine = new KairoEngine({
    studentId: 'pending',
    name,
    examDate: null,
    targetSubjects: [],
    targetCourse: null,
    targetUniversity: null,
  });
  return engine;
}

/**
 * A session persisted in local storage from a previous visit can outlive the
 * account it belongs to (e.g. the account was deleted server-side while this
 * browser still held its session) — Supabase then rejects it with "User from
 * sub claim in JWT does not exist" on the very next authenticated request,
 * which can collide with an unrelated sign-up/sign-in happening in the same
 * page load. Sign-up and sign-in both start a deliberately fresh auth flow,
 * so any leftover session is irrelevant to them regardless of whether it's
 * still valid — clear it first rather than let it interfere.
 */
async function clearStaleSession(supabase: Engine): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    // best-effort — a signOut() failure here just means there was nothing to clear
  }
}

/**
 * Extracts a real, specific message from anything a failed auth/Supabase
 * call might throw. `err instanceof Error` isn't reliable here — Postgrest/
 * Auth errors from supabase-js aren't guaranteed to pass that check — so a
 * naive `instanceof Error` guard was silently swallowing the real cause
 * (e.g. an RLS denial or a schema error on the kairo.students insert) behind
 * a generic "Could not sign you in" message that was actively misleading
 * about what actually failed.
 */
export function describeError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    const parts = [obj.message, obj.details, obj.hint].filter((p): p is string => typeof p === 'string' && p.length > 0);
    if (parts.length) return parts.join(' — ');
    if (typeof obj.code === 'string') return `Error (${obj.code})`;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export interface SignUpArgs {
  name: string;
  email: string;
  password: string;
}

/** Creates a new Supabase Auth account, then connects a fresh KairoEngine to it. */
export async function signUpAndConnect({ name, email, password }: SignUpArgs): Promise<Engine> {
  const supabase = getSupabase();
  await clearStaleSession(supabase);
  const kairo = createEngine(name);
  await kairo.init();
  const adapter = new SupabaseSyncAdapter(supabase, kairo.store);
  await adapter.signUp(email, password, { name });
  await kairo.connectSupabase(supabase, { email, password });
  return kairo;
}

export interface SignInArgs {
  email: string;
  password: string;
}

/** Signs in an existing student and connects the engine, pulling their saved profile down. */
export async function signInAndConnect({ email, password }: SignInArgs): Promise<Engine> {
  const supabase = getSupabase();
  await clearStaleSession(supabase);
  const kairo = createEngine('');
  await kairo.init();
  await kairo.connectSupabase(supabase, { email, password });
  await kairo.sync.sync();
  return kairo;
}

/**
 * Restores a signed-in session on app boot (e.g. after a page reload), so a
 * returning student isn't dropped back to onboarding just because there's no
 * in-memory engine yet. Returns false (not an error) whenever there's simply
 * nothing to restore — no configured Supabase env vars, no existing session,
 * or the session no longer being valid.
 */
export async function restoreSession(): Promise<boolean> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return false;
  }

  // A single flaky request on a weak mobile connection used to end the
  // whole restore attempt permanently — one dropped packet during either
  // getSession()'s own token-refresh round trip or connectSupabase()'s
  // profile fetch, and the student looked "signed out" for that entire
  // page load, with the only recovery being to sign in again by hand.
  // Retries the whole sequence a few times with backoff before giving up,
  // but never retries a genuine auth rejection (an account that's really
  // gone isn't going to start existing on the next attempt) and never
  // retries simply having no session at all (nothing to restore, not a
  // failure).
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return false;

      const kairo = createEngine('');
      await kairo.init();
      // No email/password — connectSupabase() reuses the session getSession() already restored.
      await kairo.connectSupabase(supabase, {});
      // The profile is already hydrated at this point — a sync hiccup
      // right after a successful reconnect shouldn't undo it, so this
      // runs in the background rather than gating the restore's result.
      kairo.sync.sync().catch(() => {});
      return true;
    } catch (err) {
      if (isAuthRejection(err)) {
        await clearStaleSession(supabase);
        engine = null;
        return false;
      }
      if (attempt === maxAttempts) {
        engine = null;
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 800));
    }
  }
  engine = null;
  return false;
}

function isAuthRejection(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const obj = err as Record<string, unknown>;
  const status = obj.status ?? obj.statusCode;
  if (status === 401 || status === 403) return true;
  const message = describeError(err).toLowerCase();
  return message.includes('jwt') || message.includes('does not exist') || message.includes('not authenticated') || (message.includes('invalid') && message.includes('token'));
}

/**
 * Kicks off the real Google OAuth redirect (supabase.auth.signInWithOAuth) —
 * the browser navigates away to Google and back to `redirectPath` once the
 * handshake with Supabase's own fixed callback URL finishes. There is
 * nothing meaningful to return here on success; the promise only resolves
 * with an error when Supabase rejects the request before ever redirecting
 * (e.g. the Google provider isn't actually configured server-side).
 */
export async function signInWithGoogle(redirectPath = '/onboarding/google'): Promise<void> {
  const supabase = getSupabase();
  await clearStaleSession(supabase);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}${redirectPath}` },
  });
  if (error) throw error;
}

export interface GoogleSignInResult {
  /** True when kairo.students had no row for this auth user yet — a first-time Google student who still needs the real onboarding steps (course/exam date/subjects), same as an email sign-up would get. */
  isNewStudent: boolean;
  /** Google's account name, for pre-filling onboarding when this is a first-time student. */
  name: string;
}

/**
 * Completes the Google OAuth round trip — called from the page `redirectPath`
 * (above) points at. supabase-js has already parsed the session out of the
 * URL by the time this runs (detectSessionInUrl is on by default), so this
 * just connects the engine the same way restoreSession() does.
 */
export async function connectGoogleAccount(): Promise<GoogleSignInResult> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Google sign-in did not complete — no session was returned.');

  const googleName = (data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || '').trim();
  const kairo = createEngine(googleName);
  await kairo.init();
  const remoteProfile = await kairo.connectSupabase(supabase, {});
  await kairo.sync.sync();
  return { isNewStudent: remoteProfile.isNewStudent, name: remoteProfile.name || googleName };
}

/** Signs the current student out of Supabase and drops the in-memory engine, so the app returns to a guest state. */
export async function signOutAndDisconnect(): Promise<void> {
  try {
    // A completed session already syncs itself (KairoEngine.endSession()),
    // but that runs in the background right after the summary screen
    // navigates away — a student who signs out immediately afterward could
    // otherwise race it: signOut() invalidates the auth token an in-flight
    // sync request hasn't sent yet, and the whole session is lost with
    // nothing to retry it once `engine` is dropped below. One last flush
    // here closes that window; failures are swallowed since sign-out must
    // still proceed either way.
    if (engine) await engine.sync.sync();
  } catch {
    // best-effort
  }
  try {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  } catch {
    // best-effort — still drop the local session below even if the network call fails
  }
  engine = null;
  contentLoadedFor = [];
}

// Only these five subjects have a seeded live question bank today (verified
// directly against kairo.questions) — a student can pick from 14 subjects at
// onboarding, but most have zero content yet. This is a content gap, not
// something to fabricate around.
export const SEEDED_SUBJECTS = ['Biology', 'Chemistry', 'Physics', 'Use of English', 'Mathematics'];

/** Whether a subject (in its onboarding/practice-picker label form, e.g. "English Language") has real seeded question content today. */
export function hasSeededContent(subjectLabel: string): boolean {
  return SEEDED_SUBJECTS.includes(normalizeSubjectName(subjectLabel));
}

let contentLoadedFor: string[] = [];

async function ensureContentLoaded(subjects: string[]): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const wanted = subjects.filter((s) => SEEDED_SUBJECTS.includes(s));
  const target = wanted.length ? wanted : SEEDED_SUBJECTS;
  const missing = target.filter((s) => !contentLoadedFor.includes(s));
  if (missing.length === 0) return;
  await kairo.loadContentCatalog({ subjects: target });
  contentLoadedFor = [...new Set([...contentLoadedFor, ...target])];
}

export interface SuggestedSessionResult {
  questions: Engine[];
  kaiMessage?: string;
}

/** A recommendation anchored to one specific concept stays on that concept's whole topic for at least this many questions, never drifting into the general mixed queue after the first one. */
const TOPIC_SESSION_MIN_QUESTIONS = 10;

/**
 * Starts a real adaptive session (mode 'standard' — the DB's mode check
 * constraint doesn't have a 'suggested' value) across whichever of the
 * student's subjects have real content, then resolves up to `limit` live
 * questions for the concepts the RecommendationEngine actually queued.
 *
 * `anchorConceptId` — Home's MissionCard names one specific concept via
 * getTodayFocus() and explains *why* it's recommended. The whole session
 * now stays scoped to that concept's subject+topic (RecommendationEngine.
 * buildTopicSessionPlan — every concept in the topic, prioritized and
 * interleaved the same way the general queue is, so it mixes concepts
 * the student has struggled with and ones they've already passed, real
 * active retrieval rather than a blind replay) for at least
 * TOPIC_SESSION_MIN_QUESTIONS questions, cycling back through the
 * topic's concepts to pull a second distinct question per concept where
 * the pool allows. Previously only the *first* question was anchored —
 * everything after it came from the general cross-subject queue, so a
 * student who tapped "Simple Interest is fading" could end up practising
 * five unrelated topics instead. Falls back to the general queue only if
 * the topic genuinely has no real questions at all.
 */
export async function startSuggestedSession(limit = 5, anchorConceptId?: string | null): Promise<SuggestedSessionResult> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  await ensureContentLoaded(kairo.profile.targetSubjects || []);

  if (anchorConceptId) {
    const anchorConcept = kairo.graph.getConcept(anchorConceptId);
    if (anchorConcept) {
      const { kaiMessage } = kairo.startSession({ mode: 'standard' });
      const topicConceptIds: string[] = kairo.recommendation.buildTopicSessionPlan(anchorConcept.subject, anchorConcept.topic);
      const ordered = [anchorConceptId, ...topicConceptIds.filter((id: string) => id !== anchorConceptId)];
      kairo.currentSession.plan = ordered;

      const questions: Engine[] = [];
      const seenIds: string[] = [];
      for (let pass = 0; pass < 4 && questions.length < TOPIC_SESSION_MIN_QUESTIONS; pass++) {
        const before = questions.length;
        for (const conceptId of ordered) {
          if (questions.length >= TOPIC_SESSION_MIN_QUESTIONS) break;
          const q = kairo.getQuestionForConcept(conceptId, { excludeIds: seenIds });
          if (q) { questions.push(q); seenIds.push(q.id); }
        }
        if (questions.length === before) break; // no real questions left in this topic — stop rather than loop
      }
      if (questions.length > 0) return { questions, kaiMessage };
      // Genuinely nothing real for this topic — fall through to the general queue below.
    }
  }

  const { queue, kaiMessage } = kairo.startSession({ mode: 'standard' });
  const questions: Engine[] = [];
  const seenIds: string[] = [];
  const seenConceptIds = new Set<string>();

  if (anchorConceptId) {
    const anchorQ = kairo.getQuestionForConcept(anchorConceptId, { excludeIds: seenIds });
    if (anchorQ) {
      questions.push(anchorQ);
      seenIds.push(anchorQ.id);
      seenConceptIds.add(anchorConceptId);
    }
  }

  for (const conceptId of queue) {
    if (questions.length >= limit) break;
    if (seenConceptIds.has(conceptId)) continue;
    const q = kairo.getQuestionForConcept(conceptId, { excludeIds: seenIds });
    if (q) {
      questions.push(q);
      seenIds.push(q.id);
      seenConceptIds.add(conceptId);
    }
  }
  return { questions, kaiMessage };
}

export interface CustomSessionArgs {
  /** Real subject names (e.g. "Physics"), or [] for no subject filter ("All Subjects"). */
  subjects?: string[];
  includeFading?: boolean;
  limit?: number;
  /** PracticeHub's difficulty picker ('adaptive' | 'easy' | 'medium' | 'hard') — see difficultyWindow(). */
  difficulty?: string;
}

/**
 * Maps PracticeHub's difficulty picker to a real difficultyRating window
 * (1–5, the same scale AdaptiveDifficulty's own tiers use) — previously
 * selected in the UI and never sent to the engine at all, so every
 * session ran at whatever the adaptive engine's own per-answer logic
 * picked regardless of what the student chose. 'adaptive' applies no
 * override on purpose: the adaptive engine already adjusts difficulty
 * per answer during the session (see submitAnswer()'s nextDifficulty /
 * difficulty_pullback handling) — that's what "Adaptive" means here, not
 * a fixed window.
 */
function difficultyWindow(level?: string | null): { minDifficulty: number | null; maxDifficulty: number | null } {
  switch (level) {
    case 'easy': return { minDifficulty: 1, maxDifficulty: 2 };
    case 'medium': return { minDifficulty: 2, maxDifficulty: 4 };
    case 'hard': return { minDifficulty: 4, maxDifficulty: 5 };
    default: return { minDifficulty: null, maxDifficulty: null };
  }
}

/**
 * Mixed Practice / Weak Areas, via the same real session lifecycle as
 * startSuggestedSession(). Only subjects with a real seeded question bank
 * are ever passed as a filter.
 *
 * Two real bugs lived here previously: "English Language" was never
 * normalized to "Use of English" (the name the seeded catalog actually
 * uses) before being checked against SEEDED_SUBJECTS, so it silently
 * failed the same way an actually-unseeded subject would; and — the
 * bigger one — CustomPracticeEngine.buildSession() treats an *empty*
 * subjects array as "no filter, include everything" (correct for Mixed
 * Practice's own [] request), so a student who explicitly picked a
 * single unseeded subject (e.g. Mathematics) and had it filtered down to
 * [] here got served a random mix of Biology/Chemistry/Physics/English
 * questions instead — silently answering a different subject than the
 * one they chose, not the "zero questions" this function's old comment
 * assumed. Now: a non-empty request that has nothing seeded left after
 * filtering returns no questions honestly, so the caller's existing
 * "couldn't find any questions" message is accurate instead of masked by
 * a wrong-subject substitution.
 */
export async function startCustomSession({ subjects = [], includeFading = true, limit = 10, difficulty }: CustomSessionArgs): Promise<SuggestedSessionResult> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  await ensureContentLoaded(subjects.length ? subjects : kairo.profile.targetSubjects || []);

  const normalized = subjects.map(normalizeSubjectName);
  const seededSubjects = normalized.filter((s) => SEEDED_SUBJECTS.includes(s));
  if (normalized.length > 0 && seededSubjects.length === 0) {
    return { questions: [] };
  }
  const { queue } = kairo.startCustomPractice({ subjects: seededSubjects, includeFading, count: limit });
  const { minDifficulty, maxDifficulty } = difficultyWindow(difficulty);
  const questions: Engine[] = [];
  const seenIds: string[] = [];
  for (const conceptId of queue) {
    if (questions.length >= limit) break;
    const q = kairo.getQuestionForConcept(conceptId, { excludeIds: seenIds, minDifficulty, maxDifficulty });
    if (q) {
      questions.push(q);
      seenIds.push(q.id);
    }
  }
  return { questions };
}

// ─────────────────────────────────────────────
// Topic Practice — real topic/subtopic taxonomy from kairo.concepts via
// ProfileSettings.getLearningJourney() and TopicPracticeEngine, replacing
// the old fixed 2-topic/2-subtopic picker. Only subjects in
// SEEDED_SUBJECTS return real topics.
// ─────────────────────────────────────────────

export interface TopicInfo { topic: string; total: number; mastered: number; masteryPct: number; questionCount: number }
export interface SubtopicInfo { subtopic: string; total: number; mastered: number; masteryPct: number; questionCount: number }

/** The subject picker's label ("English Language") predates the seeded catalog's real name ("Use of English") — normalized here rather than touching the shared subject list every other Practice entry point also uses. */
function normalizeSubjectName(subject: string): string {
  return subject === 'English Language' ? 'Use of English' : subject;
}

/** Real topics for a subject, with concept counts and mastery — replaces the old hardcoded 2-topic list. */
export async function getRealTopics(subjectLabel: string): Promise<TopicInfo[]> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const subject = normalizeSubjectName(subjectLabel);
  await ensureContentLoaded([subject]);
  const journey = kairo.settings.getLearningJourney();
  const topics = journey[subject]?.topics || {};
  return Object.entries(topics).map(([topic, t]: [string, Engine]) => ({
    topic, total: t.total, mastered: t.mastered, masteryPct: t.masteryPct, questionCount: t.questionCount ?? 0,
  }));
}

/** Real subtopics for a subject+topic, with mastery — replaces the old hardcoded 2-subtopic list. */
export async function getRealSubtopics(subjectLabel: string, topic: string): Promise<SubtopicInfo[]> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const subject = normalizeSubjectName(subjectLabel);
  await ensureContentLoaded([subject]);
  const { subtopics } = kairo.topicPractice.getTopicJourney(subject, topic);
  return subtopics.map((s: Engine) => ({ subtopic: s.name, total: s.total, mastered: s.mastered, masteryPct: s.masteryPct, questionCount: s.questionCount ?? 0 }));
}

/**
 * Starts a real topic-scoped session. subtopic is optional — omitting it
 * (the SubtopicSelect screen's "practise all of this topic" skip) pulls
 * from every subtopic under the topic instead of one.
 */
export async function startTopicPracticeSession(subjectLabel: string, topic: string, subtopic?: string, limit = 10, difficulty?: string): Promise<SuggestedSessionResult> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const subject = normalizeSubjectName(subjectLabel);
  await ensureContentLoaded([subject]);

  const concepts = (subtopic
    ? kairo.getAllConcepts({ subject, topic, subtopic })
    : kairo.getAllConcepts({ subject, topic })
  ).slice().sort((a: Engine, b: Engine) => (a.state === 'fading' ? -1 : 1) - (b.state === 'fading' ? -1 : 1));

  // A subtopic maps to exactly one concept in almost all seeded content,
  // so the old queue — distinct concepts sliced to `limit` — capped every
  // topic-practice session at 1 question no matter how many real
  // questions existed for that one concept. Round-robin across each
  // concept's real question pool instead, so a single concept with N
  // seeded questions still fills up to min(N, limit) session slots.
  const pools = concepts.map((c: Engine) => ({
    conceptId: c.id,
    remaining: kairo.questionGraph.getQuestionsForConcept(c.id).length
  }));
  const queue: string[] = [];
  let addedThisPass = true;
  while (queue.length < limit && addedThisPass) {
    addedThisPass = false;
    for (const pool of pools) {
      if (queue.length >= limit) break;
      if (pool.remaining > 0) {
        queue.push(pool.conceptId);
        pool.remaining--;
        addedThisPass = true;
      }
    }
  }

  kairo.startSession({ mode: 'topic_practice', plan: queue });

  const { minDifficulty, maxDifficulty } = difficultyWindow(difficulty);
  const questions: Engine[] = [];
  const seenIds: string[] = [];
  for (const conceptId of queue) {
    if (questions.length >= limit) break;
    const q = kairo.getQuestionForConcept(conceptId, { excludeIds: seenIds, minDifficulty, maxDifficulty });
    if (q) {
      questions.push(q);
      seenIds.push(q.id);
    }
  }
  return { questions };
}

/** Re-resolves real questions by id for Practice's Quick Resume — ensures the right subject content is loaded first (or every seeded subject, for a mixed/weak session), since a resumed session may start from a fresh page load with nothing loaded yet. Drops any id that no longer resolves rather than throwing, so a resume with one stale question still recovers the rest. */
export async function resumePracticeQuestions(loadSubjectLabel: string | null, questionIds: string[]): Promise<EngineFlatQuestion[]> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  await ensureContentLoaded(loadSubjectLabel ? [loadSubjectLabel] : []);
  return questionIds
    .map((id) => kairo.getQuestionById(id))
    .filter((q: EngineFlatQuestion | null): q is EngineFlatQuestion => !!q);
}

export interface TodayProgress {
  questionsToday: number;
  studyMinutesToday: number;
  /** null when nothing's been answered today yet — there's no real accuracy to show. */
  accuracyPct: number | null;
  /** null when the student hasn't set one — never defaulted to a made-up number. */
  dailyGoal: number | null;
}

/**
 * Real "today" slice of this session's completed sessions (Practice/CBT/
 * Rapid Fire all queue through KairoEngine.endSession() or CBTExamMode's
 * own kairo.sessions push, both of which land in profile.sessions) — Home's
 * "Today's Progress" card used to be entirely hardcoded (0%, em-dashes)
 * regardless of what the student actually did. There's no "daily goal"
 * concept anywhere in the schema to compute a real percentage against, so
 * this deliberately doesn't invent one — the card shows real counts and
 * real accuracy instead.
 *
 * profile.sessions is restored from kairo.sessions on every connectSupabase()
 * call (see fetchSessions()), so a same-day session from before a reload is
 * still reflected here, not just whatever this engine instance completed
 * since the current page load.
 */
export function getTodayProgress(): TodayProgress {
  const kairo = getEngine();
  const sessions: Engine[] = kairo?.profile?.sessions || [];
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todays = sessions.filter((s) => (s.completedAt || 0) >= startOfToday.getTime());

  const questionsToday = todays.reduce((sum, s) => sum + (s.questionsAnswered || 0), 0);
  const correctToday = todays.reduce((sum, s) => sum + (s.correctCount || 0), 0);
  const studyMs = todays.reduce((sum, s) => sum + Math.max(0, (s.completedAt || 0) - (s.startedAt || 0)), 0);

  return {
    questionsToday,
    studyMinutesToday: Math.round(studyMs / 60000),
    accuracyPct: questionsToday > 0 ? Math.round((correctToday / questionsToday) * 100) : null,
    dailyGoal: kairo?.profile?.dailyQuestionGoal ?? null,
  };
}

export interface TodayFocus {
  macroState: string | null;
  conceptId: string | null;
  conceptName: string | null;
  subject: string | null;
  topic: string | null;
  reason: string | null;
}

/**
 * Home's "why this session" reasoning — previously a static, client-authored
 * sentence identical for every student. This calls straight through to
 * RecommendationEngine's own real scoring (decay urgency, exam proximity,
 * macro-state), the same signals that decide the actual session queue, via
 * a non-committal preview that doesn't start or consume a real session.
 * Null conceptId/reason (no concepts yet) is a real, honest state — callers
 * should fall back to a generic sentence rather than treat it as an error.
 */
export function getTodayFocus(): TodayFocus | null {
  const kairo = getEngine();
  if (!kairo) return null;
  return kairo.getTodayFocus();
}

export interface AppNotification {
  candidateId: string;
  type: string;
  tier: string;
  title: string;
  body: string;
  action: string | null;
  sourceId?: string;
}

/**
 * Runs the real notification pulse — ReEngagementEngine, CrossModuleMilestones,
 * ContinuationEngine's post-exam window, and NotificationEngine's client
 * heuristics, arbitrated through the Orchestrator's tone/journey-stage/
 * suppression/frequency gates. All of this was fully built and individually
 * tested at the engine layer but never actually invoked from the app before —
 * this is that missing entrypoint. No external transport (push/email/
 * WhatsApp/SMS) exists yet, so whatever comes back here is meant for in-app
 * display only, regardless of the tier the Orchestrator assigned.
 */
export function runNotificationPulse(): AppNotification[] {
  const kairo = getEngine();
  if (!kairo) return [];
  return kairo.runNotificationPulse();
}

let pulseRanForStudentId: string | null = null;

/**
 * Same as runNotificationPulse(), but only actually runs once per signed-in
 * session (per studentId) — safe to call on every route change without
 * re-triggering the pulse's Orchestrator side effects (frequency-budget
 * bookkeeping) repeatedly. Exists because a fresh sign-in navigates
 * client-side (Splash -> /home), so there's no single reliable "engine just
 * connected" moment to hook a one-shot call onto — this makes calling it
 * from every route change safe and correct instead: a no-op until an
 * engine actually exists, then exactly once.
 */
export function runNotificationPulseOnce(): AppNotification[] {
  const kairo = getEngine();
  if (!kairo) return [];
  const sid = kairo.profile.studentId;
  if (pulseRanForStudentId === sid) return [];
  pulseRanForStudentId = sid;
  return kairo.runNotificationPulse();
}

/** Call when the student dismisses or taps through a delivered notification — feeds the Orchestrator's per-type suppression learning and stops a client-heuristic item (daily recap, streak nudge, etc.) from resurfacing once acknowledged. */
export function recordNotificationOutcome(notification: AppNotification, outcome: 'dismissed' | 'engaged'): void {
  const kairo = getEngine();
  if (!kairo) return;
  kairo.recordNotificationOutcome(notification, outcome);
}

/** Sets (or clears, with null) the student's own daily-question-count goal — a real, student-declared target, never a system-invented default. */
export async function setDailyGoal(goal: number | null): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.settings.updateProfile({ dailyQuestionGoal: goal });
  await kairo.sync.sync();
}

/** Real profile + stats for the Profile screen. null when nothing is signed in yet. */
export function getProfileSummary(): Engine | null {
  const kairo = getEngine();
  return kairo ? kairo.settings.getProfile() : null;
}

export interface ProfileEditDetails {
  name: string;
  targetCourse: string | null;
  targetUniversity: string | null;
  targetSubjects: string[];
  /** ISO date string (e.g. "2027-05-15"), or null to clear it. */
  examDate: string | null;
  /** Student's own definition of "ready" — never edited or blocked by Kairo based on current performance (Student Intelligence Model §1, §11.3). */
  targetUTMEScore: number | null;
  /** Session-length default in minutes (e.g. 20/45/60). */
  preferredStudyDurationMin: number | null;
  preferredStudyPeriod: 'morning' | 'evening' | 'late_night' | null;
}

/**
 * Direct profile edit — for a student who signed in without ever completing
 * onboarding (e.g. reconnecting an account after an earlier session), so
 * name/course/subjects/exam date aren't permanently stuck at whatever they
 * were (often nothing) when the account's kairo.students row was first created.
 */
export async function updateProfileDetails(details: ProfileEditDetails): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.profile.name = details.name;
  kairo.profile.targetCourse = details.targetCourse;
  kairo.profile.targetUniversity = details.targetUniversity;
  kairo.profile.targetSubjects = details.targetSubjects;
  kairo.profile.examDate = details.examDate ? new Date(details.examDate).getTime() : null;
  kairo.profile.targetUTMEScore = details.targetUTMEScore;
  kairo.profile.preferredStudyDurationMin = details.preferredStudyDurationMin;
  kairo.profile.preferredStudyPeriod = details.preferredStudyPeriod;
  await kairo.sync.sync();
}

/** Real strengths/weaknesses/score/streak for the Insights screen. Safe with zero data loaded. */
export function getInsightsSummary(): Engine | null {
  const kairo = getEngine();
  return kairo ? kairo.insights.getDashboardInsights() : null;
}

/** Real "sessions this week" + reinforced/fading concepts and Kai's own reflective narrative for Insights' weekly card. */
export function getWeeklyReviewSummary(): Engine | null {
  const kairo = getEngine();
  if (!kairo) return null;
  const { data, kaiNote } = kairo.getWeeklyReflection();
  return { ...data, kaiNote: kaiNote?.text || null };
}

/** Real month-in-review ("Kairo Wrapped") — reinforced concepts, biggest turnaround, score trend, session/question totals. All computed by MonthlyWrapped; Insights only renders it. */
export function getMonthlyWrapped(): Engine | null {
  const kairo = getEngine();
  return kairo ? kairo.getMonthlyWrapped() : null;
}

/**
 * Real "what needs review" summary for the Review screen. Mirrors
 * ReviewModule.getPreSessionRecap()'s own contract: null both when nothing is
 * signed in AND when genuinely nothing is due — the caller shouldn't have to
 * tell those two "show nothing" cases apart.
 */
export function getReviewSummary(): Engine | null {
  const kairo = getEngine();
  return kairo ? kairo.review.getPreSessionRecap() : null;
}

/** Weakness Review's error-pattern breakdown, for Review's "Weak Topics" card. */
export function getWeaknessReview(): Engine | null {
  const kairo = getEngine();
  return kairo ? kairo.review.buildWeaknessReview() : null;
}

// ─────────────────────────────────────────────
// Review Session — a real Session Framing -> Reflection Moment -> Resolution
// -> Pattern Surfacing -> Reinforcement Attempt -> Consolidation Summary
// flow (Review Module Spec §5.3), built from ReviewModule.buildReviewSession()
// and each concept's own real attemptHistory/questionGraph state — not a
// second intelligence layer of its own (Review Module §7.8).
// ─────────────────────────────────────────────

export interface ReviewSessionItem {
  conceptId: string;
  conceptName: string;
  subject: string | null;
  topic: string | null;
  reason: 'fading' | 'recently_missed' | 'stale';
  priority: string;
  hasPriorMiss: boolean;
  priorQuestionId: string | null;
  priorSelectedOption: string | null;
  priorCorrectOption: string | null;
  priorErrorTag: string | null;
}

export interface ReviewSessionPlan {
  items: ReviewSessionItem[];
  framing: string;
  estimatedTimeMin: number;
  pattern: { tag: string; count: number } | null;
}

export function getReviewSessionPlan(limit = 8): ReviewSessionPlan | null {
  const kairo = getEngine();
  return kairo ? kairo.review.buildReviewSession({ limit }) : null;
}

/** Loads real content for whatever subjects a Review session's items span, so getReviewOriginalQuestion/getReviewReinforcementQuestion can resolve real questions instead of ones from a subject that was never loaded this session. */
export async function ensureReviewContentLoaded(items: ReviewSessionItem[]): Promise<void> {
  const subjects = [...new Set(items.map((i) => i.subject).filter((s): s is string => !!s))];
  await ensureContentLoaded(subjects.length ? subjects : []);
}

/** The exact original question a student answered (Reflection Moment, Review Module §5.5) — distinct from a fresh question, since reconsidering one's own past reasoning is the point. */
export function getReviewOriginalQuestion(questionId: string): EngineFlatQuestion | null {
  const kairo = getEngine();
  return kairo ? kairo.getQuestionById(questionId) : null;
}

/** A fresh Reinforcement/Alternative Representation question for the same concept (Review Module §5.8) — never the identical original, per the platform-wide rule against testing memorization of one specific item. */
export function getReviewReinforcementQuestion(conceptId: string, excludeId?: string | null): EngineFlatQuestion | null {
  const kairo = getEngine();
  if (!kairo) return null;
  return kairo.getQuestionForConcept(conceptId, { excludeIds: excludeId ? [excludeId] : [] });
}

/**
 * A fresh question for the concept RecommendationEngine.processAnswer()
 * decided the student should see next — a prerequisite reroute after a
 * conceptual-gap answer, or a lower-stakes diagnostic question after a
 * guess. submitAnswer() has always computed this decision on every single
 * answer; Practice previously discarded it entirely, so the interrupt
 * never reached the student and the next question was whatever was
 * already sitting in the pre-fetched batch instead.
 */
export function getRecommendedNextQuestion(conceptId: string, excludeIds: string[] = [], maxDifficulty?: number | null): EngineFlatQuestion | null {
  const kairo = getEngine();
  if (!kairo) return null;
  return kairo.getQuestionForConcept(conceptId, { excludeIds, maxDifficulty: maxDifficulty ?? null });
}

/** A concept's current retention state, read directly (not recomputed) so a genuine Reinforced transition during a Review session (Review Module §5.9) can be told apart from routine completion. */
export function getConceptRetentionState(conceptId: string): string | null {
  const kairo = getEngine();
  return kairo?.graph?.getConcept(conceptId)?.retentionState ?? null;
}

/** Real momentum-streak status ({ momentum, protectedGapsUsed, lastSessionDate, message }), or null if signed out. */
export function getStreakStatus(): Engine | null {
  const kairo = getEngine();
  return kairo ? kairo.getStreakStatus() : null;
}

// ─────────────────────────────────────────────
// CBT Exam Mode — real questions via kairo.cbt (CBTExamMode), sourced
// from the same local question queue ensureContentLoaded() already
// populates for Practice. Only subjects with real seeded content
// (SEEDED_SUBJECTS) return real questions.
// ─────────────────────────────────────────────

export interface CbtPaperQuestion {
  globalIndex: number;
  subject: string;
  questionId: string;
  text: string;
  options: { label: string; text: string }[];
}

/** The one real, fully-seeded JAMB combination available today (Science/Medicine track). */
export const CBT_DEFAULT_SUBJECTS = ['Use of English', 'Biology', 'Chemistry', 'Physics'];

/**
 * Real JAMB CBT timing/question-count, sourced from CBTExamMode's own
 * constants instead of being recomputed here separately — the exam setup
 * preview screen used to do its own `subjects.length * 26` arithmetic
 * independent of the real engine, which is how it kept showing 104 minutes
 * even after CBTExamMode.setup() itself was fixed to return 120.
 */
export const CBT_TOTAL_TIME_MIN = CBTExamMode.JAMB_TOTAL_TIME_MIN;
export const CBT_TOTAL_QUESTIONS = CBT_DEFAULT_SUBJECTS.reduce(
  (sum, s) => sum + (CBTExamMode.JAMB_QUESTION_COUNT[s] ?? CBTExamMode.JAMB_QUESTION_COUNT.default),
  0,
);

/** Per-subject JAMB question count (60 for English, 40 for everything else) — the same ground truth CBTExamMode itself uses, exposed here so setup screens can preview real numbers before starting. */
export function cbtQuestionCountFor(subject: string): number {
  const counts = CBTExamMode.JAMB_QUESTION_COUNT as Record<string, number>;
  return counts[subject] ?? counts.default;
}

/** Mirrors CBTExamMode.setup()'s own proportional-pacing formula (CBT Exam Mode Spec §4.3) so a Subject-Specific or Custom Mock's setup preview shows the same duration the exam itself will actually start with. */
export function cbtProportionalTimeMin(totalQuestions: number): number {
  return Math.max(1, Math.round((CBT_TOTAL_TIME_MIN * totalQuestions) / CBTExamMode.JAMB_FULL_COMBO_QUESTIONS));
}

export type CbtExamType = 'full' | 'subject' | 'custom';

export interface StartCbtExamOptions {
  subjects?: string[];
  examType?: CbtExamType;
  /** Custom Mock only — bounded, student-chosen per-subject question counts, distinct from the JAMB-fixed counts a Subject-Specific Mock uses. */
  customQuestionCounts?: Record<string, number>;
  /** Custom Mock only — bounded, student-chosen duration; omitted falls back to the same proportional pacing a Subject-Specific Mock gets. */
  customTotalTimeMin?: number;
}

export async function startCbtExam(options: StartCbtExamOptions = {}): Promise<{ totalQuestions: number; totalTimeMin: number; paper: CbtPaperQuestion[] }> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const subjects = options.subjects?.length ? options.subjects : CBT_DEFAULT_SUBJECTS;
  await ensureContentLoaded(subjects);
  const setup = kairo.cbt.setup({
    subjects,
    examType: options.examType ?? 'full',
    customQuestionCounts: options.customQuestionCounts ?? null,
    customTotalTimeMin: options.customTotalTimeMin ?? null,
  });
  const built = await kairo.cbt.buildPaper();
  kairo.cbt.start();
  // CBTExamMode.buildPaper() strips correctOption but its per-option
  // objects still carry isCorrect (Question.js's normal shape) — CBT
  // Exam Mode spec §2.3/§5.2/§5.4 forbid any correctness signal reaching
  // the student mid-attempt, so strip it here defensively before this
  // ever reaches the browser's own state.
  const paper: CbtPaperQuestion[] = built.paper.map((q: { globalIndex: number; subject: string; questionId: string; text: string; options: { label: string; text: string }[] }) => ({
    ...q,
    options: q.options.map((o) => ({ label: o.label, text: o.text })),
  }));
  return { totalQuestions: built.totalQuestions, totalTimeMin: setup.totalTimeMin, paper };
}

export interface CbtQuestionResult {
  globalIndex: number;
  subject: string;
  studentAnswer: string | null;
  correctOption: string;
  isCorrect: boolean;
  explanation?: string | null;
}

export function submitCbtAnswer(globalIndex: number, selectedOption: string, timeSpentMs: number): void {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.cbt.submitAnswer(globalIndex, selectedOption, timeSpentMs);
}

export function toggleCbtFlag(globalIndex: number): boolean {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  return kairo.cbt.toggleFlag(globalIndex).flagged;
}

/** Ends the exam, computes real results, and queues the attempt as a real kairo.sessions row (mode 'cbt_exam') — handled internally by CBTExamMode.finish(). */
export async function finishCbtExam(): Promise<Engine> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const results = kairo.cbt.finish();
  await kairo.sync.sync();
  return results;
}

export interface CbtHistoryEntry {
  id: string;
  subjects: string[];
  totalQuestions: number;
  score: number;
  maxScore: number;
  percentage: number;
  bySubject: { subject: string; correct: number; total: number; percentage: number }[];
  timeAnalysis: { totalTimeMin: number; avgTimePerQuestionSec: number } | null;
  startedAt: number;
  completedAt: number;
}

/** Real past CBT exam history from kairo.cbt_results — a table that had real RLS policies from the schema's creation but nothing ever wrote to or read from it until now. */
export async function getCbtHistory(limit = 20): Promise<CbtHistoryEntry[]> {
  const kairo = getEngine();
  if (!kairo || !kairo.sync.adapter) return [];
  const rows = await kairo.sync.adapter.fetchCbtResults(kairo.profile.studentId, { limit });
  return rows.map((row: Engine) => ({
    id: row.id,
    subjects: row.subjects || [],
    totalQuestions: row.total_questions,
    score: row.score,
    maxScore: row.max_score,
    percentage: row.percentage,
    bySubject: row.by_subject || [],
    timeAnalysis: row.time_analysis,
    startedAt: new Date(row.started_at).getTime(),
    completedAt: new Date(row.completed_at).getTime(),
  }));
}

// ─────────────────────────────────────────────
// Onboarding & Diagnostic — the real engine.onboarding step machine
// (OnboardingEngine.js: startOnboarding/submitOnboardingStep/
// completeOnboarding). Its step list also includes 'welcome' and 'name' —
// this app already has its own screens for both (Welcome.tsx, the name
// field on the sign-up form), so beginOnboarding() walks past those two
// with data already collected instead of asking the student twice. The
// engine's 'diagnostic' step is just a placeholder ({count:5}) — it has no
// question bank of its own, so getDiagnosticQuestions() sources real
// questions the same way every other real session does (getAllConcepts +
// getQuestionForConcept), not a separate quiz bank.
// ─────────────────────────────────────────────

/** Starts the real onboarding step machine and walks past 'welcome'/'name', landing on 'goal'. */
export function beginOnboarding(name: string): void {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.startOnboarding(); // -> 'welcome'
  kairo.submitOnboardingStep(null); // -> 'name'
  kairo.submitOnboardingStep(name); // -> 'goal'
}

export interface OnboardingKaiStep { title?: string; body?: string }

/** Submits goal/exam date/subjects through the real step machine, landing on 'diagnostic_intro' — returns its real Kai copy instead of hardcoded UI text. */
export function submitOnboardingProfile(course: string, examDateISO: string, subjects: string[]): OnboardingKaiStep {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.submitOnboardingStep(course); // -> 'exam_date'
  kairo.submitOnboardingStep(examDateISO); // -> 'subjects'
  const introStep = kairo.submitOnboardingStep(subjects); // -> 'diagnostic_intro'

  // Save real progress to the account immediately, rather than waiting for
  // the whole flow (including the diagnostic) to finish — previously name/
  // course/exam date/subjects were only ever written to profile inside
  // buildInitialPlan(), so a student who created a real account but closed
  // the app before finishing the diagnostic lost everything they'd already
  // entered and had to start over. Fire-and-forget (never blocks the
  // "Continue" button on a network round trip) — profile.diagnosticCompleted
  // stays false until buildInitialPlan() genuinely runs, so this alone
  // can't let a student skip the diagnostic (see isOnboarded() above).
  kairo.profile.name = kairo.onboarding.data.name || kairo.profile.name;
  kairo.profile.targetCourse = course;
  kairo.profile.examDate = examDateISO ? new Date(examDateISO).getTime() : null;
  kairo.profile.targetSubjects = subjects;
  kairo.store.saveProfile(kairo.profile).catch(() => {});
  kairo.sync.sync().catch(() => {});

  return { title: introStep?.title, body: introStep?.body };
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIAGNOSTIC_ANCHOR_SUBJECT = 'Use of English';

/**
 * A strict, JAMB-shaped 5-question diagnostic: English opens and closes it
 * (from two distinct topics where the content allows), with one question
 * from each of up to three elective subjects filling the middle — [English,
 * elective 1, elective 2, elective 3, English]. Previously this pooled every
 * concept across every selected subject and shuffled the whole thing flat,
 * so the same subject could appear 3+ times in a row and English could be
 * entirely absent from a 5-question "read + math" check-in.
 *
 * Every question is sourced the same way as real Practice questions
 * (getQuestionForConcept) — a slot with nothing real to offer is simply
 * skipped and backfilled from the remaining pool, never a placeholder.
 */
export async function getDiagnosticQuestions(subjects: string[], count = 5): Promise<Engine[]> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const normalized = subjects.map(normalizeSubjectName);
  await ensureContentLoaded(normalized);
  const seeded = normalized.filter((s) => SEEDED_SUBJECTS.includes(s));
  const pool = seeded.length ? seeded : SEEDED_SUBJECTS;

  const seenIds: string[] = [];
  function pickFrom(concepts: Engine[]): Engine | null {
    for (const concept of concepts) {
      const q = kairo.getQuestionForConcept(concept.id, { excludeIds: seenIds });
      if (q) return q;
    }
    return null;
  }

  const englishConcepts: Engine[] = shuffled(kairo.getAllConcepts({ subject: DIAGNOSTIC_ANCHOR_SUBJECT }));
  const electives = pool.filter((s) => s !== DIAGNOSTIC_ANCHOR_SUBJECT).slice(0, 3);

  const queue: Engine[] = [];

  const first = pickFrom(englishConcepts);
  if (first) { queue.push(first); seenIds.push(first.id); }

  for (const subject of electives) {
    const q = pickFrom(shuffled(kairo.getAllConcepts({ subject })));
    if (q) { queue.push(q); seenIds.push(q.id); }
  }

  const firstTopic = first ? englishConcepts.find((c) => c.id === first.conceptId)?.topic : null;
  const secondEnglishPool = firstTopic ? englishConcepts.filter((c) => c.topic !== firstTopic) : englishConcepts;
  const second = pickFrom(secondEnglishPool.length ? secondEnglishPool : englishConcepts);
  if (second) { queue.push(second); seenIds.push(second.id); }

  // Sparse content in any slot above — backfill from the full pool rather
  // than shipping fewer than `count` real questions.
  if (queue.length < count) {
    for (const subject of pool) {
      if (queue.length >= count) break;
      const q = pickFrom(shuffled(kairo.getAllConcepts({ subject })));
      if (q) { queue.push(q); seenIds.push(q.id); }
    }
  }

  return queue.slice(0, count);
}

export interface DiagnosticAnswer {
  conceptId: string | null;
  correct: boolean;
  responseTimeMs: number;
  selectedOption?: string;
  correctOption: string;
  questionId: string;
}

export interface OnboardingCompleteResult {
  seededConcepts: number;
  diagnosticSummary: { total: number; correct: number; accuracy: number; message: string };
  profile: Engine;
}

export interface DiagnosticSubmitResult {
  explanation: PracticeExplanation | null;
  kaiNote: string | null;
}

/**
 * Records a real diagnostic attempt the moment it's answered — the same
 * submitAnswer() call Practice makes live, so the same rich per-distractor
 * explanation/misconception breakdown Practice renders (PracticeQuestion's
 * "Why each option is wrong" section) is available during the diagnostic
 * too. Previously the diagnostic only ever called submitAnswer() in bulk,
 * after the whole quiz finished (see OnboardingEngine.buildInitialPlan()),
 * so DiagnosticQuiz had no real explanation data to show per question and
 * fell back to the question's own placeholder-ish `why` text instead.
 */
export function submitDiagnosticAnswer(q: EngineFlatQuestion, selectedIndex: number | null, correct: boolean, responseTimeMs: number): DiagnosticSubmitResult {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const { kaiResponse, explanation } = kairo.submitAnswer({
    conceptId: q.conceptId ?? null,
    correct,
    responseTimeMs,
    selectedOption: selectedOptionLabel(q, selectedIndex),
    correctOption: q.correctOption,
    questionId: q.id,
    questionDifficulty: q.difficulty,
  });
  return { explanation: explanation ?? null, kaiNote: kaiResponse?.text ?? null };
}

/**
 * Submits the diagnostic results, walks the remaining steps to 'complete',
 * then builds the student's real initial plan — seeds the local content
 * catalog, feeds the diagnostic answers into the knowledge graph, sets
 * profile fields (name/targetCourse/examDate/targetSubjects), and generates
 * the first real adaptive session. Persists immediately, same as
 * AccountReady's old onStart used to for these same profile fields.
 *
 * The engine's own step machine is still sitting on 'diagnostic_intro' at
 * this point — DiagnosticIntro.tsx/DiagnosticQuiz.tsx render the quiz
 * without ever calling submitOnboardingStep() themselves, so a `null` has
 * to advance past 'diagnostic_intro' first before `results` can land on
 * the actual 'diagnostic' step. This used to submit `results` one step too
 * early (landing on 'diagnostic_intro', which has no field and isn't
 * 'diagnostic', so the real answers were silently discarded and
 * this.data.diagnosticResults stayed at its default `[]`) — the exact
 * cause of DiagnosticResults always showing "0/0" and "0%" regardless of
 * how the student actually did. It also meant the step machine never
 * reached 'complete' (stopped one step short at 'first_session'), so
 * OnboardingEngine.isComplete() could never return true either.
 */
export async function completeOnboardingFlow(results: DiagnosticAnswer[]): Promise<OnboardingCompleteResult> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.submitOnboardingStep(null); // -> 'diagnostic'
  kairo.submitOnboardingStep(results); // -> 'results'
  kairo.submitOnboardingStep(null); // -> 'first_session'
  kairo.submitOnboardingStep(null); // -> complete
  const { seededConcepts, diagnosticSummary, profile } = await kairo.completeOnboarding();
  await kairo.sync.sync();
  return { seededConcepts, diagnosticSummary, profile };
}

// ─────────────────────────────────────────────
// Learn — the real engine.learn (LearnModule), reached from Practice's
// "Understand this before moving on" after a wrong answer (Learn Module
// spec §3.2, the primary entry point). Every field the Learn screen shows
// comes straight from the lesson the engine builds (real misconceptions,
// real explanation content, real mastery check) — nothing here is
// authored client-side.
// ─────────────────────────────────────────────

export interface LearnAnswerContext {
  questionId: string;
  conceptId: string;
  selectedOption?: string;
  errorTag: string | null;
  responseTimeMs?: number;
}

/** Direct mirror of LearnModule._buildLesson()'s real output shape (Learn Module spec §5/§6) — every field here is generated by the engine, none of it authored client-side. */
export interface LearnLesson {
  conceptId: string;
  conceptName: string;
  subject: string;
  topic: string;
  subtopic: string;
  entryPoint: string;
  framing: { tone?: string; message?: string };
  compressed: boolean;
  contentSparse: boolean;
  priorAttempts: number;
  repeatedGap: boolean;
  topicContext: { strongElsewhereInTopic: boolean; text: string } | null;
  alreadyMastered: boolean;
  steps: {
    question: { id: string; stem: string; selectedOption: string | null; correctOption: string } | null;
    explanation: { correctReasoning: string | null; distractorBreakdown: string | null } | null;
    coreConcept: { learningObjective: string; conceptSummary: string | null } | null;
    teachingHook: { hook: string; analogy: string } | null;
    simpleBreakdown: { text: string | null; sparse: boolean } | null;
    commonMisconceptions: { id: string; name: string; description: string; category?: string; ownMistake: boolean }[];
    examInsight: string | null;
    keyIdea: string | null;
    reinforcementQuestions: { id: string; stem: string }[];
    relatedQuestions: { id: string; stem: string }[];
  };
  masteryCheck: { holding: boolean; text: string; cappedToHeld: boolean } | null;
  kaiOpening: { text: string; tone: string };
}

export interface LearnCompletion {
  conceptId: string;
  returnTo: string;
  masteryHolding: boolean | null;
  kaiClosing: { text: string; tone: string };
}

/** Builds a real Learn lesson from a just-missed question. */
export function startLearnFromIncorrectAnswer(ctx: LearnAnswerContext): LearnLesson {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  return kairo.learn.fromIncorrectAnswer(ctx);
}

/** Resumes an in-progress lesson (e.g. after a page reload) — null if there's nothing to resume. */
export function resumeLearnLesson(conceptId: string): LearnLesson | null {
  const kairo = getEngine();
  return kairo ? kairo.learn.resumeLesson(conceptId) : null;
}

/** The lesson's mini reinforcement check — real classification/decay-model side effects, same as any other real attempt. */
export function submitLearnReinforcement(conceptId: string, correct: boolean, responseTimeMs: number, questionId?: string): { masteryCheck: { holding: boolean; text: string; cappedToHeld: boolean } } {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  return kairo.learn.submitReinforcementAttempt({ conceptId, correct, responseTimeMs, questionId });
}

/** Full flattened question (options/correctOption included) for one of the lesson's reinforcementQuestions, which only carry {id, stem} — mirrors _flattenQuestion's own shape, same private-method precedent as _snapshotSjeeState (no separate public "get question by id" exists). */
export function getLearnQuestion(questionId: string): Engine | null {
  const kairo = getEngine();
  if (!kairo) return null;
  const q = kairo.questionGraph.getQuestion(questionId);
  return q ? kairo._flattenQuestion(q) : null;
}

/** Closes the lesson and persists it (Learn's own state — activeLessons/completedLessons — isn't captured by the normal session-end save path, same as consent). */
export async function completeLearnLesson(conceptId: string, returnTo = 'practice'): Promise<LearnCompletion> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const result = kairo.learn.completeLesson({ conceptId, returnTo });
  kairo._snapshotSjeeState();
  await kairo.store.saveProfile(kairo.profile);
  await kairo.sync.sync();
  return result;
}

/**
 * Direct mirror of LearnModule.getLearnHome()'s real output (Learn Module
 * spec §4) — previously had no screen at all, so Learn was reachable only
 * reactively, right after a wrong answer (fromIncorrectAnswer), never as
 * somewhere a student could go on their own initiative.
 */
export interface LearnHomeData {
  kaiFraming: { text: string; tone: string };
  continueLearning: { conceptId: string; conceptName: string; entryPoint: string } | null;
  recommendedConcepts: { id: string; name: string; reason: string }[];
  weakTopics: { subject: string; topic: string; count: number }[];
  recentlyLearned: { conceptId: string; conceptName: string; holding: boolean | null; completedAt: number }[];
  masteredConcepts: { id: string; name: string }[];
  suggestedNextLessons: { id: string; name: string }[];
  coldStart: boolean;
}

export function getLearnHome(): LearnHomeData | null {
  const kairo = getEngine();
  return kairo ? kairo.learn.getLearnHome() : null;
}

/** Learn Module spec §3.5 — the DDE proactively routing a Critical/Repeated gap before more practice would help. Used for Learn Home's higher-priority "Recommended" list. */
export function startLearnFromWeakTopic(conceptId: string, gapSeverity = 'critical'): LearnLesson {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  return kairo.learn.fromWeakTopicRecommendation({ conceptId, gapSeverity });
}

/** Learn Module spec §3.6 — minor, secondary route, for Learn Home's quieter "Suggested Next Lessons" list. */
export function startLearnFromDashboard(conceptId: string): LearnLesson {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  return kairo.learn.fromDashboard({ conceptId });
}

// ─────────────────────────────────────────────
// Rapid Fire — timed burst practice via the real kairo.rapidFire
// (RapidFireEngine). It only ever pulls concepts the student has already
// built real history against (Held/Fading/Reinforced) — a speed/recall
// drill, not a first-exposure mode — so an empty pool here is an honest
// "not enough history yet", not a bug to work around.
// ─────────────────────────────────────────────

export interface RapidFireOptions {
  subjects?: string[];
  questionCount?: number;
  timePerQuestionSec?: number;
}

/** A question paired with the concept id it was actually queued for — a question can test more than one concept, and only _flattenQuestion's primary one survives onto the question object itself, so grading uses this pairing rather than trusting the question's own (possibly different) conceptId field. */
export interface RapidFireQueuedQuestion {
  conceptId: string;
  question: Engine;
}

export interface RapidFireStartResult {
  totalQuestions: number;
  timePerQuestionSec: number;
  questions: RapidFireQueuedQuestion[];
}

export async function startRapidFireSession(options: RapidFireOptions = {}): Promise<RapidFireStartResult> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const subjects = (options.subjects?.length ? options.subjects : kairo.profile.targetSubjects || []).map(normalizeSubjectName);
  await ensureContentLoaded(subjects);

  const started = kairo.startRapidFire({ ...options, subjects: options.subjects?.length ? subjects : [] });
  const queue: string[] = kairo.rapidFire.queue || [];
  const questions: RapidFireQueuedQuestion[] = [];
  const seenIds: string[] = [];
  for (const conceptId of queue) {
    const q = kairo.getQuestionForConcept(conceptId, { excludeIds: seenIds });
    if (q) {
      questions.push({ conceptId, question: q });
      seenIds.push(q.id);
    }
  }
  return { totalQuestions: questions.length, timePerQuestionSec: started.timePerQuestion, questions };
}

export interface RapidFireAnswerContext {
  conceptId: string;
  correct: boolean;
  responseTimeMs: number;
  selectedOption?: string;
  correctOption: string;
  questionId: string;
}

export interface RapidFireAnswerResult {
  correct: boolean;
  streak: number;
  bestStreak: number;
  finished: boolean;
}

export function submitRapidFireAnswer(ctx: RapidFireAnswerContext): RapidFireAnswerResult {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  return kairo.submitRapidFireAnswer(ctx);
}

export interface RapidFireResults {
  totalQuestions: number;
  correct: number;
  accuracy: number;
  avgTimeMs: number;
  bestStreak: number;
  durationSec: number;
}

export async function finishRapidFire(): Promise<RapidFireResults> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const results = kairo.finishRapidFire();
  await kairo.sync.sync();
  return results;
}

// ─────────────────────────────────────────────
// Notification consent (Notifications & Communication Systems §10) —
// this frontend never invents its own consent model; every read/write
// here goes straight through the engine's own ConsentManager
// (kairo.comms.consent), the single entry point the notification
// backend's own send checks (canSend()) already gate on.
// ─────────────────────────────────────────────

export type ConsentChannel = 'push' | 'in_app_badge' | 'whatsapp' | 'email' | 'sms';
export type ConsentCategory =
  | 'academic_nudge'
  | 'motivational_consistency'
  | 'milestone_celebration'
  | 'community_social'
  | 'reengagement_winback'
  | 'exam_critical'
  | 'account_administrative'
  | 'editorial_broadcast';

/** The six product categories a channel opts into by default once granted (§10.2) — Editorial & Broadcast is deliberately excluded (§10.5, tracked as its own separate consent) and Account & Administrative sits outside consent entirely (§3.5). */
export const CONSENT_PRODUCT_CATEGORIES: ConsentCategory[] = [
  'academic_nudge',
  'motivational_consistency',
  'milestone_celebration',
  'community_social',
  'reengagement_winback',
  'exam_critical',
];

export interface ConsentSummary {
  channelPermissions: Record<ConsentChannel, boolean>;
  categoryPreferences: Partial<Record<ConsentChannel, Partial<Record<ConsentCategory, boolean>>>>;
  hardStopActive: boolean;
  editorialConsent: boolean;
  leaderboardOptIn: boolean;
}

/**
 * Mirrors the exact snapshot+save+sync sequence KairoEngine's own
 * endSession()/connectSupabase() already use internally (index.js) —
 * there's no separate public "save now" method, so a consent change
 * (which must persist immediately, not wait for a practice session to
 * end) goes through the same private sequence directly.
 */
async function persistConsent(kairo: Engine): Promise<void> {
  kairo._snapshotSjeeState();
  await kairo.store.saveProfile(kairo.profile);
  await kairo.sync.sync();
}

/** Current consent state for the signed-in student, or null if no one's signed in. */
export function getConsentSummary(): ConsentSummary | null {
  const kairo = getEngine();
  if (!kairo) return null;
  const consent = kairo.comms.consent;
  return {
    channelPermissions: { ...consent.channelPermissions },
    categoryPreferences: JSON.parse(JSON.stringify(consent.categoryPreferences || {})),
    hardStopActive: !!consent.hardStopActive,
    editorialConsent: !!consent.editorialConsent,
    leaderboardOptIn: !!consent.leaderboardOptIn,
  };
}

/**
 * Grants a channel and defaults every product category on to true
 * (§10.2: "Default is opt-in once a channel is granted... a student
 * adjusts downward, never upward"). Editorial & Broadcast is never
 * defaulted here — it stays its own explicit ask (§10.5).
 */
export async function grantChannelConsent(channel: ConsentChannel): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.comms.consent.grantChannelPermission(channel);
  for (const category of CONSENT_PRODUCT_CATEGORIES) {
    kairo.comms.consent.setCategoryPreference(channel, category, true);
  }
  await persistConsent(kairo);
}

export async function revokeChannelConsent(channel: ConsentChannel): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.comms.consent.revokeChannelPermission(channel);
  await persistConsent(kairo);
}

export async function setCategoryConsent(channel: ConsentChannel, category: ConsentCategory, allowed: boolean): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.comms.consent.setCategoryPreference(channel, category, allowed);
  await persistConsent(kairo);
}

/** §10.5 — tracked independently from the six product categories above. */
export async function setEditorialConsent(allowed: boolean): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.comms.consent.setEditorialConsent(allowed);
  await persistConsent(kairo);
}

/** §10.2 tier 3 — overrides every channel/category preference except Account & Administrative (§3.5), which sits outside consent entirely. */
export async function setHardStopConsent(active: boolean): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.comms.consent.setHardStop(active);
  await persistConsent(kairo);
}

/** Profile & Settings §8.2 — turning this off removes the student from every leaderboard surface immediately: kairo.get_segment_leaderboard/get_university_rankings (see SupabaseSyncAdapter's schema) both re-check this same flag server-side, not just the client UI. */
export async function setLeaderboardOptIn(allowed: boolean): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  kairo.comms.consent.setLeaderboardOptIn(allowed);
  await persistConsent(kairo);
}

// ─────────────────────────────────────────────
// Opt-in leaderboards (Profile & Settings §8.2, Learning Engine Phase 2
// §8.4) — SegmentedLeaderboard/UniversityLeaderboard's in-engine Maps are
// populated only from the current runtime's own endSession() calls, so
// they can never hold real other-student data across sessions/devices.
// The real cross-student view lives in two SECURITY DEFINER Postgres
// functions instead (kairo.get_segment_leaderboard, kairo.get_university_
// rankings) that only ever run for, and only ever return, students who
// have opted in — mirroring the direct-Supabase-read pattern Challenges
// already established for its own leaderboard (challengesApi.ts).
// ─────────────────────────────────────────────

export interface SegmentLeaderboardRow {
  rank: number;
  studentId: string;
  name: string;
  score: number;
  isCurrentUser: boolean;
}

export interface UniversityRankingRow {
  rank: number;
  university: string;
  avgScore: number;
  studentCount: number;
}

/** Real ~20-student segment leaderboard (same course + Kairo Score tier) — empty if the student hasn't opted in themselves (Section 8.2's server-side gate, not just a client check). */
export async function getSegmentLeaderboard(limit = 20): Promise<SegmentLeaderboardRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('get_segment_leaderboard', { p_limit: limit });
  if (error) throw error;
  return (data || []).map((row: { rank: number; student_id: string; name: string; score: number; is_current_user: boolean }) => ({
    rank: row.rank,
    studentId: row.student_id,
    name: row.name,
    score: Number(row.score),
    isCurrentUser: row.is_current_user,
  }));
}

/** Real per-university average score rankings, aggregate-only (no individual student identity) — same server-side opt-in gate as the segment leaderboard. */
export async function getUniversityRankings(limit = 20): Promise<UniversityRankingRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').rpc('get_university_rankings', { p_limit: limit });
  if (error) throw error;
  return (data || []).map((row: { rank: number; university: string; avg_score: number; student_count: number }) => ({
    rank: row.rank,
    university: row.university,
    avgScore: Number(row.avg_score),
    studentCount: row.student_count,
  }));
}

// ─────────────────────────────────────────────
// Question reports (kairo.question_reports) — Practice's overflow menu
// "Report question" and "Question feedback" were previously UI-only
// stubs (a toast, no write). This gives them a real, append-only
// destination a content team can review.
// ─────────────────────────────────────────────

/** Persists a "Report question" or "Question feedback" tap from Practice against the real question the student was looking at. Throws if there's no signed-in student — callers should already be inside an active session. */
export async function reportQuestion(questionId: string, kind: 'report' | 'feedback'): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const supabase = getSupabase();
  const { error } = await supabase.schema('kairo').from('question_reports').insert({
    student_id: kairo.profile.studentId,
    question_id: questionId,
    kind,
  });
  if (error) throw error;
}

// ─────────────────────────────────────────────
// Bookmarks (kairo.bookmarks) — PracticeQuestion's bookmark toggle was a
// local useState with no write path (reset to false on every reload),
// LearnModule.fromBookmark() (§3.9) has been a real entry point this
// whole time with no real bookmark data to route from, and Review Home's
// Bookmarks section (Review Module §4.3 item 6) had nothing to read.
// Loaded once per session into an in-memory cache, same pattern as
// contentLoadedFor — a bookmark toggle needs a synchronous read, not a
// network round trip per question shown.
// ─────────────────────────────────────────────

let bookmarkedQuestionIds: Set<string> | null = null;

async function ensureBookmarksLoaded(): Promise<Set<string>> {
  if (bookmarkedQuestionIds) return bookmarkedQuestionIds;
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('bookmarks')
    .select('question_id')
    .eq('student_id', kairo.profile.studentId);
  if (error) throw error;
  bookmarkedQuestionIds = new Set((data || []).map((row: { question_id: string }) => row.question_id));
  return bookmarkedQuestionIds;
}

/** Whether a question is bookmarked — false (not "unknown") until ensureBookmarksLoaded() has resolved at least once this session, since a practice question's initial render can't wait on a network round trip. */
export function isQuestionBookmarked(questionId: string): boolean {
  return bookmarkedQuestionIds?.has(questionId) ?? false;
}

/** Loads the student's real bookmark set — call once when Practice starts, before rendering the first question's bookmark state. */
export async function loadBookmarks(): Promise<void> {
  await ensureBookmarksLoaded();
}

/** Toggles a bookmark for real and returns the new state — PracticeQuestion's bookmark icon previously just flipped local state with nothing persisted. */
export async function toggleBookmark(questionId: string): Promise<boolean> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const supabase = getSupabase();
  const ids = await ensureBookmarksLoaded();
  const studentId = kairo.profile.studentId;

  if (ids.has(questionId)) {
    const { error } = await supabase.schema('kairo').from('bookmarks')
      .delete().eq('student_id', studentId).eq('question_id', questionId);
    if (error) throw error;
    ids.delete(questionId);
    return false;
  }
  const { error } = await supabase.schema('kairo').from('bookmarks')
    .insert({ student_id: studentId, question_id: questionId });
  if (error) throw error;
  ids.add(questionId);
  return true;
}

export interface BookmarkedQuestion {
  id: string;
  stem: string;
  subject: string;
  topic: string;
  conceptId: string | null;
}

/** Real bookmarked questions for Review Home's Bookmarks section (Review Module §4.3 item 6) — queried directly against kairo.questions rather than requiring that subject's content already be loaded into the local graph. */
export async function getBookmarkedQuestions(limit = 20): Promise<BookmarkedQuestion[]> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const ids = await ensureBookmarksLoaded();
  if (ids.size === 0) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('questions')
    .select('id, stem, subject, topic, concepts_tested')
    .in('id', Array.from(ids))
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row: { id: string; stem: string; subject: string; topic: string; concepts_tested: { conceptId: string; weight: number | string }[] }) => ({
    id: row.id,
    stem: row.stem,
    subject: row.subject,
    topic: row.topic,
    conceptId: row.concepts_tested?.find((c) => c.weight === 'primary' || (typeof c.weight === 'number' && c.weight >= 1))?.conceptId ?? row.concepts_tested?.[0]?.conceptId ?? null,
  }));
}

/** Removes a bookmark from Review Home's Bookmarks list directly — unlike toggleBookmark(), never re-adds it, since a list item is by definition already bookmarked. */
export async function removeBookmark(questionId: string): Promise<void> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const supabase = getSupabase();
  const ids = await ensureBookmarksLoaded();
  const { error } = await supabase.schema('kairo').from('bookmarks')
    .delete().eq('student_id', kairo.profile.studentId).eq('question_id', questionId);
  if (error) throw error;
  ids.delete(questionId);
}

// ─────────────────────────────────────────────
// Session History (kairo.sessions) — Review Home's Session History section
// (Review Module §4.3 item 7). kairo.sessions' own mode CHECK constraint
// (standard|rapid_fire|custom_practice|topic_practice|cbt_exam|recovery)
// has no 'review' or 'learn' value — Review sessions and Learn lessons are
// deliberately not their own session-type rows (Learn tracks its own
// completedLessons/activeLessons state instead); this reads the real
// Practice/CBT/Recovery history the spec names, not a new session type.
// ─────────────────────────────────────────────

export interface SessionHistoryEntry {
  id: string;
  mode: string;
  modeLabel: string;
  questionsAnswered: number;
  correctCount: number;
  startedAt: number;
  completedAt: number | null;
}

const SESSION_MODE_LABELS: Record<string, string> = {
  standard: 'Practice',
  rapid_fire: 'Rapid Fire',
  custom_practice: 'Custom Practice',
  topic_practice: 'Topic Practice',
  cbt_exam: 'CBT Exam',
  recovery: 'Recovery Session',
};

/** Real past sessions, most recent first — Review Home's Session History section. */
export async function getSessionHistory(limit = 20): Promise<SessionHistoryEntry[]> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const supabase = getSupabase();
  const { data, error } = await supabase.schema('kairo').from('sessions')
    .select('id, mode, questions_answered, correct_count, started_at, completed_at')
    .eq('student_id', kairo.profile.studentId)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row: { id: string; mode: string; questions_answered: number | null; correct_count: number | null; started_at: string | null; completed_at: string | null }) => ({
    id: row.id,
    mode: row.mode,
    modeLabel: SESSION_MODE_LABELS[row.mode] || row.mode,
    questionsAnswered: row.questions_answered ?? 0,
    correctCount: row.correct_count ?? 0,
    startedAt: row.started_at ? new Date(row.started_at).getTime() : 0,
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
  }));
}
