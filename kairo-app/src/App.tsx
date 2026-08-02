import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PhoneShell } from './layout/PhoneShell';
import { AppTabs } from './layout/AppTabs';
import { Splash } from './features/splash/Splash';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { HomeDashboard } from './features/home/HomeDashboard';
import { PracticeFlow } from './features/practice/PracticeFlow';
import { CbtFlow } from './features/cbt/CbtFlow';
import { Review } from './features/review/Review';
import { Insights } from './features/insights/Insights';
import { Profile } from './features/profile/Profile';

export default function App() {
  const { pathname } = useLocation();
  const onSplash = pathname === '/';

  return (
    <PhoneShell statusBarTone={onSplash ? 'white' : 'navy'} statusBarBg={onSplash ? 'var(--kairo-navy-900)' : 'transparent'}>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneShell>
  );
}
