import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PracticeHome } from './PracticeHome';
import { SubjectSelect } from './SubjectSelect';
import { TopicSelect } from './TopicSelect';
import { SubtopicSelect } from './SubtopicSelect';
import { PracticeHub, type PracticePacing } from './PracticeHub';
import { PracticeQuestion, type PracticeQuestionResult, type PracticeExplanation } from './PracticeQuestion';
import { PracticeSummary, type PracticeResult, type PracticeSummaryAction, type SessionRewards } from './PracticeSummary';
import { PracticeReview } from './PracticeReview';
import { subjects, type Subject } from './data';
import { getEngine, startSuggestedSession, startDashboardSession, reportDashboardSessionOutcome, startCustomSession, startTopicPracticeSession, startHeuristicDrillSession, startEnduranceSession, startLearnFromIncorrectAnswer, getRecommendedNextQuestion, resumePracticeQuestions, loadBookmarks, getWeakTopics, hasCompletedTodaysRecommendation, detectTierUpgradeMessages, type WeakTopicSummary, type DashboardOption } from '../../lib/kairoEngine';
import { toUiQuestion, selectedOptionLabel, type EngineFlatQuestion } from '../../lib/engineAdapter';
import { useBackIntercept } from '../../lib/useBackIntercept';
import { useSetBottomNavHidden } from '../../layout/AppTabs';
import { generateKaiText } from '../../lib/kaiAi';
import { saveSessionSnapshot, clearSessionSnapshot, getPracticeSessionSnapshot, type PracticeSessionSnapshot } from '../../lib/sessionResume';
import { recordVerificationResult } from '../../lib/planner/plannerApi';
import { countHighFrictionPasses } from '../../lib/planner/plannerSrs';
import { goHomeOrStreakSavior } from '../../lib/streakSavior';

/** Batch 2's "Trust, but Verify" loop — a strictly scoped 10-question session on exactly one Planner topic, launched instantly with no picker screens. */
const VERIFICATION_SESSION_LENGTH = 10;

// Mixed Practice / a weak-topic boost both request "every real question
// available" now rather than a student-picked count — this is a ceiling
// safely above any seeded subject's real question bank, not a target the
// engine is expected to actually reach.
const UNCAPPED_LIMIT = 500;

// Matches PracticeHub's EXAM_PACE_SEC — kept in sync there, not imported,
// since it's a small display/pacing constant, not shared behavior.
const EXAM_PACE_SEC = 45;

type Screen = 'practiceHome' | 'subject' | 'practiceHub' | 'topic' | 'subtopic' | 'practiceQuestion' | 'practiceSummary' | 'practiceReview';
type SubjectLike = Subject | { key: string; label: string };
type EntryKind = 'home' | 'subject' | 'topic' | 'mixed' | 'weak' | 'suggested' | 'dashboard' | 'verify' | 'repair' | 'drill' | 'endurance';

interface InitialState {
  screen: Screen;
  entryFlow: string;
  subject: SubjectLike | null;
  difficulty: string | null;
  length: number;
  qIndex: number;
  results: PracticeResult[];
}

function computeInitial(entry: string, verifyTarget: { subjectLabel: string; topic: string } | null): InitialState {
  const kind = entry as EntryKind;
  const base: InitialState = {
    screen: 'subject',
    entryFlow: kind,
    subject: null,
    difficulty: null,
    length: 10,
    qIndex: 0,
    results: [],
  };
  if (kind === 'home') {
    return { ...base, screen: 'practiceHome' };
  }
  if (kind === 'mixed') {
    return { ...base, subject: { key: 'mixed', label: 'All Subjects' }, screen: 'practiceHub' };
  }
  if (kind === 'weak') {
    return { ...base, subject: { key: 'weak', label: 'Weak Areas' }, screen: 'practiceHub' };
  }
  if (kind === 'suggested') {
    return { ...base, subject: subjects[0], difficulty: 'adaptive', length: 5, screen: 'practiceQuestion' };
  }
  // Kairo V1 2-Option Dashboard — the length shown here is just the
  // initial-state placeholder (PracticeQuestion re-derives real progress
  // from the actual resolved question count); the real session length is
  // whatever startDashboardSession() built from the macro-state cap.
  if (kind === 'dashboard') {
    return { ...base, subject: subjects[0], difficulty: 'adaptive', length: 5, screen: 'practiceQuestion' };
  }
  if (kind === 'drill') {
    return { ...base, subject: { key: 'drill', label: 'Drill' }, difficulty: 'adaptive', length: 10, screen: 'practiceQuestion' };
  }
  if (kind === 'repair' && verifyTarget) {
    return { ...base, subject: { key: verifyTarget.subjectLabel, label: verifyTarget.subjectLabel }, length: 5, screen: 'practiceQuestion' };
  }
  if (kind === 'endurance') {
    return { ...base, subject: { key: 'endurance', label: 'Endurance' }, difficulty: 'adaptive', length: 60, screen: 'practiceQuestion' };
  }
  if (kind === 'verify' && verifyTarget) {
    return {
      ...base,
      subject: { key: verifyTarget.subjectLabel, label: verifyTarget.subjectLabel },
      length: VERIFICATION_SESSION_LENGTH,
      screen: 'practiceQuestion',
    };
  }
  // 'subject' and 'topic' (and any unrecognized entry) both start at the subject picker.
  return base;
}

export function PracticeFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  // Tapping the Practice tab directly (no entry state) lands on Practice Home,
  // never a bare subject picker — a student should never have to choose from
  // a menu to begin (Practice Module Spec §2.1). Explicit entry kinds (from
  // Home's own quick actions, or Practice Home's own actions below) still
  // route straight to their specific flow.
  const entry = (location.state as { entry?: string } | null)?.entry ?? 'home';
  // Home's MissionCard names one specific concept (getTodayFocus()) and
  // explains why it's recommended — carried through router state so the
  // suggested session that actually starts is anchored to that same
  // concept instead of a freshly (and possibly differently) ranked one.
  // Read once via ref: only the initial mount's auto-start needs it, and a
  // ref avoids re-triggering that effect.
  const anchorConceptIdRef = useRef((location.state as { anchorConceptId?: string | null } | null)?.anchorConceptId ?? null);
  // Kairo V1 2-Option Dashboard — the EXACT DashboardOption object the
  // student tapped on Home (from a pinned getPinnedDashboardOptions()
  // read), carried through router state so startDashboardSession() never
  // re-derives Primary/Secondary itself: RecommendationEngine's tie-
  // breaking reshuffles call to call, so a fresh recompute here could
  // silently hand back a different topic than the one actually shown.
  const dashboardOptionRef = useRef((location.state as { dashboardOption?: DashboardOption | null } | null)?.dashboardOption ?? null);
  // The small slice of dashboardOptionRef actually needed at COMPLETION
  // time (reportDashboardSessionOutcome only wants type+subject, not the
  // full conceptIds/questions/reason payload) — tracked separately so
  // resumeSession() can restore it from the persisted snapshot after a
  // hard refresh, without needing to reconstruct a fake full DashboardOption.
  const dashboardOutcomeMetaRef = useRef<{ type: string; subject: string | null } | null>(
    dashboardOptionRef.current ? { type: dashboardOptionRef.current.type, subject: dashboardOptionRef.current.subject } : null
  );
  // Planner's Verification Session (Batch 2) — the exact subject/topic to
  // bypass every picker for, and the Planner topic key its accuracy result
  // reports back to (Batch 3's tiered SRS). Read once via ref, same
  // reasoning as anchorConceptIdRef above.
  const verifyStateRef = useRef(location.state as { subjectLabel?: string; topic?: string; plannerTopicKey?: string } | null);
  const plannerTopicKeyRef = useRef<string | null>(verifyStateRef.current?.plannerTopicKey ?? null);
  const verifyTarget = verifyStateRef.current?.subjectLabel && verifyStateRef.current?.topic
    ? { subjectLabel: verifyStateRef.current.subjectLabel, topic: verifyStateRef.current.topic }
    : null;
  // Theory vs. Calculation / Velocity Matrix Insights' "Launch Speed/
  // Theory Drill" CTA (Profile Action Cards) — the heuristic category
  // (and, for the Velocity Matrix's subject-scoped speed drill, the
  // specific subject + a strict timer override) carried through router
  // state the same way anchorConceptId/verifyTarget are.
  const drillStateRef = useRef(location.state as { drillCategory?: 'calculation' | 'theory'; drillSubjects?: string[]; drillTimerSec?: number } | null);
  const drillCategoryRef = useRef(drillStateRef.current?.drillCategory ?? null);

  const [init] = useState(() => computeInitial(entry, verifyTarget));
  // Loads the real bookmark set once per Practice mount — PracticeQuestion
  // reads it synchronously (isQuestionBookmarked) and re-syncs itself once
  // this resolves, so it doesn't need to be awaited before questions render.
  useEffect(() => { loadBookmarks(); }, []);
  const [screen, setScreen] = useState<Screen>(init.screen);
  // Persistent bottom nav (AppTabs) hides only for the actual focused
  // question/explanation screen — every other Practice screen (home,
  // subject/topic pickers, hub, summary, review) keeps it visible.
  useSetBottomNavHidden(screen === 'practiceQuestion');
  const [history, setHistory] = useState<Screen[]>([]);
  const [subject, setSubject] = useState<SubjectLike | null>(init.subject);
  const [topic, setTopic] = useState<string | null>(verifyTarget?.topic ?? null);
  const [subtopic, setSubtopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(init.difficulty);
  const [length, setLength] = useState(init.length);
  const [pacing, setPacing] = useState<PracticePacing>('study');
  const [customTimerSec, setCustomTimerSec] = useState(60);
  const [entryFlow, setEntryFlow] = useState(init.entryFlow);
  const [recentKeys, setRecentKeys] = useState<string[]>([]);
  const [hasHistory, setHasHistory] = useState(false);
  const [qIndex, setQIndex] = useState(init.qIndex);
  const [results, setResults] = useState<PracticeResult[]>(init.results);
  // Whether this session has already had its one in-session remediation
  // pass (missed questions resurfaced once, right before the final score
  // is calculated) — reset alongside results whenever a session actually
  // restarts, via resetResults() below, so a genuinely new session always
  // gets its own remediation chance.
  const [remediationDone, setRemediationDone] = useState(false);
  // Session-end rewards for the summary screen (Kairo Points earned +
  // streak progress) — null until the session actually ends. Deliberately
  // never carries a Kairo Score delta; that stays off this screen entirely
  // (KISS enforcement, the approved Kairo Score/Kairo Points directive).
  const [rewards, setRewards] = useState<SessionRewards | null>(null);
  // Batch 3's tier-upgrade toast lines (Prestige Level + Badge Vault) —
  // real, specific text derived from what this exact session actually
  // changed (see detectTierUpgradeMessages()), not a generic "leveled up".
  const [tierUpgrades, setTierUpgrades] = useState<string[]>([]);
  function resetResults() {
    setResults([]);
    setRemediationDone(false);
    setRewards(null);
    setTierUpgrades([]);
  }
  const [engineQuestions, setEngineQuestions] = useState<EngineFlatQuestion[] | null>(null);
  const [engineLoadError, setEngineLoadError] = useState<string | null>(null);
  const [lastErrorTag, setLastErrorTag] = useState<string | null>(null);
  const [lastResponseTimeMs, setLastResponseTimeMs] = useState(15000);
  const [kaiNote, setKaiNote] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<PracticeExplanation | null>(null);
  /** RecommendationEngine.processAnswer()'s per-answer interrupt (Practice Module's real "recommend + explain why" moment) — computed every answer, previously discarded. */
  const [decisionNote, setDecisionNote] = useState<{ action: string; reason: string } | null>(null);
  const startedSuggested = useRef(false);
  const qIndexRef = useRef(qIndex);
  qIndexRef.current = qIndex;
  const [resumeSnapshot, setResumeSnapshot] = useState<PracticeSessionSnapshot | null>(null);
  useEffect(() => {
    setResumeSnapshot(getPracticeSessionSnapshot(getEngine()?.profile?.studentId));
  }, []);
  // Real most-failed topics for the Hub's "Weak Areas" picker — scoped to
  // whatever subject the Hub is already showing (undefined/"all" for the
  // generic Mixed/Weak entry points), refetched on every Hub visit since
  // it's a cheap synchronous read, not a network call.
  const [weakTopics, setWeakTopics] = useState<WeakTopicSummary[]>([]);
  // Set once a session with no student-picked question count actually
  // starts (Mixed Practice / a weak-topic boost) — tells PracticeQuestion
  // to show completion percentage instead of "Question N of Total".
  const [showPercent, setShowPercent] = useState(false);

  /** Recommended-by-Kairo session (Practice Module §2.2) — zero-input, real DDE-style queue. Shared by the initial-mount auto-start (arriving via entry:'suggested') and Practice Home's own "Start Session" tap. */
  function startSuggested(anchorConceptId?: string | null) {
    setEngineQuestions(null);
    setEngineLoadError(null);
    startSuggestedSession(5, anchorConceptId)
      .then(({ questions }) => {
        if (questions.length === 0) {
          setEngineLoadError("Kairo couldn't find any questions to start with just yet.");
        } else {
          setEngineQuestions(questions);
          persistFreshSnapshot('suggested', subjects[0], null, null, 'adaptive', questions);
        }
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not start your session.'));
  }

  useEffect(() => {
    if (entryFlow !== 'suggested' || startedSuggested.current) return;
    startedSuggested.current = true;
    // Anti-Refresh Wipeout (Batch 1): a mid-session refresh remounts this
    // effect with the same 'suggested' entry — resume the real snapshot
    // instead of silently discarding it and fetching a brand-new batch.
    const existing = getPracticeSessionSnapshot(getEngine()?.profile?.studentId);
    if (existing && existing.entryFlow === 'suggested') {
      resumeSession(existing);
      return;
    }
    startSuggested(anchorConceptIdRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Kairo V1 2-Option Dashboard session (entry:'dashboard') — the student
   * tapped Primary or Secondary on Home's MissionCard. Unlike
   * startSuggested() above, there's no re-deriving anything here:
   * dashboardOptionRef.current is the exact, already-resolved
   * DashboardOption object the card showed, passed straight into
   * startDashboardSession() so what was tapped is what actually starts.
   */
  const startedDashboard = useRef(false);
  function startDashboard(option: DashboardOption) {
    setEngineQuestions(null);
    setEngineLoadError(null);
    startDashboardSession(option)
      .then(({ questions }) => {
        if (questions.length === 0) {
          setEngineLoadError("Kairo couldn't find any questions to start with just yet.");
        } else {
          setEngineQuestions(questions);
          const subj = subjects.find((s) => s.label === option.subject) ?? subjects[0];
          persistFreshSnapshot('dashboard', subj, option.topic ?? null, null, 'adaptive', questions,
            { dashboardMeta: { type: option.type, subject: option.subject } });
        }
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not start your session.'));
  }

  useEffect(() => {
    if (entryFlow !== 'dashboard' || startedDashboard.current) return;
    startedDashboard.current = true;
    const existing = getPracticeSessionSnapshot(getEngine()?.profile?.studentId);
    if (existing && existing.entryFlow === 'dashboard') {
      resumeSession(existing);
      return;
    }
    if (!dashboardOptionRef.current) {
      setEngineLoadError('Missing dashboard selection — go back to Home and try again.');
      return;
    }
    startDashboard(dashboardOptionRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verification Session (Batch 2) — same auto-start-on-mount pattern as
  // 'suggested' above, straight into the one subject+topic the Planner
  // named, at a fixed 10-question length, adaptive difficulty (no
  // student-facing config screen to pick one from).
  const startedVerify = useRef(false);
  useEffect(() => {
    if (entryFlow !== 'verify' || startedVerify.current) return;
    startedVerify.current = true;
    if (!verifyTarget) {
      setEngineLoadError('Missing verification target — go back to the Planner and try again.');
      return;
    }
    // Anti-Refresh Wipeout (Batch 1) — only resume a snapshot that's
    // actually this same verification target; a stale one from a
    // different Planner topic must not hijack a fresh verify request.
    const existing = getPracticeSessionSnapshot(getEngine()?.profile?.studentId);
    if (existing && existing.entryFlow === 'verify' && existing.subjectLabel === verifyTarget.subjectLabel && existing.topic === verifyTarget.topic) {
      resumeSession(existing);
      return;
    }
    startTopicSession(verifyTarget.subjectLabel, verifyTarget.topic, undefined, VERIFICATION_SESSION_LENGTH, undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startedRepair = useRef(false);
  useEffect(() => {
    if (entryFlow !== 'repair' || startedRepair.current) return;
    startedRepair.current = true;
    if (!verifyTarget) {
      setEngineLoadError('Missing repair topic — go back to Review and try again.');
      return;
    }
    const existing = getPracticeSessionSnapshot(getEngine()?.profile?.studentId);
    if (existing && existing.entryFlow === 'repair' && existing.subjectLabel === verifyTarget.subjectLabel && existing.topic === verifyTarget.topic) {
      resumeSession(existing);
      return;
    }
    startTopicSession(verifyTarget.subjectLabel, verifyTarget.topic, undefined, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Profile Action Cards' "Launch Speed/Theory Drill" CTA — same auto-start-on-mount pattern as 'verify' above. A Velocity Matrix drill carries its own strict timer (drillTimerSec) — applied via the same Custom Timer pacing PracticeHub's own picker would set. */
  function startDrill(category: 'calculation' | 'theory', subjects?: string[], timerSec?: number) {
    setEngineQuestions(null);
    setEngineLoadError(null);
    if (timerSec) {
      setPacing('custom');
      setCustomTimerSec(timerSec);
    }
    startHeuristicDrillSession(category, 10, subjects)
      .then(({ questions }) => {
        if (questions.length === 0) {
          setEngineLoadError("Kairo couldn't find any questions for this drill yet.");
        } else {
          setEngineQuestions(questions);
          persistFreshSnapshot('drill', { key: 'drill', label: 'Drill' }, null, null, 'adaptive', questions);
        }
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not start your session.'));
  }

  const startedDrill = useRef(false);
  useEffect(() => {
    if (entryFlow !== 'drill' || startedDrill.current) return;
    startedDrill.current = true;
    if (!drillCategoryRef.current) {
      setEngineLoadError('Missing drill category — go back to Profile and try again.');
      return;
    }
    // Anti-Refresh Wipeout (Batch 1) — resume a still-active drill instead of silently starting a second one.
    const existing = getPracticeSessionSnapshot(getEngine()?.profile?.studentId);
    if (existing && existing.entryFlow === 'drill') {
      resumeSession(existing);
      return;
    }
    startDrill(drillCategoryRef.current, drillStateRef.current?.drillSubjects, drillStateRef.current?.drillTimerSec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Endurance Curve Insight's "Start 60-Question Endurance CBT" CTA — same auto-start-on-mount pattern as 'drill' above. */
  const startedEndurance = useRef(false);
  useEffect(() => {
    if (entryFlow !== 'endurance' || startedEndurance.current) return;
    startedEndurance.current = true;
    // Anti-Refresh Wipeout (Batch 1) — a 60-question endurance run is the
    // single most expensive session to lose to a refresh; resume it rather
    // than silently starting a fresh 60-question batch.
    const existing = getPracticeSessionSnapshot(getEngine()?.profile?.studentId);
    if (existing && existing.entryFlow === 'endurance') {
      setShowPercent(true);
      resumeSession(existing);
      return;
    }
    setEngineQuestions(null);
    setEngineLoadError(null);
    setShowPercent(true); // a 60-question queue reads better as completion % than "Question 37 of 60"
    startEnduranceSession(60)
      .then(({ questions }) => {
        if (questions.length === 0) {
          setEngineLoadError("Kairo couldn't find enough questions for an endurance session yet.");
        } else {
          setEngineQuestions(questions);
          persistFreshSnapshot('endurance', { key: 'endurance', label: 'Endurance' }, null, null, 'adaptive', questions);
        }
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not start your session.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Mixed Practice / Weak Areas from PracticeHub — same real session
   * lifecycle as "suggested". Takes difficulty as an explicit argument
   * (the value PracticeHub's onStart just handed us), not read from the
   * difficulty state var — setDifficulty() below hasn't committed by the
   * time this same handler calls this function, so reading state here
   * would see the previous selection, not the one just picked.
   */
  function startEngineCustomSession(subjectFilter: string[], includeFading: boolean, limit: number, difficultyChoice?: string) {
    setEngineQuestions(null);
    setEngineLoadError(null);
    startCustomSession({ subjects: subjectFilter, includeFading, limit: limit || 10, difficulty: difficultyChoice })
      .then(({ questions }) => {
        if (questions.length === 0) {
          setEngineLoadError("Kairo couldn't find any questions to start with just yet.");
        } else {
          setEngineQuestions(questions);
          persistFreshSnapshot(entryFlow, activeSubject, null, null, difficultyChoice ?? null, questions);
        }
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not start your session.'));
  }

  /**
   * Topic Practice's final pick (or "practise all of this topic" skip), and
   * the weak-topic boost from PracticeHub — same real session lifecycle,
   * scoped to a subject/topic/subtopic. `limitOverride`/`difficultyOverride`
   * exist because the caller may have just called setLength()/setDifficulty()
   * moments earlier in the same handler — those state updates haven't
   * committed yet, so reading `length`/`difficulty` here would still see the
   * previous selection.
   */
  function startTopicSession(subjectLabel: string, topicName: string, subtopicName?: string, limitOverride?: number, difficultyOverride?: string, isVerification = false) {
    setEngineQuestions(null);
    setEngineLoadError(null);
    startTopicPracticeSession(subjectLabel, topicName, subtopicName, limitOverride ?? (length || 10), difficultyOverride ?? (difficulty ?? undefined), isVerification)
      .then(({ questions }) => {
        if (questions.length === 0) {
          setEngineLoadError("Kairo couldn't find any questions for this topic yet.");
        } else {
          setEngineQuestions(questions);
          persistFreshSnapshot(entryFlow, { key: subjectLabel, label: subjectLabel }, topicName, subtopicName ?? null, difficultyOverride ?? difficulty ?? null, questions,
            isVerification ? { plannerTopicKey: plannerTopicKeyRef.current } : undefined);
        }
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not start your session.'));
  }

  /** Quick Resume (Practice Module §2.5/§3.2) — reconstructs the exact question set and position from a snapshot saved after a prior answer, rather than starting a fresh recommendation. Sets the screen directly rather than going through go() since a mount-time auto-resume (Batch 1, see the 'suggested'/'verify'/'drill'/'endurance' effects below) has no real "previous screen" to push onto history yet. */
  function resumeSession(snapshot: PracticeSessionSnapshot) {
    setEngineQuestions(null);
    setEngineLoadError(null);
    setShowPercent(false);
    setEntryFlow(snapshot.entryFlow);
    setSubject({ key: snapshot.subjectKey, label: snapshot.subjectLabel });
    setTopic(snapshot.topic);
    setSubtopic(snapshot.subtopic);
    setDifficulty(snapshot.difficulty);
    let restoredResults: PracticeResult[] = [];
    try { restoredResults = JSON.parse(snapshot.resultsJson); } catch { /* fall back to empty */ }
    setResults(restoredResults);
    setQIndex(snapshot.qIndex);
    setScreen('practiceQuestion');
    // Restores what a hard refresh would otherwise have wiped from the
    // router-state-only refs above — see PracticeSessionSnapshot's own
    // doc comment on plannerTopicKey/dashboardMeta for why this matters:
    // without it, recordVerificationResult()/reportDashboardSessionOutcome()
    // would silently no-op on a resumed session's completion.
    if (snapshot.plannerTopicKey) plannerTopicKeyRef.current = snapshot.plannerTopicKey;
    if (snapshot.dashboardMeta) dashboardOutcomeMetaRef.current = snapshot.dashboardMeta;
    resumePracticeQuestions(snapshot.loadSubjectLabel, snapshot.questionIds)
      .then((questions) => {
        if (questions.length === 0 || snapshot.qIndex >= questions.length) {
          setEngineLoadError("This session couldn't be resumed — some of its questions are no longer available.");
          clearSessionSnapshot(getEngine()?.profile?.studentId, 'practice');
          setResumeSnapshot(null);
          return;
        }
        setEngineQuestions(questions);
      })
      .catch((err) => setEngineLoadError(err instanceof Error ? err.message : 'Could not resume your session.'));
  }

  /**
   * Anti-Refresh Wipeout (Batch 1): a freshly-generated session previously
   * wasn't written to localStorage until the *first answer* — so a refresh
   * before then (or mid-fetch) lost the entry point entirely and silently
   * started over. Saves the same shape handleNextQuestion() already
   * maintains, at qIndex 0 with no results yet, right when the questions
   * a session will actually run are first known.
   */
  function persistFreshSnapshot(flow: string, subj: SubjectLike, topicValue: string | null, subtopicValue: string | null, difficultyValue: string | null, questions: EngineFlatQuestion[], extra?: { plannerTopicKey?: string | null; dashboardMeta?: { type: string; subject: string | null } | null }) {
    saveSessionSnapshot(getEngine()?.profile?.studentId, {
      kind: 'practice',
      entryFlow: flow,
      subjectKey: subj.key,
      subjectLabel: subj.label,
      loadSubjectLabel: (subj.key === 'mixed' || subj.key === 'weak') ? null : subj.label,
      topic: topicValue,
      subtopic: subtopicValue,
      difficulty: difficultyValue,
      questionIds: questions.map((q) => q.id),
      qIndex: 0,
      resultsJson: '[]',
      savedAt: Date.now(),
      plannerTopicKey: extra?.plannerTopicKey ?? null,
      dashboardMeta: extra?.dashboardMeta ?? null,
    });
  }

  useEffect(() => {
    if (screen !== 'practiceHub') return;
    const isGenericSubject = !subject || subject.key === 'mixed' || subject.key === 'weak';
    setWeakTopics(getWeakTopics(isGenericSubject ? undefined : subject.label, 5));
  }, [screen, subject]);

  function go(next: Screen) {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  }
  function back() {
    setHistory((h) => {
      const n = [...h];
      const prev = n.pop();
      if (prev) setScreen(prev);
      else navigate('/home');
      return n;
    });
  }
  function toHome() {
    navigate('/home');
  }

  // Makes the phone/browser back button step through Practice's own screens
  // one at a time (subject -> hub -> question -> ...), the same as tapping
  // the in-screen back arrow (which already calls back() above) — without
  // this, the physical back button skips the whole flow in one tap.
  useBackIntercept(history.length, back);

  /** Fires immediately when the answer is graded (before the student advances) — records the real attempt right away so "Understand this before moving on" has a real errorTag to hand Learn. */
  function handleAnswered({ correct, selectedIndex, responseTimeMs, answerChanges, firstSelectedIndex }: { correct: boolean; selectedIndex: number | null; responseTimeMs: number; answerChanges: number; firstSelectedIndex: number | null }) {
    if (!engineQuestions) return;
    const kairo = getEngine();
    const eq = engineQuestions[qIndex];
    if (!kairo || !eq) return;
    // submitAnswer()'s full return also carries kaiResponse (KaiBehavior's
    // real, context-aware reaction — milestone/error-type/correct-state,
    // never a generic string) and conceptState — both were previously
    // discarded here, which is why the Kai panel always showed a flat
    // duplicate of the explanation instead of Kai's actual computed
    // response to this specific attempt.
    const { attempt, kaiResponse, conceptState, explanation: newExplanation, decision, nextDifficulty } = kairo.submitAnswer({
      conceptId: eq.conceptId ?? null,
      correct,
      responseTimeMs,
      selectedOption: selectedOptionLabel(eq, selectedIndex),
      correctOption: eq.correctOption,
      questionId: eq.id,
      questionDifficulty: eq.difficulty,
      answerChangeCount: answerChanges,
      firstSelectedOption: selectedOptionLabel(eq, firstSelectedIndex),
    });
    setLastErrorTag(attempt?.errorTag ?? null);
    setLastResponseTimeMs(responseTimeMs);
    setKaiNote(kaiResponse?.text ?? null);
    setExplanation(newExplanation ?? null);

    // RecommendationEngine's real per-answer interrupt — reroute to a weak
    // prerequisite, drop to a lower-stakes diagnostic after a guess, or ease
    // off after repeated careless slips. 'continue'/'end_session' are the
    // ordinary case and get no interrupt moment.
    if (decision && decision.action !== 'continue' && decision.action !== 'end_session') {
      setDecisionNote({ action: decision.action, reason: decision.reason });

      if ((decision.action === 'reroute_prerequisite' || decision.action === 'diagnostic') && decision.nextConceptId) {
        // A genuinely different concept to go to next — fetch a real
        // question for it, honoring the engine's own difficulty pick for
        // that concept, and splice it in right after the current one so
        // the very next question actually reflects what the engine just
        // decided instead of whatever was already sitting in the batch.
        const seenIds = engineQuestions.map((q) => q.id);
        const nextQ = getRecommendedNextQuestion(decision.nextConceptId, seenIds, nextDifficulty);
        if (nextQ) {
          setEngineQuestions((prev) => {
            if (!prev) return prev;
            const copy = [...prev];
            copy.splice(qIndex + 1, 0, nextQ);
            return copy;
          });
        }
      } else if (decision.action === 'difficulty_pullback') {
        // Same concept, no reroute — the engine just eased its own
        // difficulty pick (AdaptiveDifficulty.softenSession(), previously
        // never actually triggered by this decision — see index.js). That
        // has no effect on a question already sitting in the pre-fetched
        // batch, so replace the upcoming one with a fresh pick honoring
        // the now-softened tier, but only swap in if it's genuinely no
        // harder than what's already queued — never silently make it worse.
        const upcoming = engineQuestions[qIndex + 1];
        if (upcoming?.conceptId && nextDifficulty != null && (upcoming.difficulty == null || nextDifficulty <= upcoming.difficulty)) {
          const seenIds = engineQuestions.map((q) => q.id);
          const easier = getRecommendedNextQuestion(upcoming.conceptId, seenIds, nextDifficulty);
          if (easier && (easier.difficulty == null || upcoming.difficulty == null || easier.difficulty <= upcoming.difficulty)) {
            setEngineQuestions((prev) => {
              if (!prev) return prev;
              const copy = [...prev];
              copy[qIndex + 1] = easier;
              return copy;
            });
          }
        }
      }
    } else {
      setDecisionNote(null);
    }

    // Progressive enhancement: show the real template text instantly above,
    // then quietly upgrade to a freshly-generated version in Kai's voice if
    // Gemini responds before the student moves on. Never invents anything
    // beyond what KaiBehavior itself already computed for this attempt.
    const askedAtQIndex = qIndex;
    generateKaiText('coaching_note', {
      correct,
      subject: eq.subject,
      topic: eq.topic,
      errorTag: attempt?.errorTag ?? null,
      conceptState: conceptState ?? null,
      macroState: kairo.profile?.macroState ?? null,
      isMilestone: !!kaiResponse?.triggerWisdomSpark,
      responseTimeMs,
    }).then((aiText) => {
      if (aiText && qIndexRef.current === askedAtQIndex) setKaiNote(aiText);
    });
  }

  function handleLearnThis() {
    if (!engineQuestions) return;
    const eq = engineQuestions[qIndex];
    if (!eq?.conceptId) return;
    startLearnFromIncorrectAnswer({
      questionId: eq.id,
      conceptId: eq.conceptId,
      errorTag: lastErrorTag,
      responseTimeMs: lastResponseTimeMs,
    });
    navigate(`/learn/${encodeURIComponent(eq.conceptId)}`, { state: { returnTo: '/practice' } });
  }

  async function handleNextQuestion({ correct, confidence, selectedIndex, responseTimeMs }: PracticeQuestionResult) {
    const eq = engineQuestions?.[qIndex];
    const newResults = [...results, {
      correct, confidence, time: Math.round(responseTimeMs / 1000), subject: eq?.subject, topic: eq?.topic,
      review: eq ? {
        questionText: eq.text,
        options: eq.options.map((o) => ({ label: o.label, text: o.text })),
        correctOption: eq.correctOption,
        selectedOption: selectedOptionLabel(eq, selectedIndex) ?? null,
        explanation: eq.explanation,
      } : undefined,
    }];
    setResults(newResults);
    setLastErrorTag(null);
    setKaiNote(null);
    setExplanation(null);
    setDecisionNote(null);

    if (!engineQuestions) return;
    const kairo = getEngine();
    if (qIndex + 1 >= engineQuestions.length) {
      // In-session remediation, once per session: resurface any missed
      // questions right here, before the session ends and the final
      // score is calculated — a student gets one immediate corrective
      // shot instead of only finding out about a miss after the score
      // (and streak/Kairo Score) is already locked in.
      if (!remediationDone) {
        const missedConceptIds = Array.from(new Set(
          newResults
            .map((r, i) => (!r.correct ? engineQuestions[i]?.conceptId : null))
            .filter((id): id is string => !!id)
        ));
        if (missedConceptIds.length > 0) {
          const seenIds = engineQuestions.map((q) => q.id);
          const remediationQs: EngineFlatQuestion[] = [];
          for (const cid of missedConceptIds) {
            const q = getRecommendedNextQuestion(cid, seenIds);
            if (q) { remediationQs.push(q); seenIds.push(q.id); }
          }
          if (remediationQs.length > 0) {
            setRemediationDone(true);
            setEngineQuestions([...engineQuestions, ...remediationQs]);
            setQIndex(qIndex + 1);
            return;
          }
        }
        setRemediationDone(true);
      }
      setHasHistory(true);
      clearSessionSnapshot(kairo?.profile?.studentId, 'practice');
      // Batch 3's tiered SRS — a Verification Session's real final accuracy
      // (including any in-session remediation questions above, since
      // newResults already carries those by this point) drives the
      // topic's decay-timer tier. Best-effort, same as sync elsewhere —
      // never blocks the summary transition.
      if (entryFlow === 'verify' && plannerTopicKeyRef.current) {
        const accuracyPct = newResults.length ? Math.round((newResults.filter((r) => r.correct).length / newResults.length) * 100) : 0;
        // Velocity Tracking: a correct-but-slow answer (> HIGH_FRICTION_SECONDS)
        // is "eventually right," not exam-ready -- two or more of these in
        // the same session throttle what would otherwise be a Mastery tier
        // down to Forming (see classifyTier() in plannerSrs.ts).
        const highFrictionPassCount = countHighFrictionPasses(newResults.map((r) => ({ correct: r.correct, timeSec: r.time ?? 0 })));
        recordVerificationResult(plannerTopicKeyRef.current, accuracyPct, highFrictionPassCount).catch(() => {});
      }
      // Kairo V1 Dashboard's Anti-Fatigue Circuit Breaker — real completed-
      // session accuracy (0-1, not a percentage) feeds RecommendationEngine's
      // FRUSTRATION_ACCURACY_THRESHOLD check for the NEXT dashboard load.
      // dashboardOutcomeMetaRef survives a hard refresh mid-session (see
      // resumeSession() and PracticeSessionSnapshot.dashboardMeta) — this
      // no longer silently no-ops the way it would reading straight off
      // router state.
      if (entryFlow === 'dashboard' && dashboardOutcomeMetaRef.current) {
        const accuracy = newResults.length ? newResults.filter((r) => r.correct).length / newResults.length : 0;
        reportDashboardSessionOutcome(dashboardOutcomeMetaRef.current.type, dashboardOutcomeMetaRef.current.subject, accuracy);
      }
      if (kairo) {
        // endSession() itself no longer waits on IndexedDB/Supabase (that
        // tail runs detached inside the engine now) — score/streak/level/
        // badges come back essentially instantly, so awaiting it here
        // still means an instant summary transition, just with the real
        // Kairo Points earned and streak status instead of a flat estimate.
        try {
          const result = await kairo.endSession();
          if (result) {
            const streak = result.streak ?? kairo.getStreakStatus?.() ?? null;
            setRewards({
              pointsEarned: result.level?.pointsEarned ?? 0,
              streakDays: streak?.momentum ?? 0,
              streakLit: hasCompletedTodaysRecommendation(),
              freezesAvailable: streak?.freezesAvailable ?? 0,
            });
            setTierUpgrades(detectTierUpgradeMessages(result));
          } else {
            setRewards(null);
          }
        } catch {
          setRewards(null);
        }
      }
      go('practiceSummary');
    } else {
      const nextIndex = qIndex + 1;
      setQIndex(nextIndex);
      // Quick Resume (Practice Module §2.5/§3.2) — one answer in is enough
      // to be worth resuming; a session abandoned before any answer isn't.
      saveSessionSnapshot(kairo?.profile?.studentId, {
        kind: 'practice',
        entryFlow,
        subjectKey: activeSubject.key,
        subjectLabel: activeSubject.label,
        loadSubjectLabel: (activeSubject.key === 'mixed' || activeSubject.key === 'weak') ? null : activeSubject.label,
        topic, subtopic, difficulty,
        questionIds: engineQuestions.map((q) => q.id),
        qIndex: nextIndex,
        resultsJson: JSON.stringify(newResults),
        savedAt: Date.now(),
      });
    }
  }

  function handleSummaryAction(key: PracticeSummaryAction) {
    if (key === 'weak') {
      setSubject({ key: 'weak', label: 'Weak Areas' });
      setEntryFlow('weak');
      go('practiceHub');
    } else if (key === 'topic') {
      // Continue on the exact topic just practised where one is known;
      // otherwise (a mixed/weak-areas session has no single topic) send
      // the student to pick one.
      if (topic && activeSubject.key !== 'mixed' && activeSubject.key !== 'weak') {
        setShowPercent(false);
        resetResults();
        setQIndex(0);
        startTopicSession(activeSubject.label, topic, subtopic ?? undefined);
        go('practiceQuestion');
      } else {
        setEntryFlow('topic');
        go('subject');
      }
    } else if (key === 'challenge') {
      setDifficulty('hard');
      setQIndex(0);
      setShowPercent(false);
      resetResults();
      go('practiceQuestion');
    } else if (key === 'cbt') {
      navigate('/cbt');
    } else if (key === 'review') {
      go('practiceReview');
    }
  }

  const activeSubject = subject ?? { key: 'mixed', label: 'All Subjects' };
  const lockedType = entryFlow === 'mixed' ? 'mixed' : entryFlow === 'weak' ? 'weak' : undefined;

  if (screen === 'practiceHome') {
    return (
      <PracticeHome
        onBack={toHome}
        resumeSummary={resumeSnapshot ? {
          subjectLabel: resumeSnapshot.subjectLabel,
          topic: resumeSnapshot.topic,
          questionsDone: resumeSnapshot.qIndex,
          questionsTotal: resumeSnapshot.questionIds.length,
        } : null}
        onResume={() => resumeSnapshot && resumeSession(resumeSnapshot)}
        onStartSuggested={() => {
          setSubject(subjects[0]);
          setDifficulty('adaptive');
          setLength(5);
          setQIndex(0);
          setShowPercent(false);
          resetResults();
          setEntryFlow('suggested');
          startSuggested();
          go('practiceQuestion');
        }}
        onStartDashboard={(option) => {
          setSubject(subjects.find((s) => s.label === option.subject) ?? subjects[0]);
          setDifficulty('adaptive');
          setLength(5);
          setQIndex(0);
          setShowPercent(false);
          resetResults();
          setEntryFlow('dashboard');
          dashboardOptionRef.current = option;
          dashboardOutcomeMetaRef.current = { type: option.type, subject: option.subject };
          startDashboard(option);
          go('practiceQuestion');
        }}
        onBySubject={() => {
          setEntryFlow('subject');
          go('subject');
        }}
        onByTopic={() => {
          setEntryFlow('topic');
          go('subject');
        }}
        onMixed={() => {
          setSubject({ key: 'mixed', label: 'All Subjects' });
          setEntryFlow('mixed');
          go('practiceHub');
        }}
        onWeak={() => {
          setSubject({ key: 'weak', label: 'Weak Areas' });
          setEntryFlow('weak');
          go('practiceHub');
        }}
      />
    );
  }
  if (screen === 'subject') {
    return (
      <SubjectSelect
        onBack={toHome}
        recentKeys={recentKeys}
        onPick={(s) => {
          setSubject(s);
          setRecentKeys((k) => [s.key, ...k.filter((x) => x !== s.key)].slice(0, 3));
          if (entryFlow === 'topic') go('topic');
          else go('practiceHub');
        }}
      />
    );
  }
  if (screen === 'practiceHub') {
    return (
      <PracticeHub
        subject={activeSubject}
        hasHistory={hasHistory}
        lockedType={lockedType}
        weakTopics={weakTopics}
        onBack={back}
        onStart={({ type, difficulty: d, length: len, topic: pickedTopic, topicSubject, pacing: p, customTimerSec: cts }) => {
          // len === 0 is PracticeHub's "no cap" sentinel (Mixed Practice /
          // a weak-topic boost, both of which hide the length picker).
          const uncapped = len === 0;
          setDifficulty(d);
          setLength(uncapped ? UNCAPPED_LIMIT : len);
          setShowPercent(uncapped);
          setPacing(p);
          if (cts) setCustomTimerSec(cts);
          if (type === 'topic') {
            go('topic');
          } else if (pickedTopic && topicSubject) {
            // A specific most-failed topic was picked — the whole session
            // stays scoped to that one subject+topic (real active retrieval
            // across it) instead of mixing every failed concept together.
            setTopic(pickedTopic);
            setSubtopic(null);
            setQIndex(0);
            resetResults();
            startTopicSession(topicSubject, pickedTopic, undefined, UNCAPPED_LIMIT, d);
            go('practiceQuestion');
          } else {
            setTopic(null);
            setSubtopic(null);
            setQIndex(0);
            resetResults();
            const isGenericSubject = activeSubject.key === 'mixed' || activeSubject.key === 'weak';
            const subjectFilter = isGenericSubject ? [] : [activeSubject.label];
            startEngineCustomSession(subjectFilter, type === 'weak', uncapped ? UNCAPPED_LIMIT : len, d);
            go('practiceQuestion');
          }
        }}
      />
    );
  }
  if (screen === 'topic') {
    return (
      <TopicSelect
        subject={activeSubject as Subject}
        onBack={back}
        onPick={(t) => {
          setTopic(t);
          go('subtopic');
        }}
      />
    );
  }
  if (screen === 'subtopic' && topic) {
    return (
      <SubtopicSelect
        subject={activeSubject as Subject}
        topic={topic}
        onBack={back}
        onPick={(s) => {
          setSubtopic(s);
          setQIndex(0);
          setShowPercent(false);
          resetResults();
          startTopicSession(activeSubject.label, topic, s);
          go('practiceQuestion');
        }}
        onSkip={() => {
          setQIndex(0);
          setShowPercent(false);
          resetResults();
          startTopicSession(activeSubject.label, topic);
          go('practiceQuestion');
        }}
      />
    );
  }
  if (screen === 'practiceQuestion') {
    if (engineLoadError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>{engineLoadError}</div>
          <button type="button" onClick={toHome} style={{ background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)' }}>Back to Home</button>
        </div>
      );
    }
    if (!engineQuestions) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Preparing your session…</div>
        </div>
      );
    }
    return (
      <PracticeQuestion
        key={engineQuestions[qIndex].id}
        question={toUiQuestion(engineQuestions[qIndex])}
        index={qIndex}
        total={engineQuestions.length}
        onNext={handleNextQuestion}
        onExit={toHome}
        onAnswered={handleAnswered}
        onLearnThis={engineQuestions[qIndex].conceptId ? handleLearnThis : undefined}
        kaiNote={kaiNote}
        explanation={explanation}
        nextStepNote={decisionNote}
        showPercent={showPercent}
        timerSec={pacing === 'exam' ? EXAM_PACE_SEC : pacing === 'custom' ? customTimerSec : null}
      />
    );
  }
  if (screen === 'practiceSummary') {
    // Batch 4's Streak Savior — only a 'suggested'-entry session is itself
    // the Daily Recommendation; every other completed session here (mixed,
    // weak, subject, topic, verify) detours through the interstitial first
    // if today's real recommendation is still undone.
    return (
      <PracticeSummary
        results={results}
        onHome={() => goHomeOrStreakSavior(navigate, entryFlow === 'suggested')}
        onAction={handleSummaryAction}
        rewards={rewards}
        tierUpgrades={tierUpgrades}
      />
    );
  }
  if (screen === 'practiceReview') {
    return <PracticeReview results={results} onBack={back} />;
  }

  return null;
}
