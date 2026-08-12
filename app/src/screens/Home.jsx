import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngine } from '../engine/EngineProvider.jsx';
import { macroStateFraming, reasonClauseForConcept, reviewReasonClause } from '../lib/copy.js';

/**
 * Home / Today — the orientation layer. On every visit it asks the engine
 * exactly once "what matters right now" and renders that as a single
 * obvious primary action with its reason attached. It never re-derives a
 * recommendation itself — either ReviewModule's pre-session recap or
 * RecommendationEngine's session plan (via engine.startSession()) decides,
 * and this screen only reads the result and puts it into words.
 */
export default function Home() {
  const { engine, refresh } = useEngine();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const recap = engine.review.getPreSessionRecap();
    let session;
    let primaryLabel;
    let reasonClause;
    let kaiVoice;
    let secondaryNote = null;

    if (recap) {
      const planIds = recap.recap.queue.map(item => item.id);
      session = engine.startSession({ mode: 'standard', plan: planIds });
      const count = recap.recap.queue.length;
      primaryLabel = `Review ${count} concept${count > 1 ? 's' : ''}`;
      reasonClause = reviewReasonClause(recap.recap.breakdown);
      kaiVoice = recap.message;
    } else {
      session = engine.startSession();
      const firstId = session.queue[0];
      const firstConcept = firstId ? engine.graph.getConcept(firstId) : null;
      primaryLabel = firstConcept ? `Practise ${firstConcept.subject} — ${firstConcept.name}` : 'Start a session';
      reasonClause = firstConcept ? reasonClauseForConcept(firstConcept) : "it's what's next";
      kaiVoice = session.kaiMessage?.text || null;
    }

    if (session.queue.length > 1) {
      const others = session.queue.length - 1;
      secondaryNote = `Plus ${others} more concept${others > 1 ? 's' : ''} queued after that, adjusting as you go.`;
    }

    setPlan({ session, primaryLabel, reasonClause, kaiVoice, secondaryNote, questionCount: session.queue.length });
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!plan) {
    return <div className="screen center-fill"><div className="spinner" /></div>;
  }

  const framing = macroStateFraming(engine.profile.macroState);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (engine.profile.name || '').split(' ')[0];

  return (
    <div className="screen">
      <div>
        <div className="muted" style={{ fontSize: 'var(--fs-body)' }}>{greeting}, {firstName}.</div>
        <div className="h1" style={{ marginTop: 2 }}>{framing.where}</div>
      </div>

      <div className="card card--primary">
        <div className="eyebrow" style={{ color: 'var(--kairo-blue-300)' }}>Today's focus</div>
        <div className="h2" style={{ color: '#fff', marginTop: 8 }}>{plan.primaryLabel}</div>
        <p style={{ color: 'var(--kairo-blue-200)', fontSize: 'var(--fs-body-sm)', marginTop: 10, marginBottom: 0 }}>
          Kairo recommends this because {plan.reasonClause}.
        </p>
        {plan.kaiVoice && (
          <p style={{ color: '#fff', fontSize: 'var(--fs-body-sm)', marginTop: 10, marginBottom: 0, fontStyle: 'italic', opacity: 0.92 }}>
            "{plan.kaiVoice}"
          </p>
        )}
        {plan.questionCount > 0 ? (
          <button
            className="btn btn--primary btn--full"
            style={{ marginTop: 20 }}
            onClick={() => navigate('/practice')}
          >
            Start
          </button>
        ) : (
          <p style={{ color: 'var(--kairo-blue-200)', fontSize: 'var(--fs-body-sm)', marginTop: 16, marginBottom: 0 }}>
            Nothing urgent today — you're welcome to practise anyway, entirely up to you.
          </p>
        )}
        {plan.secondaryNote && (
          <div className="faint" style={{ color: 'var(--kairo-blue-300)', fontSize: 'var(--fs-caption)', marginTop: 12 }}>
            {plan.secondaryNote}
          </div>
        )}
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Or, choose something else</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AltAction
            label="Pick a subject to practise"
            desc="Choose exactly what you work on."
            onClick={() => navigate('/practice')}
          />
          <AltAction
            label="See what needs understanding"
            desc="A short list of concepts worth a closer look."
            onClick={() => navigate('/learn')}
          />
        </div>
      </div>

      <StreakLine engine={engine} />
    </div>
  );
}

function AltAction({ label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{ textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <span style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)', fontSize: 'var(--fs-body)' }}>{label}</span>
      <span className="muted" style={{ fontSize: 'var(--fs-body-sm)' }}>{desc}</span>
    </button>
  );
}

function StreakLine({ engine }) {
  const status = engine.getStreakStatus();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 var(--space-1)' }}>
      <span className="pill pill--quiet">{status.message.text}</span>
    </div>
  );
}

