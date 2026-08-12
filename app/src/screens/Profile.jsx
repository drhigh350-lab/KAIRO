import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngine } from '../engine/EngineProvider.jsx';
import { daysUntil } from '../lib/copy.js';

/**
 * Profile & Settings — deliberately quiet. Reached only via the top bar,
 * never the primary nav. Reads engine.settings.getProfile() directly
 * rather than re-deriving stats.
 */
export default function Profile() {
  const { engine } = useEngine();
  const navigate = useNavigate();
  const profile = engine.settings.getProfile();
  const days = daysUntil(profile.examDate);

  return (
    <div className="screen">
      <button className="btn btn--ghost btn--sm" style={{ padding: 0, alignSelf: 'flex-start' }} onClick={() => navigate(-1)}>← Back</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--kairo-blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-bold)', fontSize: 20, color: 'var(--kairo-navy-900)' }}>
          {(profile.name || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="h2">{profile.name}</div>
          {profile.targetCourse && <div className="muted" style={{ fontSize: 'var(--fs-body-sm)' }}>{profile.targetCourse}</div>}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Exam</div>
        <p style={{ margin: '8px 0 0' }}>
          {profile.targetUniversity ? `Targeting ${profile.targetUniversity}. ` : ''}
          {days != null ? `${days} day${days !== 1 ? 's' : ''} to go.` : 'No exam date set yet.'}
        </p>
      </div>

      {profile.targetSubjects?.length > 0 && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Subjects</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {profile.targetSubjects.map(s => <span key={s} className="pill pill--calm">{s}</span>)}
          </div>
        </div>
      )}

      <div className="card card--sunken">
        <div className="eyebrow">Preferences</div>
        <p style={{ margin: '8px 0 0' }} className="muted">
          Notifications, accessibility, and data preferences live here. Not wired up yet in this shell —
          see <code style={{ fontSize: 12 }}>engine.settings</code> for the real methods (already fully built).
        </p>
      </div>

      <div className="faint" style={{ fontSize: 'var(--fs-caption)' }}>
        Member since {new Date(profile.joinedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
