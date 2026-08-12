import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngine } from '../engine/EngineProvider.jsx';
import { masteryPctSentence, scoreTrendSentence } from '../lib/copy.js';

/**
 * Progress — meaningful signal over a wall of metrics. Elite Score is
 * shown once, small, with its trend in a sentence (never a raw
 * accuracy/retention/consistency breakdown — that stays internal). XP,
 * badges, and streak all exist in the engine but are deliberately not the
 * headline here; retention and consistency are.
 */
export default function Progress() {
  const { engine } = useEngine();
  const navigate = useNavigate();
  const insights = engine.insights.getDashboardInsights();
  const streak = engine.getStreakStatus();

  const reinforcedTotal = insights.nextMilestone.current;

  return (
    <div className="screen">
      <div className="h1">Progress</div>

      <div className="card card--primary" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--kairo-blue-300)' }}>Elite Score</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-extrabold)', fontSize: 40, color: '#fff', marginTop: 4 }}>
            {Math.round(insights.eliteScore)}
          </div>
        </div>
        <div style={{ color: 'var(--kairo-blue-200)', fontSize: 'var(--fs-body-sm)', maxWidth: 160, textAlign: 'right' }}>
          {scoreTrendSentence(insights.scoreTrend)}
        </div>
      </div>

      {insights.strengths.length > 0 && (
        <div>
          {/* Each subject's own sentence already carries the right tone
              (masteryPctSentence ranges from "strongest" to "could use
              more time") — the section header stays neutral so it never
              contradicts a subject that isn't strong yet. */}
          <div className="eyebrow" style={{ marginBottom: 10 }}>By subject</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.strengths.map(s => (
              <div key={s.subject} className="card" style={{ padding: 14 }}>
                <p style={{ margin: 0 }}>{masteryPctSentence(s.subject, s.masteryPct)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card card--sunken">
        <div className="eyebrow">Retention</div>
        <p style={{ margin: '8px 0 0' }}>
          {reinforcedTotal} concept{reinforcedTotal !== 1 ? 's have' : ' has'} survived forgetting and come back stronger.
          {insights.urgentReviewCount > 0 && (
            <> {insights.urgentReviewCount} {insights.urgentReviewCount > 1 ? 'are' : 'is'} starting to fade — nothing urgent, just worth a look in Review.</>
          )}
        </p>
        {insights.urgentReviewCount > 0 && (
          <button className="btn btn--ghost btn--sm" style={{ padding: 0, marginTop: 8 }} onClick={() => navigate('/review')}>Go to Review →</button>
        )}
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Consistency</div>
        <div className="pill pill--quiet">{streak.message.text}</div>
      </div>

      <div className="card">
        <div className="eyebrow">Next milestone</div>
        <p style={{ margin: '8px 0 0' }}>
          {insights.nextMilestone.remaining} more concept{insights.nextMilestone.remaining !== 1 ? 's' : ''} reinforced gets you to {insights.nextMilestone.target}.
        </p>
      </div>
    </div>
  );
}
