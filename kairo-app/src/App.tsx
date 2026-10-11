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

// Splash ("/") and Onboarding ("/onboarding*") already call restoreSession()
// themselves before deciding where to go — this list is every *other*
// route, which previously never restored a session at all. The in-memory
// `engine` singleton in kairoEngine.ts is wiped on every real page reload,
// so a student who refreshed (or opened a bookmark/PWA shortcut) straight
// into /home, /profile, /review, etc. saw a genuinely empty, "signed
// out"-looking screen even though their Supabase auth session was still
// sitting in localStorage the whole time ��� this is what read as "my
// progress reset" / "I have to sign in again" on every refresh.
const ROUTES_NEEDING_RESTORE = ['/home', '/dashboard', '/practice', '/cbt', '/review', '/profile', '/leaderboard', '/challenges', '/learn', '/rapid-fire', '/planner', '/streak-savior', '/quiz-create', '/discover', '/arena'];

// Real multi-column desktop layouts exist only for these browsing/hub
// screens (see AppShell's `wide` prop). Exact matches, not prefixes:
// /practice and /cbt are single catch-all routes covering their whole
// internal step machine (hub *and* the focused question screen share one
// URL), so there's no way to tell them apart from the path alone — safer
// to leave both at the narrow, focused width everywhere than to risk a
// question screen rendering wide.
const WIDE_ROUTES = ['/home', '/dashboard', '/profile', '/review'];

/** Runs once per real page load — reconnects the engine to an existing Supabase session before any protected route renders, so a mid-app refresh never looks like a sign-out. */
function useBootRestore() {
  // Align this UI timeout with the real restore timeout budget in kairoEngine.ts.
  // The engine retries transient network failures twice, so the UI should allow
  // enough time for both attempts without looking stuck.
  const restoreState = useAsyncState('loading', 13_000);
  const [ready, setReady] = useState(() => {
    const needsRestore = ROUTES_NEEDING_RESTORE.some((p) => window.location.pathname.startsWith(p));
    return !needsRestore || !!getEngine();
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (ready) {
      restoreState.succeed();
      return;
    }
    let cancelled = false;
    restoreState.start();
    restoreSession().then((restored) => {
      if (!cancelled) {
        restoreState.succeed();
        setReady(true);
      }
      return restored;
    }).catch(() => {
      if (!cancelled) restoreState.fail();
    });
    return () => {
      cancelled = true;
    };
    // Intentionally empty deps — this only ever needs to run once, against
    // whatever path the browser actually loaded, not on every client-side
    // route change (the in-memory engine survives those just fine).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  return { ready, state: restoreState.state, retry: () => { setReady(false); restoreState.retry(); setRetryCount((count) => count + 1); } };
}

/**
 * Guards every route that assumes a signed-in, fully onboarded student —
 * by the time this renders, useBootRestore() above has already attempted
 * restoreSession() for the current path, so this only needs to read the
 * resulting state, never re-run the restore itself. Previously every
 * route below rendered unconditionally: a signed-out visitor hitting
 * /home directly saw a real (blank) dashboard instead of a boundary, and
 * a signed-in student who never finished onboarding (no targetSubjects
 * set yet) landed on the same blank Home rather than being sent back to
 * pick up onboarding where they left off.
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

  // The other half of "when the app detects an online state and executes
  // the daily sync/init" (setupOnlineSync's own online-event listener
  // covers an offline->online transition mid-session) — a normal boot
  // that's already online, once the engine is actually signed in and
  // ready rather than racing restoreSession() above.
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
          {/* Real, dedicated, indexable auth routes — Sign In/Sign Up used
              to be internal screen states inside OnboardingFlow, reachable
              only via /onboarding, which meant there was never a stable
              /login or /signup URL of its own to deep-link, bookmark, or
              list in the sitemap. */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/onboarding/google" element={<GoogleAuthCallback />} />
          <Route path="/onboarding/reset-password" element={<ResetPasswordCallback />} />
          {/* Protected: the post-signup profile-setup flow only, not a
              general-purpose auth gateway anymore (see OnboardingFlow's
              own doc comment). */}
          <Route path="/onboarding/*" element={<OnboardingFlow />} />
          {/* Public Arena entry: guests can open a shared match link, create a temporary session, and play before registering. */}
          <Route path="/arena/challenge/:challengeId" element={<ChallengesFlow />} />

          <Route element={<RequireOnboarded />}>
            <Route element={<AppTabs />}>
              <Route path="/home" element={<HomeDashboard />} />
              {/* /dashboard is the canonical name going forward — /home stays
                  live indefinitely as an alias (existing bookmarks, already-
                  sent push/email deep links, nothing regresses). */}
              <Route path="/dashboard" element={<HomeDashboard />} />
              <Route path="/practice/*" element={<PracticeFlow />} />
              <Route path="/cbt/*" element={<CbtFlow />} />
              <Route path="/review" element={<Review />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/notifications" element={<NotificationSettings />} />
            <Route path="/profile/leaderboard" element={<Leaderboard />} />
            {/* Top-level alias — same reasoning as /dashboard above; a
                strategic section deserves a stable URL of its own instead
                of only ever living nested under /profile. */}
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
            {/* Outside AppTabs — a focused, binary-choice interstitial has
                no business showing the bottom nav (Batch 4's Streak Savior). */}
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
