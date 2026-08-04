import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MissionCard, Card, KairoWordmark } from '../../components';
import type { Course } from '../onboarding/data';
import { listChallenges, mapDbChallenge } from '../../lib/challengesApi';
import type { Challenge } from '../challenges/data';
import { getEngine } from '../../lib/kairoEngine';

interface HomeDashboardState {
  name?: string;
  course?: Course | null;
  /** ISO date string, e.g. "2027-05-15". */
  examDate?: string | null;
  subjects?: string[];
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const quickActions: { label: string; d: string; color: string; entry: string }[] = [
  { label: 'Subject Practice', d: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z', color: '#2E7CF6', entry: 'subject' },
  { label: 'Topic Practice', d: 'M4 6h16M4 12h16M4 18h10', color: '#9B6BE0', entry: 'topic' },
  { label: 'Mixed Practice', d: 'M16 3h5v5M4 20L21 3M21 16v5h-5M4 4l5 5', color: '#28B5C4', entry: 'mixed' },
];

export function HomeDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const routerState = location.state as HomeDashboardState | null;
  // A page reload restores the signed-in engine (see Splash.tsx) but loses
  // router state, so fall back to the real profile rather than "there".
  const profile = getEngine()?.profile;
  const data: HomeDashboardState = {
    name: routerState?.name || profile?.name || 'there',
    course: routerState?.course ?? (profile?.targetCourse ? { name: profile.targetCourse, subjects: profile.targetSubjects || [] } : null),
    examDate: routerState?.examDate ?? (profile?.examDate ? new Date(profile.examDate).toISOString().slice(0, 10) : null),
    subjects: routerState?.subjects?.length ? routerState.subjects : (profile?.targetSubjects ?? []),
  };
  const firstName = (data.name || '').split(' ')[0] || 'there';
  const subjects = data.subjects ?? [];
  const daysToGo = profile?.examDate ? Math.max(0, Math.ceil((profile.examDate - Date.now()) / 86400000)) : null;

  const [liveChallenge, setLiveChallenge] = useState<Challenge | null>(null);
  useEffect(() => {
    listChallenges()
      .then((rows) => setLiveChallenge(rows.map(mapDbChallenge).find((c) => c.status === 'live') || null))
      .catch(() => setLiveChallenge(null));
  }, []);

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, background: 'var(--dark-bg-canvas)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 34 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <KairoWordmark tone="white" width={110} />
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'var(--dark-accent-blue)', marginTop: 2 }}>SEIZE THE MOMENT</div>
        </div>
        <button type="button" onClick={() => navigate('/profile')} aria-label="Open profile" style={{
          width: 34, height: 34, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)', margin: '-7px',
          borderRadius: '50%', background: 'var(--dark-bg-surface)', border: '2px solid var(--dark-accent-blue)', cursor: 'pointer', padding: 0,
        }} />
      </div>

      <div>
        <div style={{ fontSize: 16, color: 'var(--dark-text-heading)', fontWeight: 600 }}>{greeting()}, {firstName} 👋</div>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 4 }}>Ready to start your learning journey?</div>
      </div>

      {daysToGo != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--dark-text-muted)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
          {daysToGo} days to your UTME
        </div>
      )}

      <MissionCard
        badge="Recommended Next Step"
        title="Start Practising"
        reason={`Kairo built your first session from your check-in across ${subjects.length ? subjects.join(', ') : 'your subjects'} — adaptive from here.`}
        chips={['≈5 min', 'Adaptive']}
        ctaLabel="Start Session"
        onStart={() => navigate('/practice', { state: { entry: 'suggested' } })}
      />

      <div style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M4 20V10M11 20V4M18 20v-7" /></svg>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark-text-heading)' }}>Today's Progress</span>
          </div>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '5px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark-text-heading)' }}>0%</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 10, maxWidth: 220 }}>Your progress will appear here after your first study session.</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--dark-border)' }}>
          <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>Questions<br /><span style={{ color: 'var(--dark-text-heading)', fontWeight: 700 }}>—</span></div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>Study Time<br /><span style={{ color: 'var(--dark-text-heading)', fontWeight: 700 }}>—</span></div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>Daily Goal<br /><span style={{ color: 'var(--dark-text-heading)', fontWeight: 700 }}>—/—</span></div>
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 700, color: 'var(--dark-text-heading)', fontSize: 15, marginBottom: 12 }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {quickActions.map((q) => (
            <button key={q.label} type="button" onClick={() => navigate('/practice', { state: { entry: q.entry } })} style={{
              background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: 14,
              display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', minHeight: 'var(--touch-min)',
            }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: `${q.color}26`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={q.color} strokeWidth="2"><path d={q.d} /></svg>
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--dark-text-heading)', lineHeight: 1.3 }}>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Card onClick={() => navigate('/challenges')} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(46,124,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>Challenges</div>
          <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 2, lineHeight: 1.4 }}>
            {liveChallenge ? `${liveChallenge.title} is live now — ${liveChallenge.questionCount} question${liveChallenge.questionCount === 1 ? '' : 's'}.` : 'Compete with students across Nigeria.'}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M9 6l6 6-6 6" /></svg>
      </Card>

      <div style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--dark-accent-blue)" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" /></svg>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-accent-blue)' }}>Kai Wisdom Spark</div>
          <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--dark-text-body)', lineHeight: 1.5, marginTop: 4 }}>Small consistent actions today create extraordinary results tomorrow.</div>
        </div>
      </div>
    </div>
  );
}
