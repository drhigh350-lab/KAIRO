import { clearQueryCache } from './queryCache';
import { KairoEngine, SupabaseSyncAdapter, CBTExamMode, getPrestigeTier } from 'kairo-learning-engine';
import { getSupabase } from './supabaseClient';
import { selectedOptionLabel, type EngineFlatQuestion } from './engineAdapter';
import type { PracticeExplanation } from '../features/practice/PracticeQuestion';
import type { SessionRewards } from '../features/practice/PracticeSummary';
import { getSeededCourseSubjects } from './subjectScope';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Engine = any;

let engine: Engine | null = null;
const LAST_STUDENT_ID_KEY = 'kairo:last_student_id';

/** Prevent a stalled network/IndexedDB promise from trapping a student in a loading state forever. */
export class KairoTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KairoTimeoutError';
  }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new KairoTimeoutError(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function isTransientRestoreError(err: unknown): boolean {
  if (err instanceof KairoTimeoutError) return true;
  if (!err || typeof err !== 'object') return false;

  const obj = err as Record<string, unknown>;
  const status = obj.status ?? obj.statusCode;
  if (status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }

  const message = describeError(err).toLowerCase();
  return message.includes('timeout')
    || message.includes('network')
    || message.includes('failed to fetch')
    || message.includes('fetch failed')
    || message.includes('load failed');
}

export function getEngine(): Engine | null {
  return engine;
}

/**
 * Background, best-effort pre-assembly of the next few days' recommendation
 * queues (real resolved questions, not just concept IDs) while online, so
 * "Start Session" for the recommendation still works if the student opens
 * the app later with no connectivity at all. Never awaited by a caller —
 * failures here are silent (there's simply nothing cached to fall back on,
 * same as before this existed) and never block or slow down whatever
 * actually triggered this (a sync, a page load).
 */
export async function triggerRecommendationPrefetch(): Promise<void> {
  const kairo = getEngine();
  if (!kairo) return;
  try {
    // Do not compete with the first dashboard paint on low-end devices or a
    // degraded mobile connection. One queue is enough to make the next tap
    // resilient; later visits can gradually refill the offline cache.
    await new Promise((resolve) => setTimeout(resolve, 750));
    await ensureContentLoaded(kairo.profile.targetSubjects || []);
    await kairo.prefetchRecommendationQueues({ queueCount: 1, questionsPerQueue: 10 });
  } catch {
    // Offline, not signed in yet, or nothing to prefetch — fine, this is
    // opportunistic by design.
  }
}

let onlineSyncArmed = false;
/**
 * Silently flush anything queued in SyncManager.pendingSync (now durably
 * backed by IndexedDB, see LocalStore's pending_sync_queue) the moment the
 * browser regains connectivity — without this, a session/attempt completed
 * while offline just sat there until the next action happened to call
 * kairo.sync.sync() itself. Also (re)builds the offline recommendation
 * queue cache on the same online transition — the other half of "when the
 * app detects an online state" is the normal-boot-while-already-online
 * case, covered separately by an explicit triggerRecommendationPrefetch()
 * call once the engine is actually signed in and ready (see App.tsx),
 * since at the moment this function itself runs (App's very first mount
 * effect) auth restoration is usually still in flight and getEngine()
 * would just be null. Idempotent: safe to call on every render/mount,
 * only ever registers the listener once per page load.
 */
export function setupOnlineSync(): void {
  if (onlineSyncArmed || typeof window === 'undefined') return;
  onlineSyncArmed = true;
  window.addEventListener('online', () => {
    getEngine()?.sync?.sync().catch(() => {});
    triggerRecommendationPrefetch();
  });
}

/** Pop the oldest cached offline recommendation queue, or null if nothing was ever prefetched (or it's already been used up). */
export async function popPrefetchedRecommendationQueue(): Promise<{ queueId: string; conceptIds: string[]; questions: Engine[] } | null> {
  const kairo = getEngine();
  if (!kairo) return null;
  return kairo.popPrefetchedQueue();
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

function createEngine(name: string, studentId = 'pending'): Engine {
  engine = new KairoEngine({
    studentId,
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

function rememberStudentId(kairo: Engine): void {
  const id = kairo?.profile?.studentId;
  if (id && typeof localStorage !== 'undefined') localStorage.setItem(LAST_STUDENT_ID_KEY, id);
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

/** Keep auth-provider metadata from replacing a student's real name with an email local-part. */
function validProfileName(value: unknown, email = ''): string {
  const name = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  if (!name || name.length < 2 || name.length > 120) return '';
  const localPart = email.split('@')[0]?.trim().toLowerCase();
  if (localPart && name.toLowerCase() === localPart) return '';
  // Reject common provider-generated forms such as "johnson wisdom 417" when
  // they are returned as the name instead of the full_name claim.
  if (/\s\d{2,}$/.test(name)) return '';
  return name;
}

/** Where Supabase's confirmation-link email sends the browser back to. */
function emailConfirmRedirect(): string {
  return `${window.location.origin}/onboarding`;
}

/**
 * Result of a sign-up attempt. With "Confirm email" active in Supabase,
 * `signUp()` creates the account and sends the confirmation link but
 * returns no session — there is nothing to connect the engine to yet, so
 * the caller gets `{ needsEmailVerification: true }` instead of a
 * ready-to-use Engine and must show a "check your inbox" state rather
 * than proceeding into onboarding.
 */
export type SignUpResult = Engine | { needsEmailVerification: true; email: string };

/** Creates a new Supabase Auth account, then connects a fresh KairoEngine to it — unless email confirmation is still pending. */
export async function signUpAndConnect({ name, email, password }: SignUpArgs): Promise<SignUpResult> {
  const supabase = getSupabase();
  await clearStaleSession(supabase);
  const kairo = createEngine(name);
  await kairo.init();
  const adapter = new SupabaseSyncAdapter(supabase, kairo.store);
  const cleanName = validProfileName(name, email);
  const { session } = await adapter.signUp(email, password, { name: cleanName, full_name: cleanName }, { emailRedirectTo: emailConfirmRedirect() });
  if (!session) {
    engine = null;
    return { needsEmailVerification: true, email };
  }
  await kairo.connectSupabase(supabase, { email, password });
  rememberStudentId(kairo);
  return kairo;
}

/** Re-sends the signup confirmation link — the "Resend Link" CTA on the Check Your Inbox screen. */
export async function resendSignUpConfirmation(email: string): Promise<void> {
  const supabase = getSupabase();
  // No local store needed — resend() never touches it, only auth.resend().
  const adapter = new SupabaseSyncAdapter(supabase, null);
  await adapter.resendSignUpConfirmation(email, { emailRedirectTo: emailConfirmRedirect() });
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
  rememberStudentId(kairo);
  await purgeDeletedEmptyDiagramCache(kairo);
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
  // A Supabase auth refresh is a network operation even when a valid session
  // is already present in browser storage. On mobile, `navigator.onLine` can
  // be false (or the refresh can simply hang) while the student's complete
  // profile/catalog is safely available in IndexedDB. Restore that local
  // session first so an offline reload can still reach Practice, Review, and
  // other cached surfaces instead of blocking on the splash screen.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return restoreLocalSession();
  }

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
  // Keep each attempt bounded so a degraded connection cannot monopolize
  // startup. Splash.tsx can show the public shell while this secure check
  // continues in the background, so this is a recovery window, not a reason
  // to keep the whole app visually blocked.
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await withTimeout((async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) return false;

        const kairo = createEngine('');
        await kairo.init();
        // No email/password — connectSupabase() reuses the session getSession() already restored.
        await kairo.connectSupabase(supabase, {});
        rememberStudentId(kairo);
        await purgeDeletedEmptyDiagramCache(kairo);
        // The profile is already hydrated at this point — a sync hiccup
        // right after a successful reconnect shouldn't undo it, so this
        // runs in the background rather than gating the restore's result.
        kairo.sync.sync().catch(() => {});
        return true;
      })(), 6_000, 'KAIRO could not restore the session in time.');
    } catch (err) {
      if (isAuthRejection(err)) {
        await clearStaleSession(supabase);
        engine = null;
        return false;
      }
      if (!isTransientRestoreError(err) || attempt === maxAttempts) {
        engine = null;
        return restoreLocalSession();
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  engine = null;
  return restoreLocalSession();
}

/** Restore a previously hydrated local account without contacting Supabase. */
async function restoreLocalSession(): Promise<boolean> {
  try {
    const rememberedId = typeof localStorage !== 'undefined' ? localStorage.getItem(LAST_STUDENT_ID_KEY) : null;
    if (rememberedId) {
      const localEngine = createEngine('', rememberedId);
      await localEngine.init();
      if (localEngine.profile.authUserId && localEngine.profile.diagnosticCompleted) return true;
      engine = null;
    }

    // Compatibility path for users who signed in before the remembered-ID
    // marker existed: inspect the local profile store and select the first
    // fully hydrated student profile, excluding content-pack metadata.
    const probe = createEngine('');
    await probe.init();
    const profiles = await probe.store.getAll('profile');
    const saved = profiles.find((profile: Engine) => profile?.studentId !== 'content_pack_meta' && profile?.authUserId && profile?.diagnosticCompleted);
    if (!saved?.studentId) {
      engine = null;
      return false;
    }
    const localEngine = createEngine('', saved.studentId);
    await localEngine.init();
    if (!localEngine.profile.authUserId || !localEngine.profile.diagnosticCompleted) {
      engine = null;
      return false;
    }
    if (typeof localStorage !== 'undefined') localStorage.setItem(LAST_STUDENT_ID_KEY, saved.studentId);
    return true;
  } catch {
    engine = null;
    return false;
  }
}

/** True when a sign-in attempt failed because the account exists but hasn't clicked its confirmation link yet — Supabase's stable error_code, not message-sniffing first. */
export function isEmailNotConfirmed(err: unknown): boolean {
  if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'email_not_confirmed') return true;
  return /email not confirmed|confirm.*email/i.test(describeError(err));
}

function isAuthRejection(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const obj = err as Record<string, unknown>;
  const status = obj.status ?? obj.statusCode;
  if (status === 401 || status === 403) return true;
  const message = describeError(err).toLowerCase();
  return message.includes('jwt') || message.includes('does not exist') || message.includes('not authenticated') || (message.includes('invalid') && message.includes('token'));
}

/** Remove the 50 empty-image questions deleted from Supabase from this browser's offline mirror. */
async function purgeDeletedEmptyDiagramCache(kairo: Engine): Promise<void> {
  const deletedIds = new Set(Array.from({ length: 50 }, (_, index) => `use_of_english_${2125 + index}`));
  try {
    const cachedQuestions = await kairo.store.getAll('queue');
    await Promise.all(cachedQuestions
      .filter((question: Engine) => deletedIds.has(String(question.queueId || question.id || question.questionId)))
      .map((question: Engine) => kairo.store.delete('queue', question.queueId || question.id || question.questionId)));
    await kairo.clearPrefetchedQueues?.();
  } catch {
    // Cache cleanup is best-effort and must never block authentication.
  }
}

// ... rest of file unchanged ...
