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
  { key: 'insights', path: '/insights', label: 'Insights', d: 'M4 20V10M11 20V4M18 20v-7' },
];

/**
 * Persistent bottom navigation shell for the main app section (Home / Practice /
 * CBT / Review / Insights). Profile is reached via the avatar in each screen's
 * own header, not a tab — per the product's explicit navigation spec.
 */
export function AppTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = TABS.find((t) => location.pathname.startsWith(t.path))?.key ?? 'home';

  const items: BottomNavItem[] = TABS.map((t) => ({ key: t.key, label: t.label, icon: icon(t.d) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      <BottomNav
        items={items}
        active={active}
        onChange={(key) => {
          const tab = TABS.find((t) => t.key === key);
          if (tab) navigate(tab.path);
        }}
      />
    </div>
  );
}
