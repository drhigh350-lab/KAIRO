import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IntroCarousel } from './IntroCarousel';
import { Welcome } from './Welcome';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';
import { AboutYou } from './AboutYou';
import { DiagnosticIntro } from './DiagnosticIntro';
import { DiagnosticQuiz } from './DiagnosticQuiz';
import { DiagnosticResults } from './DiagnosticResults';
import { AccountReady } from './AccountReady';
import { EnableNotifications } from './EnableNotifications';
import type { OnboardingData } from './data';
import {
  getEngine, beginOnboarding, submitOnboardingProfile, getDiagnosticQuestions, completeOnboardingFlow,
  type OnboardingKaiStep, type DiagnosticAnswer,
} from '../../lib/kairoEngine';
import type { EngineFlatQuestion } from '../../lib/engineAdapter';

type Screen = 'intro' | 'welcome' | 'signin' | 'signup' | 'about' | 'diagnosticIntro' | 'diagnosticQuiz' | 'diagnosticResults' | 'ready' | 'notifications';

// segmented indicator covers Sign Up -> Account Ready
const SEQ: Screen[] = ['signup', 'about', 'ready'];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  // GoogleAuthCallback already connected the engine and created the student row for a
  // first-time Google sign-in — land straight on 'about' with the real Google name instead
  // of re-showing intro/welcome/signup for someone who's already authenticated.
  const googleName = (location.state as { googleName?: string } | null)?.googleName;
  const [screen, setScreen] = useState<Screen>(googleName ? 'about' : 'intro');
  const [history, setHistory] = useState<Screen[]>([]);
  const [data, setData] = useState<OnboardingData>({ name: googleName || '', email: '', examDate: null, course: null, subjects: [] });
  const [diagnosticIntroStep, setDiagnosticIntroStep] = useState<OnboardingKaiStep>({});
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<EngineFlatQuestion[] | null>(null);
  const [diagnosticSummary, setDiagnosticSummary] = useState<{ total: number; correct: number; accuracy: number; message: string } | null>(null);
  const startedGoogleOnboarding = useRef(false);

  useEffect(() => {
    if (!googleName || startedGoogleOnboarding.current) return;
    startedGoogleOnboarding.current = true;
    beginOnboarding(googleName);
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
      if (prev) setScreen(prev);
      else if (googleName) navigate('/home', { replace: true });
      return n;
    });
  }

  const total = SEQ.length;
  const stepIndex = SEQ.indexOf(screen) + 1;

  let body: ReactNode = null;
  if (screen === 'intro') {
    body = <IntroCarousel onDone={() => go('welcome')} />;
  } else if (screen === 'welcome') {
    body = <Welcome onSignUp={() => go('signup')} onSignIn={() => go('signin')} />;
  } else if (screen === 'signin') {
    body = (
      <SignIn
        onBack={back}
        onSignedIn={() => {
          const profile = getEngine()?.profile;
          navigate('/home', {
            state: {
              name: profile?.name || data.name || 'there',
              course: profile?.targetCourse ? { name: profile.targetCourse, subjects: profile.targetSubjects || [] } : data.course,
              examDate: profile?.examDate ? new Date(profile.examDate).toISOString().slice(0, 10) : data.examDate,
              subjects: profile?.targetSubjects?.length ? profile.targetSubjects : data.subjects,
            },
          });
        }}
        onGoToSignUp={() => go('signup')}
      />
    );
  } else if (screen === 'signup') {
    body = (
      <SignUp
        step={stepIndex}
        total={total}
        onBack={back}
        onEmailSignUp={({ name, email }) => {
          setData((d) => ({ ...d, name, email }));
          beginOnboarding(name);
          go('about');
        }}
        onGoToSignIn={() => go('signin')}
      />
    );
  } else if (screen === 'about') {
    body = (
      <AboutYou
        step={stepIndex}
        total={total}
        onBack={back}
        data={data}
        setData={setData}
        onContinue={() => {
          const introStep = submitOnboardingProfile(data.course?.name ?? 'Not sure yet', data.examDate ?? '', data.subjects);
          setDiagnosticIntroStep(introStep);
          go('diagnosticIntro');
        }}
      />
    );
  } else if (screen === 'diagnosticIntro') {
    body = (
      <DiagnosticIntro
        title={diagnosticIntroStep.title}
        body={diagnosticIntroStep.body}
        loading={diagnosticLoading}
        error={diagnosticError}
        onContinue={() => {
          setDiagnosticLoading(true);
          setDiagnosticError(null);
          getDiagnosticQuestions(data.subjects)
            .then((questions) => {
              setDiagnosticLoading(false);
              if (questions.length === 0) {
                setDiagnosticError("Kairo couldn't find any questions to check in with just yet.");
                return;
              }
              setDiagnosticQuestions(questions);
              go('diagnosticQuiz');
            })
            .catch((err) => {
              setDiagnosticLoading(false);
              setDiagnosticError(err instanceof Error ? err.message : 'Could not load your check-in.');
            });
        }}
      />
    );
  } else if (screen === 'diagnosticQuiz' && diagnosticQuestions) {
    body = (
      <DiagnosticQuiz
        questions={diagnosticQuestions}
        onExit={() => navigate('/home')}
        onComplete={(answers: DiagnosticAnswer[]) => {
          completeOnboardingFlow(answers)
            .then(({ diagnosticSummary: summary }) => {
              setDiagnosticSummary(summary);
              go('diagnosticResults');
            })
            .catch(() => {
              // completeOnboarding() failed to build the real plan (e.g. content catalog load error) — the
              // answers themselves are still real, so show the genuine tally rather than inventing a summary.
              const correct = answers.filter((a) => a.correct).length;
              setDiagnosticSummary({
                total: answers.length,
                correct,
                accuracy: answers.length ? Math.round((correct / answers.length) * 100) : 0,
                message: "Kairo couldn't finish building your plan just now, but your answers are saved — we'll pick up from here.",
              });
              go('diagnosticResults');
            });
        }}
      />
    );
  } else if (screen === 'diagnosticResults' && diagnosticSummary) {
    body = <DiagnosticResults summary={diagnosticSummary} onContinue={() => go('ready')} />;
  } else if (screen === 'ready') {
    body = (
      <AccountReady
        step={stepIndex}
        total={total}
        onBack={back}
        data={data}
        onStart={() => go('notifications')}
      />
    );
  } else if (screen === 'notifications') {
    body = (
      <EnableNotifications
        onDone={() => navigate('/home', { state: { name: data.name, course: data.course, examDate: data.examDate, subjects: data.subjects } })}
      />
    );
  }

  return <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{body}</div>;
}
