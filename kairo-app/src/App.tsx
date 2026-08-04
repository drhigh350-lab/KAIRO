import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { AppTabs } from './layout/AppTabs';
import { Splash } from './features/splash/Splash';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { HomeDashboard } from './features/home/HomeDashboard';
import { PracticeFlow } from './features/practice/PracticeFlow';
import { CbtFlow } from './features/cbt/CbtFlow';
import { Review } from './features/review/Review';
import { Insights } from './features/insights/Insights';
import { Profile } from './features/profile/Profile';
import { NotificationSettings } from './features/profile/NotificationSettings';
import { ChallengesFlow } from './features/challenges/ChallengesFlow';
import { LearnLesson } from './features/learn/LearnLesson';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding/*" element={<OnboardingFlow />} />

        <Route element={<AppTabs />}>
          <Route path="/home" element={<HomeDashboard />} />
          <Route path="/review" element={<Review />} />
          <Route path="/insights" element={<Insights />} />
        </Route>

        <Route path="/practice/*" element={<PracticeFlow />} />
        <Route path="/cbt/*" element={<CbtFlow />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/notifications" element={<NotificationSettings />} />
        <Route path="/challenges/*" element={<ChallengesFlow />} />
        <Route path="/learn/:conceptId" element={<LearnLesson />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
