import { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav, type BottomNavItem } from '../components';

const icon = (d: string) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={d} /></svg>
);

const TABS: { key: string; path: string; label: string; d: string }[] = [
  { key: 'home', path: '/home', label: 'Home', d: 'M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z' },
  { key: 'practice', path: '/practice', label: 'Practice', d: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z' },
  { key: 'cbt', path: '/cbt', label: 'CBT', d: 'M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7z' },
  { key: 'review', path: '/review', label: 'Review', d: 'M12 8v4l3 3M12 22a10 10 0 100-20 10 10 0 000 20z' },
  // Minimalist User glyph — Profile itself now carries the Insights Hub
  // (Weekly Drop/Actionable Carousel/Subject Health/Monthly Checkpoint,
  // see ProfileInsights.tsx), so this is that content's real tab home,
  // not just an identity/settings shortcut anymore.
  { key: 'profile', path: '/profile', label: 'Profile', d: 'M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM4.5 20.5a7.5 7.5 0 0115 0' },
];

// Practice and CBT each drive their own internal screen-stack (not real
// routes) inside a single /practice/* or /cbt/* route, so AppTabs can't
// tell "hub screen" from "actively answering a question" just by looking
// at location.pathname the way it can for /home, /review. This context
// lets those flow controllers report their own hide/show intent up to the
// persistent nav shell they're now nested inside.
const NavVisibilityContext = createContext<(hidden: boolean) => void>(() => {});

/** Call with `true` while the current screen is a focused question/explanation screen that must hide the bottom nav, `false` (or unmount) once it's showing a hub/browsing screen again. */
export function useSetBottomNavHidden(hidden: boolean) {
  const setHidden = useContext(NavVisibilityContext);
  useEffect(() => {
    setHidden(hidden);
    return () => setHidden(false);
  }, [hidden, setHidden]);
}

/**
 * Persistent bottom navigation shell for the main app section (Home /
 * Practice / CBT / Review / Profile). Profile carries the Insights Hub
 * (see ProfileInsights.tsx) as its own embedded section rather than
 * Insights ever getting a bottom-nav tab of its own.
 */
export function AppTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = TABS.find((t) => location.pathname.startsWith(t.path))?.key ?? 'home';
  const [navHidden, setNavHidden] = useState(false);

  const items: BottomNavItem[] = TABS.map((t) => ({ key: t.key, label: t.label, icon: icon(t.d) }));

  return (
    <NavVisibilityContext.Provider value={setNavHidden}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: navHidden ? 0 : 'calc(76px + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </div>
        {!navHidden && (
          <BottomNav
            items={items}
            active={active}
            dark
            onChange={(key) => {
              const tab = TABS.find((t) => t.key === key);
              if (tab) navigate(tab.path);
            }}
          />
        )}
      </div>
    </NavVisibilityContext.Provider>
  );
}
