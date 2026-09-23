import { useEffect, useRef, useState, type ReactNode } from 'react';
import { KairoStateView, useAsyncState } from '../../components/feedback/AsyncState';
import { useNavigate, useLocation } from 'react-router-dom';
import { AboutYou } from './AboutYou';
import { DiagnosticIntro } from './DiagnosticIntro';
import { DiagnosticQuiz } from './DiagnosticQuiz';
import { DiagnosticResults } from './DiagnosticResults';
import { AccountReady } from './AccountReady';
import { EnableNotifications } from './EnableNotifications';
import type { OnboardingData } from './data';
import {
  getEngine, beginOnboarding, submitOnboardingProfile, getDiagnosticQuestions, completeOnboardingFlow,
  restoreSession, isOnboarded,
  type OnboardingKaiStep, type DiagnosticAnswer,
} from '../../lib/kairoEngine';
import type { EngineFlatQuestion } from '../../lib/engineAdapter';

type Screen = 'about' | 'ready' | 'diagnosticIntro' | 'diagnosticQuiz' | 'diagnosticResults' | 'notifications';

/**
 * The protected post-signup profile-setup flow (UTME subjects, target
 * course, exam date, then the real diagnostic) — reached only from a
 * fresh /signup or /login (Sign In / Sign Up now live at their own
 * routes; see LoginPage.tsx/SignupPage.tsx), a first-time Google sign-in,
 * or a legacy account that authenticated but never finished this. Never
 * shown to a signed-out visitor — there's no profile-setup data to carry
 * without a real account behind it.
 */
export function OnboardingFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const routerState = location.state as { googleName?: string; name?: string; email?: string } | null;
  // GoogleAuthCallback, LoginPage, and SignupPage each already connected the
  // engine (and, for Google's first-time case, called beginOnboarding())
  // before navigating here — trust that and skip the restoreSession()
  // re-check entirely for a fresh arrival, rather than reconnecting a
  // second time and re-fetching the row we just wrote.
  const googleName = routerState?.googleName;
  const freshName = routerState?.name;
  const freshEntry = !!googleName || !!freshName;
  const [screen, setScreen] = useState<Screen>('about');
  const [history, setHistory] = useState<Screen[]>([]);
  const [data, setData] = useState<OnboardingData>({ name: googleName || freshName || '', email: routerState?.email || '', examDate: null, course: null, subjects: [] });
  const [diagnosticIntroStep, setDiagnosticIntroStep] = useState<OnboardingKaiStep>({});
  const diagnosticQuestionsState = useAsyncState('idle', 7000);
  const diagnosticCompletionState = useAsyncState('idle', 10000);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<EngineFlatQuestion[] | null>(null);
  const [diagnosticEmpty, setDiagnosticEmpty] = useState(false);
  const diagnosticRequest = useRef(0);
  const diagnosticCompletionRequest = useRef(0);
  const lastDiagnosticAnswers = useRef<DiagnosticAnswer[]>([]);
  const mounted = useRef(true);
  const [diagnosticSummary, setDiagnosticSummary] = useState<{ total: number; correct: number; accuracy: number; message: string } | null>(null);
  const [diagnosticPointsEarned, setDiagnosticPointsEarned] = useState(0);
  const startedGoogleOnboarding = useRef(false);
  // A fresh arrival (Google/Login/Signup) means nothing to restore/recheck.
  // Any other arrival (a stale bookmark, back-navigation, a direct link, or
  // a real page refresh mid-flow) needs that ruled out first — it might
  // belong to a signed-out visitor (no /onboarding for them at all — send
  // them to /signup) or an already fully onboarded student (send them to
  // /dashboard instead of showing this again).
  const [checkingExisting, setCheckingExisting] = useState(!freshEntry);

  useEffect(() => {
    if (!googleName || startedGoogleOnboarding.current) return;
    startedGoogleOnboarding.current = true;
    beginOnboarding(googleName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  useEffect(() => {
    if (freshEntry) return;
    let cancelled = false;
    restoreSession().catch(() => false).then((restored) => {
      if (cancelled) return;
      if (!restored) {
        navigate('/signup', { replace: true });
        return;
      }
      if (isOnboarded()) {
        navigate('/dashboard', { replace: true });
        return;
      }
      // Signed in (a refresh mid-flow, or a legacy account) but not
      // onboarded yet — exactly what this route is for. Seed `data` from
      // whatever's actually saved on the account (survives a refresh;
      // router state does not) rather than requiring a fresh navigation.
      const profile = getEngine()?.profile;
      setData((d) => ({
        ...d,
        name: profile?.name || d.name,
        email: profile?.email || d.email,
        course: profile?.targetCourse ? { name: profile.targetCourse, subjects: profile.targetSubjects || [] } : d.course,
        examDate: profile?.examDate ? new Date(profile.examDate).toISOString().slice(0, 10) : d.examDate,
        subjects: profile?.targetSubjects?.length ? profile.targetSubjects : d.subjects,
      }));
      setCheckingExisting(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(next: Screen) {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  }
  function back() {
    setHistory((h) => {
      const n = [...h];
      const prev = n.pop();
      if (prev) {
        setScreen(prev);
      } else if (googleName) {
        // Nothing earlier in this flow — Google's first-time entry has no
        // signup form of its own to return to.
        navigate('/dashboard', { replace: true });
      } else {
        // The account already exists by this point (signUpAndConnect()
        // already ran) — this is "let me reconsider", not a real second
        // signup attempt. SignUp's own isAlreadyRegistered() handling
        // covers the edge case of resubmitting the same email anyway.
        navigate('/signup');
      }
      return n;
    });
  }

  async function loadDiagnosticQuestions() {
    const requestId = ++diagnosticRequest.current;
    if (!diagnosticQuestionsState.isOnline) {
      diagnosticQuestionsState.setState('offline');
      return;
    }
    diagnosticQuestionsState.start();
    try {
      const questions = await getDiagnosticQuestions(data.subjects);
      if (!mounted.current || requestId !== diagnosticRequest.current) return;
      if (questions.length === 0) {
        setDiagnosticEmpty(true);
        diagnosticQuestionsState.succeed();
        return;
      }
      setDiagnosticEmpty(false);
      setDiagnosticQuestions(questions);
      diagnosticQuestionsState.succeed();
      go('diagnosticQuiz');
    } catch {
      if (mounted.current && requestId === diagnosticRequest.current) diagnosticQuestionsState.fail();
    }
  }

  async function completeDiagnostic(answers: DiagnosticAnswer[]) {
    const requestId = ++diagnosticCompletionRequest.current;
    if (!diagnosticCompletionState.isOnline) {
      diagnosticCompletionState.setState('offline');
      return;
    }
    diagnosticCompletionState.start();
    try {
      const { diagnosticSummary: summary, pointsEarned } = await completeOnboardingFlow(answers);
      if (!mounted.current || requestId !== diagnosticCompletionRequest.current) return;
      setDiagnosticSummary(summary);
      setDiagnosticPointsEarned(pointsEarned);
      diagnosticCompletionState.succeed();
      go('diagnosticResults');
    } catch {
      if (!mounted.current || requestId !== diagnosticCompletionRequest.current) return;
      const correct = answers.filter((a) => a.correct).length;
      setDiagnosticSummary({
        total: answers.length,
        correct,
        accuracy: answers.length ? Math.round((correct / answers.length) * 100) : 0,
        message: "Kairo couldn't finish building your plan just now, but your answers are saved — we'll pick up from here.",
      });
      setDiagnosticPointsEarned(0);
      diagnosticCompletionState.fail();
    }
  }

  function showDiagnosticTally() {
    const answers = lastDiagnosticAnswers.current;
    const correct = answers.filter((a) => a.correct).length;
    setDiagnosticSummary({
      total: answers.length,
      correct,
      accuracy: answers.length ? Math.round((correct / answers.length) * 100) : 0,
      message: "Kairo couldn't finish building your plan just now, but your answers are saved — we'll pick up from here.",
    });
    setDiagnosticPointsEarned(0);
    diagnosticCompletionState.succeed();
    go('diagnosticResults');
  }

  const total = 3;
  // Step 1 is /signup's own screen — this flow only ever renders steps 2-3.
  const stepIndex = screen === 'about' ? 2 : screen === 'ready' ? 3 : 0;

  if (checkingExisting) {
    return <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} />;
  }

  let body: ReactNode = null;
  if (screen === 'about') {
    body = (
      <AboutYou
        step={stepIndex}
        total={total}
        onBack={back}
        data={data}
        setData={setData}
        onContinue={() => {
          // Saves name/course/exam date/subjects to the account immediately
          // (submitOnboardingProfile) and fetches Kai's real diagnostic-intro
          // copy now, so it's ready by the time the student reaches that
          // screen — but the profile card (AccountReady) comes first, right
          // after entering this info, so a student can review/correct it
          // before ever sitting the diagnostic.
          const introStep = submitOnboardingProfile(data.course?.name ?? 'Not sure yet', data.examDate ?? '', data.subjects);
          setDiagnosticIntroStep(introStep);
          go('ready');
        }}
      />
    );
  } else if (screen === 'ready') {
    body = (
      <AccountReady
        step={stepIndex}
        total={total}
        onBack={back}
        onEdit={() => go('about')}
        data={data}
        onStart={() => go('diagnosticIntro')}
      />
    );
  } else if (screen === 'diagnosticIntro') {
    body = (
      <DiagnosticIntro
        title={diagnosticIntroStep.title}
        body={diagnosticIntroStep.body}
        state={diagnosticQuestionsState.state}
        empty={diagnosticEmpty}
        onRetry={() => void loadDiagnosticQuestions()}
        onContinue={() => void loadDiagnosticQuestions()}
        onContinueOffline={() => diagnosticQuestionsState.succeed()}
      />
    );
  } else if (screen === 'diagnosticQuiz' && diagnosticQuestions) {
    body = diagnosticCompletionState.state !== 'idle' && diagnosticCompletionState.state !== 'success' ? (
      <KairoStateView
        state={diagnosticCompletionState.state}
        loadingMessage="Saving your diagnostic results…"
        slowMessage="Your diagnostic is ready, but saving it is taking longer than usual."
        errorMessage="Kairo could not finish saving your diagnostic."
        offlineMessage="Your diagnostic answers are saved on this device."
        onRetry={() => void completeDiagnostic(lastDiagnosticAnswers.current)}
        onContinueOffline={showDiagnosticTally}
      />
    ) : (
      <DiagnosticQuiz
        questions={diagnosticQuestions}
        onExit={() => navigate('/dashboard')}
        onComplete={(answers: DiagnosticAnswer[]) => {
          lastDiagnosticAnswers.current = answers;
          void completeDiagnostic(answers);
        }}
      />
    );
  } else if (screen === 'diagnosticResults' && diagnosticSummary) {
    body = <DiagnosticResults summary={diagnosticSummary} pointsEarned={diagnosticPointsEarned} onContinue={() => go('notifications')} />;
  } else if (screen === 'notifications') {
    body = (
      <EnableNotifications
        onDone={() => navigate('/dashboard', { state: { name: data.name, course: data.course, examDate: data.examDate, subjects: data.subjects } })}
      />
    );
  }

  return <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{body}</div>;
}
