import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { AppTabs } from './layout/AppTabs';
import { Splash } from './features/splash/Splash';
import { KairoStateView, useAsyncState } from './components/feedback/AsyncState';

// Every screen is its own chunk so the first paint only downloads the shell
// + the screen actually being opened, instead of the entire app (~1.2 MB).
function lazyNamed<M extends Record<string, unknown>, K extends keyof M>(load: () => Promise<M>, name: K) {
  return lazy(() => load().then((m) => ({ default: m[name] as ComponentType })));
}

const loadOnboarding = () => import('./features/onboarding/OnboardingFlow');
const loadLogin = () => import('./features/onboarding/LoginPage');
const loadSignup = () => import('./features/onboarding/SignupPage');
const loadHome = () => import('./features/home/HomeDashboard');
const loadPractice = () => import('./features/practice/PracticeFlow');
const loadCbt = () => import('./features/cbt/CbtFlow');
const loadReview = () => import('./features/review/Review');
const loadProfile = () => import('./features/profile/Profile');

const OnboardingFlow = lazyNamed(loadOnboarding, 'OnboardingFlow');
const LoginPage = lazyNamed(loadLogin, 'LoginPage');
const SignupPage = lazyNamed(loadSignup, 'SignupPage');
const GoogleAuthCallback = lazyNamed(() => import('./features/onboarding/GoogleAuthCallback'), 'GoogleAuthCallback');
const ResetPasswordCallback = lazyNamed(() => import('./features/onboarding/ResetPassword'), 'ResetPasswordCallback');
const PrivacyPage = lazyNamed(() => import('./features/legal/PrivacyPage'), 'PrivacyPage');
const TermsPage = lazyNamed(() => import('./features/legal/TermsPage'), 'TermsPage');
const HomeDashboard = lazyNamed(loadHome, 'HomeDashboard');
const PracticeFlow = lazyNamed(loadPractice, 'PracticeFlow');
const CbtFlow = lazyNamed(loadCbt, 'CbtFlow');
const Review = lazyNamed(loadReview, 'Review');
const Profile = lazyNamed(loadProfile, 'Profile');
const EditProfile = lazyNamed(() => import('./features/profile/EditProfile'), 'EditProfile');
const NotificationSettings = lazyNamed(() => import('./features/profile/NotificationSettings'), 'NotificationSettings');
const Leaderboard = lazyNamed(() => import('./features/profile/Leaderboard'), 'Leaderboard');
const ChallengesFlow = lazyNamed(() => import('./features/challenges/ChallengesFlow'), 'ChallengesFlow');
const CreateQuizFlow = lazyNamed(() => import('./features/quiz-create/CreateQuizFlow'), 'CreateQuizFlow');
const MyQuizzesScreen = lazyNamed(() => import('./features/quiz-create/MyQuizzesScreen'), 'MyQuizzesScreen');
const DiscoverScreen = lazyNamed(() => import('./features/quiz-create/DiscoverScreen'), 'DiscoverScreen');
const ArenaHomeScreen = lazyNamed(() => import('./features/quiz-create/ArenaHomeScreen'), 'ArenaHomeScreen');
const LearnLesson = lazyNamed(() => import('./features/learn/LearnLesson'), 'LearnLesson');
const LearnHome = lazyNamed(() => import('./features/learn/LearnHome'), 'LearnHome');
const RapidFireFlow = lazyNamed(() => import('./features/rapidfire/RapidFireFlow'), 'RapidFireFlow');
const PlannerFlow = lazyNamed(() => import('./features/planner/PlannerFlow'), 'PlannerFlow');
const StreakSavior = lazyNamed(() => import('./features/home/StreakSavior'), 'StreakSavior');
const NotificationCenter = lazyNamed(() => import('./features/notifications/NotificationCenter'), 'NotificationCenter');

const loadSecondaryScreens = [
  () => import('./features/quiz-create/ArenaHomeScreen'),
  () => import('./features/planner/PlannerFlow'),
  () => import('./features/learn/LearnHome'),
  () => import('./features/learn/LearnLesson'),
  () => import('./features/challenges/ChallengesFlow'),
  () => import('./features/rapidfire/RapidFireFlow'),
  () => import('./features/profile/Leaderboard'),
  () => import('./features/quiz-create/DiscoverScreen'),
  () => import('./features/quiz-create/CreateQuizFlow'),
  () => import('./features/quiz-create/MyQuizzesScreen'),
  () => import('./features/profile/EditProfile'),
  () => import('./features/profile/NotificationSettings'),
  () => import('./features/home/StreakSavior'),
];

function whenIdle(run: () => void, fallbackMs: number) {
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(run, { timeout: fallbackMs * 2 });
  else setTimeout(run, fallbackMs);
}

/** Warms every screen's code (core tabs first, then the rest) plus the data behind the most-visited ones, so tapping anything from Home opens instantly. */
function prefetchScreens(signedIn: boolean) {
  const core = signedIn
    ? [loadHome, loadPractice, loadReview, loadProfile, loadCbt]
    : [loadLogin, loadSignup, loadOnboarding];
  whenIdle(() => {
    core.forEach((load) => load().catch(() => {}));
    if (!signedIn) return;
    whenIdle(() => {
      loadSecondaryScreens.forEach((load) => load().catch(() => {}));
      import('./lib/screenQueries').then((m) => m.prefetchScreenData()).catch(() => {});
    }, 800);
  }, 600);
}

function RouteFallback() {
  return <div aria-busy="true" style={{ minHeight: '60dvh' }} />;
}
import { getEngine, isOnboarded, restoreSession, setupOnlineSync, triggerRecommendationPrefetch } from './lib/kairoEngine';

// Local-first boot: if a saved student/session is already present on this device,
// render the app immediately and let Supabase refresh happen in the background
// instead of blocking the shell behind a full remote restore. Many apps behave
// this way: trust the local cache first, then quietly sync.
function hasLocalSession(): boolean {
  if (typeof window === 'undefined') return false;
  const storage = window.localStorage;
  const savedStudentId = storage.getItem('kairo:last_student_id');
  if (savedStudentId) return true;

  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key) continue;
    if (key.startsWith('sb-') || key.includes('supabase') || key.includes('kairo')) {
      return true;
    }
  }

  return false;
}

const ROUTES_NEEDING_RESTORE = ['/home', '/dashboard', '/practice', '/cbt', '/review', '/profile', '/leaderboard', '/challenges', '/learn', '/rapid-fire', '/planner', '/streak-savior', '/quiz-create', '/discover', '/arena'];
const WIDE_ROUTES = ['/home', '/dashboard', '/profile', '/review'];

/** Runs once per real page load — reconnects the engine to an existing Supabase session before any protected route renders, so a mid-app refresh never looks like a sign-out. */
function useBootRestore() {
  const restoreState = useAsyncState('loading', 13_000);
  const [ready, setReady] = useState(() => {
    const needsRestore = ROUTES_NEEDING_RESTORE.some((p) => window.location.pathname.startsWith(p));
    return !needsRestore || !!getEngine() || hasLocalSession();
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (ready) {
      restoreState.succeed();
      return;
    }

    let cancelled = false;
    restoreState.start();

    void restoreSession().then((restored) => {
      if (cancelled) return;
      if (restored || hasLocalSession()) {
        setReady(true);
        restoreState.succeed();
        return;
      }
      restoreState.fail();
    }).catch(() => {
      if (!cancelled && hasLocalSession()) {
        setReady(true);
        restoreState.succeed();
        return;
      }
      if (!cancelled) restoreState.fail();
    });

    return () => {
      cancelled = true;
    };
    // Intentionally empty deps — this only ever needs to run once, against
    // whatever path the browser actually loaded, not on every client-side
    // route change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  return {
    ready,
    state: restoreState.state,
    retry: () => {
      setReady(false);
      restoreState.retry();
      setRetryCount((count) => count + 1);
    },
  };
}

/**
 * Guards every route that assumes a signed-in, fully onboarded student —
 * the local cache is trusted first, and the secure network restore continues
 * in the background instead of blocking the app shell.
 */
function RequireOnboarded() {
  if (!getEngine()) {
    return <Navigate to="/login" replace />;
  }
  if (!isOnboarded()) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}

export default function App() {
  const boot = useBootRestore();
  const { ready } = boot;
  const location = useLocation();
  const wide = WIDE_ROUTES.includes(location.pathname);

  useEffect(() => {
    setupOnlineSync();
  }, []);

  // Once the app shell is actually ready, let the heavier data sync happen
  // in the background instead of making the first paint wait on it.
  useEffect(() => {
    if (ready && getEngine()) triggerRecommendationPrefetch();
    if (ready) prefetchScreens(!!getEngine());
  }, [ready]);

  return (
    <AppShell wide={wide}>
      {ready && (
        <Suspense fallback={null}>
          <NotificationCenter />
        </Suspense>
      )}
      {ready ? (
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/onboarding/google" element={<GoogleAuthCallback />} />
            <Route path="/onboarding/reset-password" element={<ResetPasswordCallback />} />
            <Route path="/onboarding/*" element={<OnboardingFlow />} />
            <Route path="/arena/challenge/:challengeId" element={<ChallengesFlow />} />

            <Route element={<RequireOnboarded />}>
              <Route element={<AppTabs />}>
                <Route path="/home" element={<HomeDashboard />} />
                <Route path="/dashboard" element={<HomeDashboard />} />
                <Route path="/practice/*" element={<PracticeFlow />} />
                <Route path="/cbt/*" element={<CbtFlow />} />
                <Route path="/review" element={<Review />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/profile/notifications" element={<NotificationSettings />} />
              <Route path="/profile/leaderboard" element={<Leaderboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/challenges/*" element={<ChallengesFlow />} />
              <Route path="/quiz-create" element={<CreateQuizFlow />} />
              <Route path="/quiz-create/my-quizzes" element={<MyQuizzesScreen />} />
              <Route path="/discover" element={<DiscoverScreen />} />
              <Route path="/arena" element={<ArenaHomeScreen />} />
              <Route path="/learn" element={<LearnHome />} />
              <Route path="/learn/:conceptId" element={<LearnLesson />} />
              <Route path="/rapid-fire" element={<RapidFireFlow />} />
              <Route path="/planner/*" element={<PlannerFlow />} />
              <Route path="/streak-savior" element={<StreakSavior />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      ) : (
        <KairoStateView
          state={boot.state === 'idle' || boot.state === 'success' ? 'loading' : boot.state}
          loadingMessage="Restoring your KAIRO session…"
          slowMessage="Session restoration is taking longer than usual."
          errorMessage="We couldn’t restore your session right now."
          offlineMessage="You’re offline. Your saved progress is safe on this device."
          onRetry={boot.retry}
          onContinueOffline={() => setTimeout(() => window.location.assign('/login'), 0)}
        />
      )}
    </AppShell>
  );
}
