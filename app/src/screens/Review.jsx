import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngine } from '../engine/EngineProvider.jsx';
import { reviewReasonSentence, errorTagLabel } from '../lib/copy.js';

/**
 * Review — the retention surface. Every sentence here is a translation of
 * a real ReviewModule/ConceptNode read; nothing is invented and no raw
 * internal label (retentionState, errorTag) ever reaches the page.
 */
export default function Review() {
  const { engine, refresh } = useEngine();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set());

  const recap = engine.review.buildDailyRecap();
  const weakness = engine.review.buildWeaknessReview();

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function startReview(ids) {
    engine.startSession({ mode: 'standard', plan: ids });
    refresh();
    navigate('/practice');
  }

  if (recap.totalConcepts === 0) {
    return (
      <div className="screen">
        <div className="h1">Review</div>
        <div className="card">
          <p style={{ margin: 0 }}>Nothing is fading or overdue right now — everything you've studied is holding up.</p>
        </div>
        <button className="btn btn--secondary" onClick={() => navigate('/practice')}>Practise anyway</button>
      </div>
    );
  }

  const chosenIds = [...selected];

  return (
    <div className="screen">
      <div>
        <div className="h1">Review</div>
        <p className="muted" style={{ marginTop: 4 }}>
          {recap.totalConcepts} concept{recap.totalConcepts > 1 ? 's are' : ' is'} worth a look — about {recap.estimatedTimeMin} minutes.
        </p>
      </div>

      <div className="card card--primary">
        <div className="eyebrow" style={{ color: 'var(--kairo-blue-300)' }}>Suggested</div>
        <div className="h3" style={{ color: '#fff', marginTop: 8 }}>
          A quick pass on {chosenIds.length > 0 ? chosenIds.length : recap.totalConcepts} concept{(chosenIds.length > 0 ? chosenIds.length : recap.totalConcepts) > 1 ? 's' : ''}
        </div>
        <button
          className="btn btn--primary btn--full"
          style={{ marginTop: 16 }}
          onClick={() => startReview(chosenIds.length > 0 ? chosenIds : recap.queue.map(q => q.id))}
        >
          Start review
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recap.queue.map(item => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className="card"
            style={{
              textAlign: 'left', border: selected.has(item.id) ? '1.5px solid var(--kairo-navy-900)' : '1.5px solid transparent',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4
            }}
          >
            <div style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)' }}>{item.name}</div>
            <div className="muted" style={{ fontSize: 'var(--fs-body-sm)' }}>{reviewReasonSentence(item.reason)}</div>
          </button>
        ))}
      </div>

      {weakness.dominantWeakness && (
        <div className="card card--sunken">
          <div className="eyebrow">A pattern worth knowing</div>
          <p style={{ margin: '6px 0 0' }}>
            Lately, most of what trips you up comes down to {errorTagLabel(weakness.dominantWeakness.tag)}.
          </p>
        </div>
      )}
    </div>
  );
}
