import { useLocation, useNavigate } from 'react-router-dom';

function HomeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></svg>;
}
function DiscoverIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /><path d="m13.7 8.3-1.5 3.9-3.9 1.5 1.5-3.9 3.9-1.5Z" /></svg>;
}
function ProfileIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.3 3.2-5 7-5s6.2 1.7 7 5" /></svg>;
}

export function ArenaTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { label: 'Arena', icon: <HomeIcon />, active: location.pathname === '/arena', onClick: () => navigate('/arena') },
    { label: 'Discover', icon: <DiscoverIcon />, active: location.pathname.startsWith('/discover'), onClick: () => navigate('/discover') },
    { label: 'Profile', icon: <ProfileIcon />, active: location.pathname === '/profile', onClick: () => navigate('/profile') },
  ];
  return (
    <nav aria-label="KAIRO Arena navigation" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '9px 12px calc(9px + env(safe-area-inset-bottom))', background: 'rgba(2,31,55,.97)', borderTop: '1px solid rgba(152,176,196,.18)', backdropFilter: 'blur(14px)' }}>
      {tabs.map((tab) => <button key={tab.label} type="button" onClick={tab.onClick} aria-current={tab.active ? 'page' : undefined} style={{ border: 0, background: 'transparent', color: tab.active ? 'var(--arena-gold)' : 'var(--arena-blue-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit', fontSize: 11, fontWeight: tab.active ? 800 : 600, cursor: 'pointer', minHeight: 42 }}>{tab.icon}{tab.label}</button>)}
    </nav>
  );
}

export function ArenaBottomSpace() {
  return <div aria-hidden="true" style={{ height: 76 }} />;
}
