import { KairoEngine, SupabaseSyncAdapter } from 'kairo-learning-engine';
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

export interface SignUpArgs {
  name: string;
  email: string;
  password: string;
}

/** Creates a new Supabase Auth account, then connects a fresh KairoEngine to it. */
export async function signUpAndConnect({ name, email, password }: SignUpArgs): Promise<Engine> {
  const supabase = getSupabase();
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
    engine = null;
    return false;
  }
}

/** Signs the current student out of Supabase and drops the in-memory engine, so the app returns to a guest state. */
export async function signOutAndDisconnect(): Promise<void> {
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

/** Real profile + stats for the Profile screen. null when nothing is signed in yet. */
export function getProfileSummary(): Engine | null {
  const kairo = getEngine();
  return kairo ? kairo.settings.getProfile() : null;
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

export async function startCbtExam(subjects: string[] = CBT_DEFAULT_SUBJECTS): Promise<{ totalQuestions: number; totalTimeMin: number; paper: CbtPaperQuestion[] }> {
  const kairo = getEngine();
  if (!kairo) throw new Error('No active engine — sign in first.');
  await ensureContentLoaded(subjects);
  kairo.cbt.setup({ subjects });
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
  return { totalQuestions: built.totalQuestions, totalTimeMin: subjects.length * 26, paper };
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
