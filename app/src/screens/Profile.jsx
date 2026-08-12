import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngine } from '../engine/EngineProvider.jsx';
import { daysUntil } from '../lib/copy.js';

// A curated subset of the real preference shape (ProfileSettings.js's
// `defaults` has ~20 fields across 5 categories) — Settings stays quiet
// and secondary, not a wall of every internal toggle.
const TOGGLES = [
  { category: 'notifications', key: 'dailyRecap', label: 'Daily recap' },
  { category: 'notifications', key: 'streakReminders', label: 'Momentum reminders' },
  { category: 'practice', key: 'autoShowExplanation', label: 'Show explanation after each answer' },
  { category: 'accessibility', key: 'reduceMotion', label: 'Reduce motion' },
  { category: 'privacy', key: 'appearOnLeaderboard', label: 'Appear on leaderboard' }
];

function Toggle({ on, onToggle, label }) {
  return (
    <div className="toggle-row">
      <span className="toggle-row__label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        className="toggle"
        data-on={on}
        onClick={onToggle}
      >
        <span className="toggle__knob" />
      </button>
    </div>
  );
}

/**
 * Profile & Settings — deliberately quiet. Reached only via the top bar,
 * never the primary nav. Every toggle reads/writes through the real
 * engine.settings.updatePreferences() — no preference state lives in this
 * component. Delete/export use the real engine.settings methods too.
 */
export default function Profile() {
  const { engine, refresh } = useEngine();
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const profile = engine.settings.getProfile();
  const prefs = engine.settings.getPreferences();
  const days = daysUntil(profile.examDate);

  function toggle(category, key) {
    engine.settings.updatePreferences(category, { [key]: !prefs[category][key] });
    // updatePreferences() only updates in-memory state — the engine leaves
    // *when* to persist to the caller (matching its offline-first design,
    // where saves are normally batched at session-end boundaries). A
    // settings change has no session to end, so this screen is the one
    // place responsible for saving it immediately.
    engine.store.saveProfile(engine.profile);
    refresh();
  }

  function exportData() {
    const data = engine.settings.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kairo-data-${profile.studentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function confirmDelete() {
    await engine.settings.deleteAllData();
    refresh();
    setDeleted(true);
  }

  if (deleted) {
    return (
      <div className="screen center-fill" style={{ textAlign: 'center', gap: 16 }}>
        <div className="h2">Your data has been cleared</div>
        <p className="muted">You can start again whenever you're ready — nothing is held against you.</p>
        <button className="btn btn--secondary" onClick={() => navigate('/')}>Back to Today</button>
      </div>
    );
  }

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

      <div>
        <div className="eyebrow" style={{ marginBottom: 4 }}>Preferences</div>
        <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
          {TOGGLES.map(t => (
            <Toggle
              key={`${t.category}.${t.key}`}
              label={t.label}
              on={!!prefs[t.category]?.[t.key]}
              onToggle={() => toggle(t.category, t.key)}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Your data</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn--outline" onClick={exportData}>Export my data</button>

          {!confirmingDelete ? (
            <button className="btn btn--outline" style={{ color: 'var(--text-muted)' }} onClick={() => setConfirmingDelete(true)}>
              Delete all my data
            </button>
          ) : (
            <div className="card card--sunken">
              <p style={{ margin: '0 0 12px' }}>
                This clears your knowledge map, history, and preferences — permanently, on this device. There's no undo.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--sm" style={{ background: 'var(--kairo-danger-600)', color: '#fff', flex: 1 }} onClick={confirmDelete}>
                  Yes, delete everything
                </button>
                <button className="btn btn--sm btn--outline" style={{ flex: 1 }} onClick={() => setConfirmingDelete(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="faint" style={{ fontSize: 'var(--fs-caption)' }}>
        Member since {new Date(profile.joinedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
