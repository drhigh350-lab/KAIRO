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
