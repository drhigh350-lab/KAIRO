import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KairoStateView, useAsyncState } from '../../components';
import { PlannerSetup } from './PlannerSetup';
import { PlannerHome } from './PlannerHome';
import { getSubjects } from '../../lib/planner/syllabus';
import { toLocalIso, type PlannedTopic, type PlannerInput, type PlannerPlan } from '../../lib/planner/plannerEngine';
import { loadCurrentPlan, saveAndBuildPlan, markTopicComplete, getPinnedRecommendation, type PlannerState, type DueTopic } from '../../lib/planner/plannerApi';
import { getEngine } from '../../lib/kairoEngine';
import { getCourseSubjects } from '../../lib/subjectScope';

type Screen = 'loading' | 'setup' | 'home';

/** Controller for the Study Planner: setup (once) -> home (weekly checklist + Batch 3's pinned recommendation), mirroring the simple screen-stack pattern CbtFlow/RapidFireFlow already use. */
export function PlannerFlow() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('loading');
  const [plan, setPlan] = useState<PlannerPlan | null>(null);
  const [state, setState] = useState<PlannerState | null>(null);
  const [pinned, setPinned] = useState<DueTopic | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const requestId = useRef(0);
  const asyncState = useAsyncState('loading');

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    asyncState.start();
    try {
      const current = await loadCurrentPlan();
      if (currentRequest !== requestId.current) return;
      if (!current) {
        setPlan(null);
        setState(null);
        setPinned(null);
        setScreen('setup');
        asyncState.succeed();
        return;
      }
      setPlan(current.plan);
      setState(current.state);
      const recommendation = await getPinnedRecommendation();
      if (currentRequest !== requestId.current) return;
      setPinned(recommendation);
      setScreen('home');
      asyncState.succeed();
    } catch {
      if (currentRequest === requestId.current) asyncState.fail();
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
    setState({ ...state, completedTopicKeys, pendingVerificationKeys });
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
