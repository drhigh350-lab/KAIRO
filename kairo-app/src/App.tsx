import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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
import { RapidFireFlow } from './features/rapidfire/RapidFireFlow';
import { KairoMark } from './components';
import { getEngine, restoreSession } from './lib/kairoEngine';

// Splash ("/") and Onboarding ("/onboarding*") already call restoreSession()
// (or connectGoogleAccount()) themselves before deciding where to go — this
// list is every *other* route, which previously never restored a session at
// all. The in-memory `engine` singleton in kairoEngine.ts is wiped on every
// real page reload, so a student who refreshed (or opened a bookmark/PWA
// shortcut) straight into /home, /profile, /review, etc. saw a genuinely
// empty, "signed out"-looking screen even though their Supabase auth
// session was still sitting in localStorage the whole time — this is what
// read as "my progress reset" / "I have to sign in again" on every refresh.
const ROUTES_NEEDING_RESTORE = ['/home', '/practice', '/cbt', '/review', '/insights', '/profile', '/challenges', '/learn', '/rapid-fire'];

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

export default function App() {
  const ready = useBootRestore();

  return (
    <AppShell>
      {ready ? (
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding/google" element={<GoogleAuthCallback />} />
          <Route path="/onboarding/*" element={<OnboardingFlow />} />

          <Route element={<AppTabs />}>
            <Route path="/home" element={<HomeDashboard />} />
            <Route path="/review" element={<Review />} />
            <Route path="/insights" element={<Insights />} />
          </Route>

          <Route path="/practice/*" element={<PracticeFlow />} />
          <Route path="/cbt/*" element={<CbtFlow />} />
          <Route path="/review/session" element={<ReviewSession />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/notifications" element={<NotificationSettings />} />
          <Route path="/profile/leaderboard" element={<Leaderboard />} />
          <Route path="/challenges/*" element={<ChallengesFlow />} />
          <Route path="/learn/:conceptId" element={<LearnLesson />} />
          <Route path="/rapid-fire" element={<RapidFireFlow />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <BootScreen />
      )}
    </AppShell>
  );
}
