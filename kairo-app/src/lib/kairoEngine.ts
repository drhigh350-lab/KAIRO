import { KairoEngine, SupabaseSyncAdapter, CBTExamMode } from 'kairo-learning-engine';
import { getSupabase } from './supabaseClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Engine = any;

let engine: Engine | null = null;

export function getEngine(): Engine | null {
  return engine;
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

  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;

  const kairo = createEngine('');
  await kairo.init();
  try {
    // No email/password — connectSupabase() reuses the session getSession() already restored.
    await kairo.connectSupabase(supabase, {});
    await kairo.sync.sync();
    return true;
  } catch {
    // The restored session didn't actually work (e.g. the account behind it
    // no longer exists) — clear it so it doesn't linger and collide with a
    // later sign-up/sign-in in the same browser.
    await clearStaleSession(supabase);
    engine = null;
    return false;
  }
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

// Only these four subjects have a seeded live question bank today (verified
// directly against kairo.questions) — a student can pick from 14 subjects at
// onboarding, but most have zero content yet. This is a content gap, not
// something to fabricate around.
const SEEDED_SUBJECTS = ['Biology', 'Chemistry', 'Physics', 'Use of English'];

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

/**
 * Starts a real adaptive session (mode 'standard' — the DB's mode check
 * constraint doesn't have a 'suggested' value) across whichever of the
 * student's subjects have real content, then resolves up to `limit` live
 * questions for the concepts the RecommendationEngine actually queued.
 */
export async function startSuggestedSession(limit = 5): Promise<SuggestedSessionResult> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  await ensureContentLoaded(kairo.profile.targetSubjects || []);

  const { queue, kaiMessage } = kairo.startSession({ mode: 'standard' });
  const questions: Engine[] = [];
  const seenIds: string[] = [];
  for (const conceptId of queue) {
    if (questions.length >= limit) break;
    const q = kairo.getQuestionForConcept(conceptId, { excludeIds: seenIds });
    if (q) {
      questions.push(q);
      seenIds.push(q.id);
    }
  }
  return { questions, kaiMessage };
}

export interface CustomSessionArgs {
  /** Real subject names (e.g. "Physics"), or [] for no subject filter ("All Subjects"). */
  subjects?: string[];
  includeFading?: boolean;
  limit?: number;
}

/**
 * Mixed Practice / Weak Areas, via the same real session lifecycle as
 * startSuggestedSession(). Only subjects with a real seeded question bank
 * are ever passed as a filter — an unseeded subject (e.g. "Mathematics",
 * "English Language") would otherwise silently return zero questions.
 */
export async function startCustomSession({ subjects = [], includeFading = true, limit = 10 }: CustomSessionArgs): Promise<SuggestedSessionResult> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  await ensureContentLoaded(subjects.length ? subjects : kairo.profile.targetSubjects || []);

  const seededSubjects = subjects.filter((s) => SEEDED_SUBJECTS.includes(s));
  const { queue } = kairo.startCustomPractice({ subjects: seededSubjects, includeFading, count: limit });
  const questions: Engine[] = [];
  const seenIds: string[] = [];
  for (const conceptId of queue) {
    if (questions.length >= limit) break;
    const q = kairo.getQuestionForConcept(conceptId, { excludeIds: seenIds });
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

export interface TopicInfo { topic: string; total: number; mastered: number; masteryPct: number }
export interface SubtopicInfo { subtopic: string; total: number; mastered: number; masteryPct: number }

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
    topic, total: t.total, mastered: t.mastered, masteryPct: t.masteryPct,
  }));
}

/** Real subtopics for a subject+topic, with mastery — replaces the old hardcoded 2-subtopic list. */
export async function getRealSubtopics(subjectLabel: string, topic: string): Promise<SubtopicInfo[]> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const subject = normalizeSubjectName(subjectLabel);
  await ensureContentLoaded([subject]);
  const { subtopics } = kairo.topicPractice.getTopicJourney(subject, topic);
  return subtopics.map((s: Engine) => ({ subtopic: s.name, total: s.total, mastered: s.mastered, masteryPct: s.masteryPct }));
}

/**
 * Starts a real topic-scoped session. subtopic is optional — omitting it
 * (the SubtopicSelect screen's "practise all of this topic" skip) pulls
 * from every subtopic under the topic instead of one.
 */
export async function startTopicPracticeSession(subjectLabel: string, topic: string, subtopic?: string, limit = 10): Promise<SuggestedSessionResult> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const subject = normalizeSubjectName(subjectLabel);
  await ensureContentLoaded([subject]);

  const concepts = subtopic
    ? kairo.getAllConcepts({ subject, topic, subtopic })
    : kairo.getAllConcepts({ subject, topic });
  const queue = concepts
    .slice()
    .sort((a: Engine, b: Engine) => (a.state === 'fading' ? -1 : 1) - (b.state === 'fading' ? -1 : 1))
    .slice(0, limit)
    .map((c: Engine) => c.id);

  kairo.startSession({ mode: 'topic_practice', plan: queue });

  const questions: Engine[] = [];
  const seenIds: string[] = [];
  for (const conceptId of queue) {
    if (questions.length >= limit) break;
    const q = kairo.getQuestionForConcept(conceptId, { excludeIds: seenIds });
    if (q) {
      questions.push(q);
      seenIds.push(q.id);
    }
  }
  return { questions };
}

export interface TodayProgress {
  questionsToday: number;
  studyMinutesToday: number;
  /** null when nothing's been answered today yet — there's no real accuracy to show. */
  accuracyPct: number | null;
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
 * profile.sessions only holds what this engine instance has completed
 * since connecting (a page reload has no way to pull historical
 * kairo.sessions rows back down yet), so a same-day session from before a
 * reload won't be reflected here — honestly partial, never fabricated.
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
  };
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
  await kairo.sync.sync();
}

/** Real strengths/weaknesses/score/streak for the Insights screen. Safe with zero data loaded. */
export function getInsightsSummary(): Engine | null {
  const kairo = getEngine();
  return kairo ? kairo.insights.getDashboardInsights() : null;
}

/** Real "sessions this week" + reinforced/fading counts for Insights' weekly card. */
export function getWeeklyReviewSummary(): Engine | null {
  const kairo = getEngine();
  return kairo ? kairo.getWeeklyReflection().data : null;
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

export async function startCbtExam(subjects: string[] = CBT_DEFAULT_SUBJECTS): Promise<{ totalQuestions: number; totalTimeMin: number; paper: CbtPaperQuestion[] }> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  await ensureContentLoaded(subjects);
  const setup = kairo.cbt.setup({ subjects });
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
  return { title: introStep?.title, body: introStep?.body };
}

/** A real 5-question diagnostic spread across the student's seeded subjects, sourced the same way as every other real practice question. */
export async function getDiagnosticQuestions(subjects: string[], count = 5): Promise<Engine[]> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  const normalized = subjects.map(normalizeSubjectName);
  await ensureContentLoaded(normalized);
  const seeded = normalized.filter((s) => SEEDED_SUBJECTS.includes(s));
  const pool = seeded.length ? seeded : SEEDED_SUBJECTS;

  const concepts: Engine[] = [];
  for (const subject of pool) {
    concepts.push(...kairo.getAllConcepts({ subject }));
  }
  for (let i = concepts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [concepts[i], concepts[j]] = [concepts[j], concepts[i]];
  }

  const questions: Engine[] = [];
  const seenIds: string[] = [];
  for (const concept of concepts) {
    if (questions.length >= count) break;
    const q = kairo.getQuestionForConcept(concept.id, { excludeIds: seenIds });
    if (q) {
      questions.push(q);
      seenIds.push(q.id);
    }
  }
  return questions;
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

/**
 * Submits the diagnostic results, walks the remaining message-only steps
 * ('results', 'first_session') to reach 'complete', then builds the
 * student's real initial plan — seeds the local content catalog, feeds the
 * diagnostic answers into the knowledge graph, sets profile fields
 * (name/targetCourse/examDate/targetSubjects), and generates the first
 * real adaptive session. Persists immediately, same as AccountReady's old
 * onStart used to for these same profile fields.
 */
export async function completeOnboardingFlow(results: DiagnosticAnswer[]): Promise<OnboardingCompleteResult> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
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
