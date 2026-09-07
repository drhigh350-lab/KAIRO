import { useLocation, useNavigate } from 'react-router-dom';

export function ArenaTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { label: 'Home', icon: '⌂', active: location.pathname === '/home', onClick: () => navigate('/home') },
    { label: 'Discover', icon: '◈', active: location.pathname.startsWith('/challenges'), onClick: () => navigate('/challenges') },
    { label: 'Trophies', icon: '♛', active: location.pathname === '/profile', onClick: () => navigate('/profile') },
  ];
  return (
    <nav aria-label="KAIRO Arena navigation" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '9px 12px calc(9px + env(safe-area-inset-bottom))', background: 'rgba(2,31,55,.97)', borderTop: '1px solid rgba(152,176,196,.18)', backdropFilter: 'blur(14px)' }}>
      {tabs.map((tab) => <button key={tab.label} type="button" onClick={tab.onClick} aria-current={tab.active ? 'page' : undefined} style={{ border: 0, background: 'transparent', color: tab.active ? 'var(--arena-gold)' : 'var(--arena-blue-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit', fontSize: 11, fontWeight: tab.active ? 800 : 600, cursor: 'pointer', minHeight: 42 }}><span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>{tab.label}</button>)}
    </nav>
  );
}

export function ArenaBottomSpace() {
  return <div aria-hidden="true" style={{ height: 76 }} />;
}
