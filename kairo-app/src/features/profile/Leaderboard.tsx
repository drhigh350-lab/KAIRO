import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Switch } from '../../components';
import { ScreenHeader } from '../learning/shared';
import {
  getConsentSummary, setLeaderboardOptIn, getSegmentLeaderboard, getUniversityRankings,
  type SegmentLeaderboardRow, type UniversityRankingRow,
} from '../../lib/kairoEngine';

/**
 * Profile & Settings §8.2 — a single, clearly-worded opt-in/opt-out control
 * for cohort-based leaderboard participation, defaulting to opted-out.
 * Consistent with the platform-wide rule that comparative content is never
 * default-on or primary, this lives here — a settings screen, not Home,
 * Practice, or Insights — and turning it off removes the student from
 * every leaderboard surface immediately (enforced server-side, not just
 * by hiding this screen's own content).
 */
export function Leaderboard() {
  const navigate = useNavigate();
  const [optedIn, setOptedIn] = useState(() => !!getConsentSummary()?.leaderboardOptIn);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [segment, setSegment] = useState<SegmentLeaderboardRow[]>([]);
  const [universities, setUniversities] = useState<UniversityRankingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const signedIn = !!getConsentSummary();

  useEffect(() => {
    if (!optedIn) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getSegmentLeaderboard(20), getUniversityRankings(20)])
      .then(([seg, uni]) => {
        if (cancelled) return;
        setSegment(seg);
        setUniversities(uni);
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the leaderboard.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [optedIn]);

  async function toggle() {
    setBusy(true);
    try {
      const next = !optedIn;
      await setLeaderboardOptIn(next);
      setOptedIn(next);
      if (!next) { setSegment([]); setUniversities([]); }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)', flex: 1 }}>
      <ScreenHeader onBack={() => navigate(-1)} title="Leaderboard" tone="dark" />
      <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {!signedIn && (
          <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)' }}>Sign in to opt into a leaderboard.</div>
          </Card>
        )}

        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark-text-heading)' }}>Join a leaderboard</div>
            <Switch dark checked={optedIn} onChange={() => signedIn && !busy && toggle()} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)', marginTop: 8, lineHeight: 1.5 }}>
            {optedIn
              ? "You're visible to other students who've also opted in — same target course, similar Kairo Score. Turn this off any time to disappear from every leaderboard immediately."
              : "Off by default. Turning this on shows you a leaderboard of students in a similar course and score range who've also opted in — no one sees your position unless they've opted in too."}
          </div>
        </Card>

        {optedIn && loading && (
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', padding: '20px 0' }}>Loading…</div>
        )}
        {optedIn && error && (
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', textAlign: 'center', padding: '20px 0' }}>{error}</div>
        )}

        {optedIn && !loading && !error && (
          <>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>YOUR SEGMENT</div>
              {segment.length === 0 ? (
                <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
                  <div style={{ fontSize: 13, color: 'var(--dark-text-faint)' }}>No one else in your course and score range has opted in yet — check back as more students join.</div>
                </Card>
              ) : (
                <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {segment.map((row, i) => (
                    <div key={row.studentId} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                      borderTop: i > 0 ? '1px solid var(--dark-border)' : 'none',
                      background: row.isCurrentUser ? 'var(--dark-bg-elevated)' : 'transparent',
                      margin: row.isCurrentUser ? '0 -12px' : 0,
                    }}>
                      <div style={{ width: 22, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--dark-text-faint)', flexShrink: 0, marginLeft: row.isCurrentUser ? 12 : 0 }}>{row.rank}</div>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: row.isCurrentUser ? 700 : 600, color: 'var(--dark-text-heading)' }}>{row.name || 'Student'}{row.isCurrentUser ? ' (You)' : ''}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-accent-blue)', marginRight: row.isCurrentUser ? 12 : 0 }}>{row.score}</div>
                    </div>
                  ))}
                </Card>
              )}
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>UNIVERSITY AVERAGES</div>
              {universities.length === 0 ? (
                <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
                  <div style={{ fontSize: 13, color: 'var(--dark-text-faint)' }}>Not enough opted-in students yet to show university averages.</div>
                </Card>
              ) : (
                <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {universities.map((row, i) => (
                    <div key={row.university} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid var(--dark-border)' : 'none' }}>
                      <div style={{ width: 22, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--dark-text-faint)', flexShrink: 0 }}>{row.rank}</div>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--dark-text-heading)' }}>{row.university}</div>
                      <div style={{ fontSize: 12, color: 'var(--dark-text-muted)' }}>{row.studentCount} student{row.studentCount === 1 ? '' : 's'}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-accent-blue)' }}>{row.avgScore}</div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
