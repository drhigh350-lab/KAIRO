import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngine } from '../engine/EngineProvider.jsx';

/**
 * Learn Home — a query over the student's own diagnostic history
 * (LearnModule.getLearnHome()), never a browsable content library. Kept
 * deliberately short: a handful of concepts genuinely worth understanding
 * better right now, not a catalogue of everything Kairo could teach.
 */
export default function Learn() {
  const { engine } = useEngine();
  const navigate = useNavigate();
  const home = engine.learn.getLearnHome();

  const go = (conceptId, entryPoint) => navigate(`/learn/${conceptId}`, { state: { entryPoint } });

  return (
    <div className="screen">
      <div>
        <div className="h1">Learn</div>
        <p className="muted" style={{ marginTop: 4 }}>{home.kaiFraming.text}</p>
      </div>

      {home.continueLearning && (
        <button className="card card--primary" style={{ textAlign: 'left', border: 'none', cursor: 'pointer' }}
          onClick={() => go(home.continueLearning.conceptId, home.continueLearning.entryPoint)}>
          <div className="eyebrow" style={{ color: 'var(--kairo-blue-300)' }}>Continue</div>
          <div className="h3" style={{ color: '#fff', marginTop: 6 }}>{home.continueLearning.conceptName}</div>
        </button>
      )}

      {home.recommendedConcepts.length > 0 && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Worth a closer look</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {home.recommendedConcepts.map(c => (
              <button key={c.id} className="card" style={{ textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 }}
                onClick={() => go(c.id, 'home_dashboard')}>
                <span style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)' }}>{c.name}</span>
                <span className="muted" style={{ fontSize: 'var(--fs-body-sm)' }}>{c.reason}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {home.weakTopics.length > 0 && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Topics in progress</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {home.weakTopics.map(t => (
              <span key={`${t.subject}-${t.topic}`} className="pill pill--calm">{t.topic}</span>
            ))}
          </div>
        </div>
      )}

      {home.masteredConcepts.length > 0 && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Recently strengthened</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {home.masteredConcepts.map(c => (
              <span key={c.id} className="pill pill--gold">{c.name}</span>
            ))}
          </div>
        </div>
      )}

      {home.coldStart && (
        <div className="card card--sunken">
          <p style={{ margin: 0 }}>Once you've done a bit of practice, Kairo will know exactly what to help you understand here.</p>
        </div>
      )}

      {!home.coldStart && home.recommendedConcepts.length === 0 && (
        <div className="card card--sunken">
          <p style={{ margin: 0 }}>Nothing urgent to untangle right now — everything's holding up.</p>
        </div>
      )}
    </div>
  );
}
