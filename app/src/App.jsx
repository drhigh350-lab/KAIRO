import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEngine } from './engine/EngineProvider.jsx';
import TopBar from './components/TopBar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Home from './screens/Home.jsx';
import Practice from './screens/Practice.jsx';
import Review from './screens/Review.jsx';
import Learn from './screens/Learn.jsx';
import LearnLesson from './screens/LearnLesson.jsx';
import Progress from './screens/Progress.jsx';
import Profile from './screens/Profile.jsx';

// The five core learning surfaces share equal footing in the bottom nav.
// Profile is deliberately excluded from that hierarchy (kept quiet and
// secondary, per the product brief) and reached only via the top bar.
const NAV_ROUTES = new Set(['/', '/practice', '/review', '/learn', '/progress']);

export default function App() {
  const { ready } = useEngine();
  const navigate = useNavigate();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="app-shell">
        <div className="center-fill"><div className="spinner" /></div>
      </div>
    );
  }

  const showNav = NAV_ROUTES.has(location.pathname);

  return (
    <div className="app-shell">
      <TopBar onProfileClick={() => navigate('/profile')} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/review" element={<Review />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:conceptId" element={<LearnLesson />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  );
}
