// Study Planner persistence + orchestration — the seam between the pure
// plannerEngine.ts/plannerSrs.ts logic and Kairo's real storage. Same
// pattern as challengesApi.ts/kairoEngine.ts's bookmark functions: talks
// directly to Supabase (kairo.planner_state) for cross-device sync, and to
// the vendored engine's own LocalStore (kairo.store) for the offline-first
// IndexedDB mirror — the planner is a self-contained feature like
// Challenges/Bookmarks, not part of the vendored engine's concept graph.
import { getEngine } from '../kairoEngine';
import { getSupabase } from '../supabaseClient';
import { buildPlan, toLocalIso, type PlannerInput, type PlannerPlan } from './plannerEngine';
import { getSubjects } from './syllabus';
import {
  getNextDueTopic, recordTopicAttempt,
  type TopicProgressMap, type DueTopic,
} from './plannerSrs';

export type { DueTopic } from './plannerSrs';

export interface PlannerState {
  planInput: PlannerInput | null;
  completedTopicKeys: string[];
  topicProgress: TopicProgressMap;
  /** Batch 3's "persistent queue" rule applied to the Planner's own due-topic pick — held steady across other practice until the pinned topic itself is resolved (see isPinStillValid below), not just recomputed fresh every call. */
  pinnedDueTopic: (DueTopic & { pinnedOnIso: string }) | null;
  updatedAt: number;
}

const EMPTY_STATE: PlannerState = { planInput: null, completedTopicKeys: [], topicProgress: {}, pinnedDueTopic: null, updatedAt: 0 };

function currentStudentId(): string | null {
  const kairo = getEngine();
  const id = kairo?.profile?.studentId;
  return id && id !== 'pending' ? id : null;
}

interface StoredPlannerRow {
  planInput?: PlannerInput | null;
  completedTopicKeys?: string[];
  topicProgress?: TopicProgressMap;
  pinnedDueTopic?: (DueTopic & { pinnedOnIso: string }) | null;
  updatedAt?: number;
}

/**
 * Local-first read: the IndexedDB mirror loads instantly and works
 * offline; a best-effort Supabase pull then folds in anything newer from
 * another device. Never lets a stale remote row clobber unsynced local
 * changes — only takes remote when it's genuinely newer (or there's no
 * local copy yet, e.g. a fresh device).
 */
export async function loadPlannerState(): Promise<PlannerState> {
  const kairo = getEngine();
  const studentId = currentStudentId();
  if (!kairo || !studentId) return EMPTY_STATE;

  const local = (await kairo.store.loadPlannerState(studentId)) as StoredPlannerRow | null;
  const localState: PlannerState = local ? {
    planInput: local.planInput ?? null,
    completedTopicKeys: local.completedTopicKeys ?? [],
    topicProgress: local.topicProgress ?? {},
    pinnedDueTopic: local.pinnedDueTopic ?? null,
    updatedAt: local.updatedAt ?? 0,
  } : EMPTY_STATE;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.schema('kairo').from('planner_state')
      .select('plan_input, completed_topic_keys, topic_progress, updated_at')
      .eq('student_id', studentId).maybeSingle();
    if (error || !data) return localState;
    const remoteUpdatedAt = new Date(data.updated_at).getTime();
    if (remoteUpdatedAt <= localState.updatedAt) return localState;
    const remoteState: PlannerState = {
      planInput: data.plan_input ?? null,
      completedTopicKeys: data.completed_topic_keys ?? [],
      topicProgress: data.topic_progress ?? {},
      pinnedDueTopic: localState.pinnedDueTopic, // the pin is a local-only "in progress right now" marker, never synced across devices
      updatedAt: remoteUpdatedAt,
    };
    await kairo.store.savePlannerState(studentId, remoteState);
    return remoteState;
  } catch {
    return localState; // offline — the local snapshot is the honest best-effort
  }
}

async function persist(state: PlannerState): Promise<PlannerState> {
  const kairo = getEngine();
  const studentId = currentStudentId();
  if (!kairo || !studentId) return state;
  const next = { ...state, updatedAt: Date.now() };
  await kairo.store.savePlannerState(studentId, next);
  try {
    const supabase = getSupabase();
    await supabase.schema('kairo').from('planner_state').upsert({
      student_id: studentId,
      plan_input: next.planInput,
      completed_topic_keys: next.completedTopicKeys,
      topic_progress: next.topicProgress,
      updated_at: new Date(next.updatedAt).toISOString(),
    });
  } catch {
    // Offline — the IndexedDB write above already landed; the next online
    // persist() call resends the full (by-then-current) state, so nothing
    // needs a separate retry queue here.
  }
  return next;
}

/** Builds a fresh plan from the student's real inputs and the static Blueprint data, and persists the input (never the derived plan itself — cheap to rebuild from input + completed keys + subjects on every load, same as the source Astro app). */
export async function saveAndBuildPlan(input: PlannerInput): Promise<PlannerPlan> {
  const state = await loadPlannerState();
  await persist({ ...state, planInput: input });
  return buildPlan({ input, allSubjects: getSubjects(), alreadyCompletedKeys: new Set(state.completedTopicKeys) });
}

/** Rebuilds the current plan from whatever's already persisted — the normal "open Planner" path once a plan exists. Null if the student hasn't run initial setup yet. */
export async function loadCurrentPlan(): Promise<{ plan: PlannerPlan; state: PlannerState } | null> {
  const state = await loadPlannerState();
  if (!state.planInput) return null;
  const plan = buildPlan({ input: state.planInput, allSubjects: getSubjects(), alreadyCompletedKeys: new Set(state.completedTopicKeys) });
  return { plan, state };
}

/** Checks/unchecks a topic — the Batch 2 checklist action. `key` is a PlannedTopic.key (see topicKey() in plannerEngine.ts), already computed by whatever rendered the topic row. Returns the updated key set so the caller (the checkbox itself) can render optimistically without re-awaiting a full loadPlannerState(). */
export async function markTopicComplete(key: string, done: boolean): Promise<string[]> {
  const state = await loadPlannerState();
  const keys = new Set(state.completedTopicKeys);
  if (done) keys.add(key);
  else keys.delete(key);
  const completedTopicKeys = [...keys];
  await persist({ ...state, completedTopicKeys });
  return completedTopicKeys;
}

function isPinStillValid(pin: DueTopic, progress: TopicProgressMap, todayIso: string): boolean {
  const entry = progress[pin.topicKey];
  if (!entry) return false;
  return pin.isCriticalGap ? entry.criticalGap : entry.resurfaceDates.some((d) => d <= todayIso);
}

/**
 * The Planner's single top-priority recommendation right now — a critical
 * prerequisite gap, or the longest-overdue mastery/forming resurface.
 * Pinned (Batch 3's persistent-queue rule): once returned, the same topic
 * keeps coming back on every call — even if a new, unrelated critical gap
 * opens up elsewhere in the meantime — until the pinned topic itself is
 * re-attempted (recordVerificationResult clears it) or resolved.
 */
export async function getPinnedRecommendation(): Promise<DueTopic | null> {
  const state = await loadPlannerState();
  const today = toLocalIso(new Date());

  if (state.pinnedDueTopic && isPinStillValid(state.pinnedDueTopic, state.topicProgress, today)) {
    return state.pinnedDueTopic;
  }

  const next = getNextDueTopic(state.topicProgress, today);
  const pinnedDueTopic = next ? { ...next, pinnedOnIso: today } : null;
  if (pinnedDueTopic?.topicKey !== state.pinnedDueTopic?.topicKey) {
    await persist({ ...state, pinnedDueTopic });
  }
  return next;
}

/** Applies a completed Verification Session's accuracy to that topic's SRS tier, and clears the pin if this was the pinned topic — the write side of Batch 3's decay timer. `key` is the same PlannedTopic.key the Verification CTA was launched with. */
export async function recordVerificationResult(key: string, accuracyPct: number): Promise<void> {
  const state = await loadPlannerState();
  const today = toLocalIso(new Date());
  const topicProgress = recordTopicAttempt(key, accuracyPct, today, state.topicProgress);
  const pinnedDueTopic = state.pinnedDueTopic?.topicKey === key ? null : state.pinnedDueTopic;
  await persist({ ...state, topicProgress, pinnedDueTopic });
}
