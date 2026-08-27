import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { AppTabs } from './layout/AppTabs';
import { Splash } from './features/splash/Splash';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { LoginPage } from './features/onboarding/LoginPage';
import { SignupPage } from './features/onboarding/SignupPage';
import { GoogleAuthCallback } from './features/onboarding/GoogleAuthCallback';
import { ResetPasswordCallback } from './features/onboarding/ResetPassword';
import { PrivacyPage } from './features/legal/PrivacyPage';
import { TermsPage } from './features/legal/TermsPage';
import { HomeDashboard } from './features/home/HomeDashboard';
import { PracticeFlow } from './features/practice/PracticeFlow';
import { CbtFlow } from './features/cbt/CbtFlow';
import { Review } from './features/review/Review';
import { Profile } from './features/profile/Profile';
import { EditProfile } from './features/profile/EditProfile';
import { NotificationSettings } from './features/profile/NotificationSettings';
import { Leaderboard } from './features/profile/Leaderboard';
import { ChallengesFlow } from './features/challenges/ChallengesFlow';
import { LearnLesson } from './features/learn/LearnLesson';
import { LearnHome } from './features/learn/LearnHome';
import { RapidFireFlow } from './features/rapidfire/RapidFireFlow';
import { PlannerFlow } from './features/planner/PlannerFlow';
import { StreakSavior } from './features/home/StreakSavior';
import { NotificationCenter } from './features/notifications/NotificationCenter';
import { KairoMark } from './components';
import { getEngine, isOnboarded, restoreSession, setupOnlineSync, triggerRecommendationPrefetch } from './lib/kairoEngine';

// Splash ("/") and Onboarding ("/onboarding*") already call restoreSession()
// themselves before deciding where to go — this list is every *other*
// route, which previously never restored a session at all. The in-memory
// `engine` singleton in kairoEngine.ts is wiped on every real page reload,
// so a student who refreshed (or opened a bookmark/PWA shortcut) straight
// into /home, /profile, /review, etc. saw a genuinely empty, "signed
// out"-looking screen even though their Supabase auth session was still
// sitting in localStorage the whole time — this is what read as "my
// progress reset" / "I have to sign in again" on every refresh.
const ROUTES_NEEDING_RESTORE = ['/home', '/dashboard', '/practice', '/cbt', '/review', '/profile', '/leaderboard', '/challenges', '/learn', '/rapid-fire', '/planner', '/streak-savior'];

// Real multi-column desktop layouts exist only for these browsing/hub
// screens (see AppShell's `wide` prop). Exact matches, not prefixes:
// /practice and /cbt are single catch-all routes covering their whole
// internal step machine (hub *and* the focused question screen share one
// URL), so there's no way to tell them apart from the path alone — safer
// to leave both at the narrow, focused width everywhere than to risk a
// question screen rendering wide.
const WIDE_ROUTES = ['/home', '/dashboard', '/profile', '/review'];

/** Runs once per real page load — reconnects the engine to an existing Supabase session before any protected route renders, so a mid-app refresh never looks like a sign-out. */
function useBootRestore(): boolean {
  const [ready, setReady] = useState(() => {
    const needsRestore = ROUTES_NEEDING_RESTORE.some((p) => window.location.pathname.startsWith(p));
    return !needsRestore || !!getEngine();
  });

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    restoreSession().catch(() => false).finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
    // Intentionally empty deps — this only ever needs to run once, against
    // whatever path the browser actually loaded, not on every client-side
    // route change (the in-memory engine survives those just fine).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ready;
}

function BootScreen() {
  return (
    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg-canvas)' }}>
      <KairoMark tone="white" size={44} />
    </div>
  );
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
  const ready = useBootRestore();
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
      {ready && <NotificationCenter />}
      {ready ? (
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
      ) : (
        <BootScreen />
      )}
    </AppShell>
  );
}
