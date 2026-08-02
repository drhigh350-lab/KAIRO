import type { CSSProperties, MouseEventHandler } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MissionCard, Card } from '../../components';
import { KaiMark } from '../onboarding/shared';
import type { Course } from '../onboarding/data';

interface HomeDashboardState {
  name?: string;
  course?: Course | null;
  examYear?: string | null;
  subjects?: string[];
}

export function HomeDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = (location.state as HomeDashboardState) ?? { name: 'there', subjects: [] };
  const firstName = (data.name || '').split(' ')[0] || 'there';
  const subjects = data.subjects ?? [];

  const quickActions: { label: string; d: string; onClick?: () => void }[] = [
    { label: 'Subject Practice', d: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z', onClick: () => navigate('/practice', { state: { entry: 'subject' } }) },
    { label: 'Topic Practice', d: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 8a4 4 0 100 8 4 4 0 000-8z', onClick: () => navigate('/practice', { state: { entry: 'topic' } }) },
    { label: 'Mixed Practice', d: 'M16 3h5v5M4 20L21 3M21 16v5h-5M4 4l5 5', onClick: () => navigate('/practice', { state: { entry: 'mixed' } }) },
    { label: 'Exam Mode', d: 'M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7z', onClick: () => navigate('/cbt') },
    { label: 'Challenges', d: 'M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z', onClick: () => navigate('/challenges') },
    { label: 'See All', d: 'M5 12h14M12 5l7 7-7 7' },
  ];

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)' }}>Kairo</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-navy-900)" strokeWidth="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" /></svg>
          <div onClick={() => navigate('/profile')} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--kairo-blue-100)', cursor: 'pointer' }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Good to have you, {firstName} 👋</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--text-heading)', marginTop: 2 }}>Seize the Moment.</div>
      </div>

      <MissionCard
        eyebrow="SUGGESTED FOR YOU"
        title="Start with a quick diagnostic"
        reason={`A short mixed-subject check across ${subjects.length ? subjects.join(', ') : 'your subjects'} to see where to focus first.`}
        duration="Takes about 10 minutes"
        ctaLabel="Start Diagnostic"
        onStart={() => navigate('/practice', { state: { entry: 'suggested' } })}
      />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 15 }}>Quick Actions</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
          {quickActions.map((q) => (
            <Card key={q.label} padding={14} onClick={q.onClick} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', cursor: q.onClick ? 'pointer' : 'default' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-blue-700)" strokeWidth="2"><path d={q.d} /></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', lineHeight: 1.3 }}>{q.label}</span>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <PromoCard title="JAMB CBT Exam Mode" body="Simulate the real computer-based test experience." accent="navy" onClick={() => navigate('/cbt')} />
        <PromoCard title="Challenges" body="Compete with students across Nigeria. Climb the leaderboard." accent="blue" onClick={() => navigate('/challenges')} />
      </div>

      <Card style={{ background: 'var(--kairo-blue-100)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <KaiMark size={36} />
        <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-body)', lineHeight: 1.5 }}>I'll get to know your strengths and gaps as you start practising — nothing to show you yet, but that changes fast.</div>
      </Card>
    </div>
  );
}

interface PromoCardProps {
  title: string;
  body: string;
  accent: 'navy' | 'blue';
  onClick?: MouseEventHandler<HTMLDivElement>;
}

function PromoCard({ title, body, accent, onClick }: PromoCardProps) {
  const isNavy = accent === 'navy';
  const style: CSSProperties = {
    background: isNavy ? 'var(--kairo-navy-900)' : '#fff', color: isNavy ? '#fff' : 'var(--text-heading)',
    border: isNavy ? 'none' : '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-lg)', padding: 16,
    display: 'flex', flexDirection: 'column', gap: 10, cursor: onClick ? 'pointer' : 'default', boxShadow: isNavy ? 'var(--shadow-lg)' : 'var(--shadow-card)',
  };
  return (
    <div onClick={onClick} style={style}>
      <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: 12, opacity: isNavy ? 0.8 : 1, color: isNavy ? 'var(--kairo-blue-200)' : 'var(--text-muted)', lineHeight: 1.4 }}>{body}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: isNavy ? '#fff' : 'var(--kairo-blue-700)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
        Open <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </div>
    </div>
  );
}
