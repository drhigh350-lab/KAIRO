import { useLocation, useNavigate } from 'react-router-dom';
import { MissionCard, Card } from '../../components';
import { KaiMark } from '../onboarding/shared';
import type { Course } from '../onboarding/data';
import { liveChallenge } from '../challenges/data';

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

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text-heading)' }}>Kairo</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-navy-900)" strokeWidth="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" /></svg>
          <button type="button" onClick={() => navigate('/profile')} aria-label="Open profile" style={{
            width: 34, height: 34, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)', margin: '-7px',
            borderRadius: '50%', background: 'var(--kairo-blue-100)', cursor: 'pointer', border: 'none', padding: 0,
          }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Good to have you, {firstName} 👋</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--text-heading)', marginTop: 2 }}>Seize the Moment.</div>
      </div>

      {data.examYear && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-blue-700)" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
          Aiming for UTME {data.examYear}
        </div>
      )}

      <MissionCard
        eyebrow="TODAY'S MISSION"
        title="Start your diagnostic"
        reason={`A short mixed-subject check across ${subjects.length ? subjects.join(', ') : 'your subjects'} so Kairo knows where to focus first.`}
        duration="About 10 minutes"
        ctaLabel="Start Mission"
        onStart={() => navigate('/practice', { state: { entry: 'suggested' } })}
      />

      <Card onClick={() => navigate('/challenges')} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--kairo-blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--kairo-blue-700)" strokeWidth="2"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}>Challenges</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
            {liveChallenge ? `${liveChallenge.title} is live — ${liveChallenge.participantCount.toLocaleString()} students already joined.` : 'Compete with students across Nigeria.'}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M9 6l6 6-6 6" /></svg>
      </Card>

      <Card style={{ background: 'var(--kairo-blue-100)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <KaiMark size={36} />
        <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-body)', lineHeight: 1.5 }}>I'll get to know your strengths and gaps as you start practising — nothing to show you yet, but that changes fast.</div>
      </Card>
    </div>
  );
}
