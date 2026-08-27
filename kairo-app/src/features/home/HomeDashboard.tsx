import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MissionCard, Card, KairoWordmark, Input, Button } from '../../components';
import { Modal, KairoScoreInfo } from '../learning/shared';
import type { Course } from '../onboarding/data';
import { listChallenges, mapDbChallenge } from '../../lib/challengesApi';
import type { Challenge } from '../challenges/data';
import { getEngine, getTodayProgress, getInsightsSummary, setDailyGoal, hasCompletedTodaysRecommendation, getStreakStatus } from '../../lib/kairoEngine';
import { getPinnedTodayFocus } from '../../lib/dailyRecommendation';
import { InstallAppBanner } from './InstallAppBanner';

interface EarnedBadge { id: string; name: string; desc: string }

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

/** Batch 5's Gamification HUD — replaces the old avatar/profile-nav button in the header (Profile is a bottom-nav tab now, so that link was redundant) with the one number that actually reflects standing: lifetime Kairo Points. Sits directly above FlameIndicator, same spot the avatar used to occupy. */
function GamificationHud({ points }: { points: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', flexShrink: 0,
      borderRadius: 'var(--radius-pill)', background: 'var(--dark-bg-elevated)', border: '1px solid rgba(201,162,39,0.35)',
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--kairo-gold-500)"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" /></svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{points.toLocaleString()}</span>
    </div>
  );
}

/** Dimmed until today's daily recommendation is completed, then burns bright — a single at-a-glance "have I shown up today" signal. The numeric streak count sits directly underneath, and a small snowflake row shows any earned Streak Freezes still in reserve. */
function FlameIndicator({ lit, days, freezesAvailable }: { lit: boolean; days: number; freezesAvailable: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      <div title={lit ? "Today's recommendation done" : "Today's recommendation not done yet"} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: lit ? 'rgba(224,160,57,0.18)' : 'var(--dark-bg-surface)', border: `1.5px solid ${lit ? 'var(--kairo-gold-500, #e0a039)' : 'var(--dark-border)'}`,
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill={lit ? 'var(--kairo-gold-500, #e0a039)' : 'none'} stroke={lit ? 'var(--kairo-gold-500, #e0a039)' : 'var(--dark-text-faint)'} strokeWidth="2">
          <path d="M12 2c1 4-4 5-4 9a4 4 0 008 0c1.5 1 2 3 2 4a6 6 0 01-12 0c0-5 3-6 3-9 0-1.5.5-3 3-4z" />
        </svg>
      </div>
      {days > 0 && (
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-text-muted)' }}>{days} day{days === 1 ? '' : 's'}</div>
      )}
      {freezesAvailable > 0 && (
        <div title={`${freezesAvailable} Streak Freeze${freezesAvailable === 1 ? '' : 's'} in reserve`} style={{ fontSize: 10, color: 'var(--dark-accent-blue)' }}>
          {'❄'.repeat(freezesAvailable)}
        </div>
      )}
    </div>
  );
}

const quickActions: { label: string; d: string; color: string; to: string; entry?: string }[] = [
  { label: 'Subject Practice', d: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z', color: '#2E7CF6', to: '/practice', entry: 'subject' },
  { label: 'Topic Practice', d: 'M4 6h16M4 12h16M4 18h10', color: '#9B6BE0', to: '/practice', entry: 'topic' },
  { label: 'Mixed Practice', d: 'M16 3h5v5M4 20L21 3M21 16v5h-5M4 4l5 5', color: '#28B5C4', to: '/practice', entry: 'mixed' },
  { label: 'Rapid Fire', d: 'M13 2L3 14h7l-1 8 11-14h-7l1-6z', color: '#E0A039', to: '/rapid-fire' },
  // Previously only reachable reactively, right after a wrong answer in
  // Practice — this is the one proactive way in, so a student can go
  // understand something on their own initiative, not only when Kairo
  // interrupts them with it.
  { label: 'Get Unstuck', d: 'M12 4.5C9.5 2.5 6 2.5 4 4v14c2-1.5 5.5-1.5 8 .5 2.5-2 6-2 8-.5V4c-2-1.5-5.5-1.5-8 .5z', color: '#5FBF7A', to: '/learn' },
  { label: 'Study Planner', d: 'M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z', color: '#E05A8C', to: '/planner' },
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
  // Genuinely the most recently earned badge — badges are appended to
  // profile.badges in earn order (BadgeSystem.checkAndAward()), so the
  // last one really is the most recent, not just any random earned badge.
  const earnedBadges: EarnedBadge[] = getEngine()?.getBadges()?.earned ?? [];
  const latestBadge = earnedBadges.length ? earnedBadges[earnedBadges.length - 1] : null;
  const [todayProgress, setTodayProgress] = useState(getTodayProgress());
  // Home is one of only three places the total Kairo Score is allowed to
  // show (with Profile and Insights) — everywhere else shows session-scoped
  // gained points instead, so this doesn't repeat a slow-moving 0-100
  // number where "what did I just earn" is the more useful question.
  const insights = getInsightsSummary();
  const streakStatus = getStreakStatus();
  // The engine's own real reasoning for today's recommended concept —
  // replaces a static sentence that used to be identical for every student
  // regardless of macro-state, decay urgency, or exam proximity. Pinned
  // for the day (Batch 3's persistent-queue rule) — see dailyRecommendation.ts.
  const todayFocus = getPinnedTodayFocus();
  const hasTodayProgress = todayProgress.questionsToday > 0;
  // Goal-completion %, not accuracy — the ring used to show accuracyPct
  // (e.g. "90%" from one lucky question) inside a shape that visually reads
  // as "90% done", even when the student was nowhere near their daily goal.
  const goalPct = todayProgress.dailyGoal ? Math.min(100, Math.round((todayProgress.questionsToday / todayProgress.dailyGoal) * 100)) : null;
  const ringPct = hasTodayProgress ? (goalPct ?? todayProgress.accuracyPct ?? 0) : 0;
  const ringLabel = hasTodayProgress ? `${goalPct ?? todayProgress.accuracyPct}%` : '—';
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(todayProgress.dailyGoal != null ? String(todayProgress.dailyGoal) : '');
  const [savingGoal, setSavingGoal] = useState(false);

  async function handleSaveGoal() {
    const n = parseInt(goalInput, 10);
    setSavingGoal(true);
    try {
      await setDailyGoal(Number.isFinite(n) && n > 0 ? n : null);
      setTodayProgress(getTodayProgress());
      setShowGoalModal(false);
    } finally {
      setSavingGoal(false);
    }
  }

  const [liveChallenge, setLiveChallenge] = useState<Challenge | null>(null);
  useEffect(() => {
    listChallenges()
      .then((rows) => setLiveChallenge(rows.map(mapDbChallenge).find((c) => c.status === 'live') || null))
      .catch(() => setLiveChallenge(null));
  }, []);

  return (
    <div style={{ padding: '4px 20px 24px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, background: 'var(--dark-bg-canvas)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
        <div />
        <div style={{ justifySelf: 'center' }}><KairoWordmark tone="white" width={100} /></div>
        <div style={{ justifySelf: 'end' }}><GamificationHud points={profile?.kairoPoints ?? 0} /></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, color: 'var(--dark-text-heading)', fontWeight: 600 }}>{greeting()}, {firstName} 👋</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 4 }}>Ready to start your learning journey?</div>
        </div>
        <FlameIndicator lit={hasCompletedTodaysRecommendation()} days={streakStatus?.momentum ?? 0} freezesAvailable={streakStatus?.freezesAvailable ?? 0} />
      </div>

      {daysToGo != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--dark-text-muted)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
          {daysToGo} days to your UTME
        </div>
      )}

      <InstallAppBanner />

      {/*
        Tablet/desktop (>=768px, via .app-shell--wide): a real two-column
        dashboard — actions on the left where they have room to breathe,
        status/stats as a sticky sidebar on the right, instead of the same
        single mobile column just stretched out with the numbers pushed
        further down the page. Below that breakpoint this is a plain
        stacked flex column (the classes are no-ops), unchanged from before.
      */}
      <div className="desktop-grid">
        <div className="desktop-main">
          <MissionCard
            badge="Recommended Next Step"
            title="Start Practising"
            reason={
              todayFocus?.reason
                ?? `Kairo built your first session from your check-in across ${subjects.length ? subjects.join(', ') : 'your subjects'} — adaptive from here.`
            }
            chips={['≈5 min', 'Adaptive']}
            ctaLabel="Start Session"
            onStart={() => navigate('/practice', { state: { entry: 'suggested', anchorConceptId: todayFocus?.conceptId ?? null } })}
          />

          <div>
            <div style={{ fontWeight: 700, color: 'var(--dark-text-heading)', fontSize: 15, marginBottom: 12 }}>Quick Actions</div>
            <div className="desktop-reflow-grid">
              {quickActions.map((q) => (
                <button key={q.label} type="button" onClick={() => navigate(q.to, q.entry ? { state: { entry: q.entry } } : undefined)} style={{
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

          {latestBadge && (
            <div style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--dark-accent-blue)" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" /></svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-accent-blue)' }}>Kai Wisdom Spark — {latestBadge.name}</div>
                <div style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--dark-text-body)', lineHeight: 1.5, marginTop: 4 }}>{latestBadge.desc}. That's not luck — that's real progress showing up.</div>
              </div>
            </div>
          )}
        </div>

        <div className="desktop-sidebar">
          <div style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue)" strokeWidth="2"><path d="M4 20V10M11 20V4M18 20v-7" /></svg>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark-text-heading)' }}>Today's Progress</span>
              </div>
              {/* When a daily goal is set, this ring is real goal-completion progress
                  (questionsToday/dailyGoal) — a conic-gradient arc, not just a static
                  border with a number in it, which used to visually imply completion
                  regardless of the number shown. Without a goal there's nothing to
                  show completion against, so it falls back to today's accuracy, same
                  as before. */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%', flexShrink: 0, padding: 5,
                background: hasTodayProgress ? `conic-gradient(var(--dark-accent-blue) ${ringPct * 3.6}deg, var(--dark-border) 0deg)` : 'var(--dark-border)',
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--dark-bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{ringLabel}</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 10, maxWidth: 220 }}>
              {hasTodayProgress
                ? (goalPct != null
                    ? `${goalPct}% of today's ${todayProgress.dailyGoal}-question goal · ${todayProgress.accuracyPct}% accuracy so far.`
                    : "Today's accuracy across everything you've completed so far.")
                : 'Your progress will appear here after you complete a practice session.'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--dark-border)' }}>
              <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>Questions<br /><span style={{ color: 'var(--dark-text-heading)', fontWeight: 700 }}>{hasTodayProgress ? todayProgress.questionsToday : '—'}</span></div>
              <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>Study Time<br /><span style={{ color: 'var(--dark-text-heading)', fontWeight: 700 }}>{hasTodayProgress ? `${todayProgress.studyMinutesToday}m` : '—'}</span></div>
              <button type="button" onClick={() => { setGoalInput(todayProgress.dailyGoal != null ? String(todayProgress.dailyGoal) : ''); setShowGoalModal(true); }} style={{
                background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', minHeight: 'var(--touch-min)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>Daily Goal</span><br />
                <span style={{ color: 'var(--dark-accent-blue)', fontWeight: 700 }}>
                  {todayProgress.dailyGoal != null ? `${todayProgress.questionsToday}/${todayProgress.dailyGoal}` : 'Set goal'}
                </span>
              </button>
            </div>
          </div>

          {insights?.eliteScore != null && (
            <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>Kairo Score</span>
                <KairoScoreInfo />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--dark-text-heading)' }}>{Math.round(insights.eliteScore)}</span>
            </Card>
          )}
        </div>
      </div>

      {showGoalModal && (
        <Modal onClose={() => setShowGoalModal(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--dark-text-heading)', marginBottom: 4 }}>Daily question goal</div>
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginBottom: 16, lineHeight: 1.5 }}>How many questions do you want to answer each day? Leave blank to remove your goal.</div>
          <Input tone="dark" type="number" min="1" placeholder="e.g. 20" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} />
          <div style={{ marginTop: 16 }}>
            <Button variant="darkAccent" size="lg" fullWidth disabled={savingGoal} onClick={handleSaveGoal}>{savingGoal ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
