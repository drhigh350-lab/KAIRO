import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { AppTabs } from './layout/AppTabs';
import { Splash } from './features/splash/Splash';
import { LoginPage } from './features/onboarding/LoginPage';
import { SignupPage } from './features/onboarding/SignupPage';
import { GoogleAuthCallback } from './features/onboarding/GoogleAuthCallback';
import { ResetPasswordCallback } from './features/onboarding/ResetPassword';
import { KairoStateView, useAsyncState } from './components/feedback/AsyncState';
import { getEngine, isOnboarded, restoreSession, setupOnlineSync, triggerRecommendationPrefetch } from './lib/kairoEngine';

// Code-splitting: every screen below used to be imported eagerly, so the
// browser had to download and parse the entire app — Practice, CBT, the
// whole Quiz Arena, Learn, Planner, Challenges, charts, and each screen's
// own dependencies — before it could paint even the splash or a login form.
// On a mid-range phone over a Nigerian mobile connection that's the "takes
// forever to load" the students feel. Only the boot/auth surface (Splash,
// Login, Signup, the OAuth/reset callbacks) stays eager; everything a
// signed-in student reaches is loaded on demand, in its own chunk, the
// first time its route is visited. The named exports are adapted to the
// default-export shape React.lazy expects.
const OnboardingFlow = lazy(() => import('./features/onboarding/OnboardingFlow').then((m) => ({ default: m.OnboardingFlow })));
const PrivacyPage = lazy(() => import('./features/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./features/legal/TermsPage').then((m) => ({ default: m.TermsPage })));
const HomeDashboard = lazy(() => import('./features/home/HomeDashboard').then((m) => ({ default: m.HomeDashboard })));
const PracticeFlow = lazy(() => import('./features/practice/PracticeFlow').then((m) => ({ default: m.PracticeFlow })));
const CbtFlow = lazy(() => import('./features/cbt/CbtFlow').then((m) => ({ default: m.CbtFlow })));
const Review = lazy(() => import('./features/review/Review').then((m) => ({ default: m.Review })));
const Profile = lazy(() => import('./features/profile/Profile').then((m) => ({ default: m.Profile })));
const EditProfile = lazy(() => import('./features/profile/EditProfile').then((m) => ({ default: m.EditProfile })));
const NotificationSettings = lazy(() => import('./features/profile/NotificationSettings').then((m) => ({ default: m.NotificationSettings })));
const Leaderboard = lazy(() => import('./features/profile/Leaderboard').then((m) => ({ default: m.Leaderboard })));
const ChallengesFlow = lazy(() => import('./features/challenges/ChallengesFlow').then((m) => ({ default: m.ChallengesFlow })));
const CreateQuizFlow = lazy(() => import('./features/quiz-create/CreateQuizFlow').then((m) => ({ default: m.CreateQuizFlow })));
const MyQuizzesScreen = lazy(() => import('./features/quiz-create/MyQuizzesScreen').then((m) => ({ default: m.MyQuizzesScreen })));
const DiscoverScreen = lazy(() => import('./features/quiz-create/DiscoverScreen').then((m) => ({ default: m.DiscoverScreen })));
const ArenaHomeScreen = lazy(() => import('./features/quiz-create/ArenaHomeScreen').then((m) => ({ default: m.ArenaHomeScreen })));
const LearnLesson = lazy(() => import('./features/learn/LearnLesson').then((m) => ({ default: m.LearnLesson })));
const LearnHome = lazy(() => import('./features/learn/LearnHome').then((m) => ({ default: m.LearnHome })));
const RapidFireFlow = lazy(() => import('./features/rapidfire/RapidFireFlow').then((m) => ({ default: m.RapidFireFlow })));
const PlannerFlow = lazy(() => import('./features/planner/PlannerFlow').then((m) => ({ default: m.PlannerFlow })));
const StreakSavior = lazy(() => import('./features/home/StreakSavior').then((m) => ({ default: m.StreakSavior })));
const NotificationCenter = lazy(() => import('./features/notifications/NotificationCenter').then((m) => ({ default: m.NotificationCenter })));

// Splash ("/") and Onboarding ("/onboarding*") already call restoreSession()
// themselves before deciding where to go — this list is every *other*
// route, which previously never restored a session at all. The in-memory
// `engine` singleton in kairoEngine.ts is wiped on every real page reload,
// so a student who refreshed (or opened a bookmark/PWA shortcut) straight
// into /home, /profile, /review, etc. saw a genuinely empty, "signed
// out"-looking screen even though their Supabase auth session was still
// sitting in localStorage the whole time — this is what read as "my
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
  const restoreState = useAsyncState('loading', 9000);
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
  }, [ready]);

  return (
    <AppShell wide={wide}>
      {ready && (
        <Suspense fallback={null}>
          <NotificationCenter />
        </Suspense>
      )}
      {ready ? (
        <Suspense
          fallback={
            <KairoStateView
              state="loading"
              loadingMessage="Loading…"
            />
          }
        >
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
