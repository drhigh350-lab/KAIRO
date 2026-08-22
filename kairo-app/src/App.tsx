import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { AppTabs } from './layout/AppTabs';
import { Splash } from './features/splash/Splash';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { GoogleAuthCallback } from './features/onboarding/GoogleAuthCallback';
import { HomeDashboard } from './features/home/HomeDashboard';
import { PracticeFlow } from './features/practice/PracticeFlow';
import { CbtFlow } from './features/cbt/CbtFlow';
import { Review } from './features/review/Review';
import { ReviewSession } from './features/review/ReviewSession';
import { Insights } from './features/insights/Insights';
import { Profile } from './features/profile/Profile';
import { EditProfile } from './features/profile/EditProfile';
import { NotificationSettings } from './features/profile/NotificationSettings';
import { Leaderboard } from './features/profile/Leaderboard';
import { ChallengesFlow } from './features/challenges/ChallengesFlow';
import { LearnLesson } from './features/learn/LearnLesson';
import { LearnHome } from './features/learn/LearnHome';
import { RapidFireFlow } from './features/rapidfire/RapidFireFlow';
import { NotificationCenter } from './features/notifications/NotificationCenter';
import { KairoMark } from './components';
import { getEngine, isOnboarded, restoreSession, setupOnlineSync } from './lib/kairoEngine';

// Splash ("/") and Onboarding ("/onboarding*") already call restoreSession()
// themselves before deciding where to go — this list is every *other*
// route, which previously never restored a session at all. The in-memory
// `engine` singleton in kairoEngine.ts is wiped on every real page reload,
// so a student who refreshed (or opened a bookmark/PWA shortcut) straight
// into /home, /profile, /review, etc. saw a genuinely empty, "signed
// out"-looking screen even though their Supabase auth session was still
// sitting in localStorage the whole time — this is what read as "my
// progress reset" / "I have to sign in again" on every refresh.
const ROUTES_NEEDING_RESTORE = ['/home', '/practice', '/cbt', '/review', '/insights', '/profile', '/challenges', '/learn', '/rapid-fire'];

// Real multi-column desktop layouts exist only for these browsing/hub
// screens (see AppShell's `wide` prop). Exact matches, not prefixes:
// /practice and /cbt are single catch-all routes covering their whole
// internal step machine (hub *and* the focused question screen share one
// URL), so there's no way to tell them apart from the path alone — safer
// to leave both at the narrow, focused width everywhere than to risk a
// question screen rendering wide. /review/session (the focused review
// flow) is a distinct path from /review (the hub) for exactly this
// reason, so it's correctly excluded by an exact match here.
const WIDE_ROUTES = ['/home', '/profile', '/insights', '/review'];

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
  if (!getEngine() || !isOnboarded()) {
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

  return (
    <AppShell wide={wide}>
      {ready && <NotificationCenter />}
      {ready ? (
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding/google" element={<GoogleAuthCallback />} />
          <Route path="/onboarding/*" element={<OnboardingFlow />} />

          <Route element={<RequireOnboarded />}>
            <Route element={<AppTabs />}>
              <Route path="/home" element={<HomeDashboard />} />
              <Route path="/practice/*" element={<PracticeFlow />} />
              <Route path="/cbt/*" element={<CbtFlow />} />
              <Route path="/review" element={<Review />} />
              <Route path="/insights" element={<Insights />} />
            </Route>

            <Route path="/review/session" element={<ReviewSession />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/notifications" element={<NotificationSettings />} />
            <Route path="/profile/leaderboard" element={<Leaderboard />} />
            <Route path="/challenges/*" element={<ChallengesFlow />} />
            <Route path="/learn" element={<LearnHome />} />
            <Route path="/learn/:conceptId" element={<LearnLesson />} />
            <Route path="/rapid-fire" element={<RapidFireFlow />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <BootScreen />
      )}
    </AppShell>
  );
}
