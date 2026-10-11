import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KairoStateView, useAsyncState } from '../../components';
import { PlannerSetup } from './PlannerSetup';
import { PlannerHome } from './PlannerHome';
import { getSubjects } from '../../lib/planner/syllabus';
import { toLocalIso, type PlannedTopic, type PlannerInput, type PlannerPlan } from '../../lib/planner/plannerEngine';
import { saveAndBuildPlan, markTopicComplete, type PlannerState, type DueTopic } from '../../lib/planner/plannerApi';
import { fetchQuery, peekQuery, setQuery } from '../../lib/queryCache';
import { PLANNER_KEY, fetchPlanner, type PlannerData } from '../../lib/screenQueries';
import { getEngine } from '../../lib/kairoEngine';
import { getCourseSubjects } from '../../lib/subjectScope';

type Screen = 'loading' | 'setup' | 'home';

/** Controller for the Study Planner: setup (once) -> home (weekly checklist + Batch 3's pinned recommendation), mirroring the simple screen-stack pattern CbtFlow/RapidFireFlow already use. */
export function PlannerFlow() {
  const navigate = useNavigate();
  const [cached] = useState(() => peekQuery<PlannerData>(PLANNER_KEY));
  const [screen, setScreen] = useState<Screen>(cached ? (cached.plan ? 'home' : 'setup') : 'loading');
  const [plan, setPlan] = useState<PlannerPlan | null>(cached?.plan ?? null);
  const [state, setState] = useState<PlannerState | null>(cached?.state ?? null);
  const [pinned, setPinned] = useState<DueTopic | null>(cached?.pinned ?? null);
  const [submitting, setSubmitting] = useState(false);
  const requestId = useRef(0);
  const asyncState = useAsyncState(cached ? 'success' : 'loading');

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    const hasData = !!peekQuery(PLANNER_KEY);
    if (!hasData) asyncState.start();
    try {
      const data = await fetchQuery(PLANNER_KEY, fetchPlanner);
      if (currentRequest !== requestId.current) return;
      setPlan(data.plan);
      setState(data.state);
      setPinned(data.pinned);
      setScreen(data.plan ? 'home' : 'setup');
      asyncState.succeed();
    } catch {
      if (currentRequest === requestId.current && !hasData) asyncState.fail();
    }
  // The request id, rather than callback identity, owns freshness for this controller.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);

  const toHome = () => navigate('/home');

  async function handleSetupSubmit(input: PlannerInput) {
    setSubmitting(true);
    try {
      await saveAndBuildPlan(input);
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleTopic(topic: PlannedTopic, done: boolean) {
    if (!state) return;
    const { completedTopicKeys, pendingVerificationKeys } = await markTopicComplete(topic.key, done);
    const nextState = { ...state, completedTopicKeys, pendingVerificationKeys };
    setState(nextState);
    setQuery<PlannerData>(PLANNER_KEY, { plan, state: nextState, pinned });
  }

  /** Bypasses every custom-configuration modal (subject/topic/subtopic pickers) — the Batch 2 "Trust, but Verify" loop launches straight into a scoped 10-question session on this exact topic. */
  function handleStartVerification(topic: PlannedTopic) {
    navigate('/practice', {
      state: { entry: 'verify', subjectLabel: topic.subjectName, topic: topic.topicTitle, plannerTopicKey: topic.key },
    });
  }

  if (asyncState.state !== 'success') {
    return (
      <KairoStateView
        state={asyncState.state === 'idle' ? 'loading' : asyncState.state}
        loadingMessage="Preparing your study plan…"
        slowMessage="Your plan is taking longer than usual."
        errorMessage="We couldn’t load your study plan."
        onRetry={() => void refresh()}
        onContinueOffline={() => { asyncState.succeed(); setScreen(plan ? 'home' : 'setup'); }}
      />
    );
  }

  if (screen === 'setup') {
    const kairo = getEngine();
    const profile = kairo?.profile;
    const allSubjects = getSubjects();
    const targetSubjectNames: string[] = profile?.targetSubjects ?? [];
    const allowedSubjectNames = getCourseSubjects(profile?.targetCourse, targetSubjectNames);
    const defaultSelectedSlugs = allSubjects.filter((s) => targetSubjectNames.includes(s.name)).map((s) => s.slug);
    const defaultTargetDateIso = profile?.examDate ? toLocalIso(new Date(profile.examDate)) : null;
    return (
      <PlannerSetup
        onBack={plan ? () => setScreen('home') : toHome}
        onSubmit={handleSetupSubmit}
        allSubjects={allSubjects}
        defaultSelectedSlugs={defaultSelectedSlugs}
        allowedSubjectNames={allowedSubjectNames}
        defaultTargetDateIso={defaultTargetDateIso}
        submitting={submitting}
      />
    );
  }

  if (screen === 'home' && plan && state) {
    return (
      <PlannerHome
        onBack={toHome}
        onAdjustPlan={() => setScreen('setup')}
        plan={plan}
        state={state}
        pinnedRecommendation={pinned}
        onToggleTopic={handleToggleTopic}
        onStartVerification={handleStartVerification}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg-canvas)' }}>
      <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Loading your plan…</div>
    </div>
  );
}
