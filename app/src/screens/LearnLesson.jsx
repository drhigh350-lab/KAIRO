import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEngine } from '../engine/EngineProvider.jsx';

/**
 * A single Learn lesson — LearnModule._buildLesson()'s full shape,
 * rendered close to verbatim. This screen writes no comprehension content
 * itself; every sentence (kaiOpening, concept summary, misconceptions,
 * exam insight, memory anchor) already comes back in plain language from
 * the engine, sourced from ExplanationEngine / MisconceptionLibrary.
 */

// lesson.steps.explanation.distractorBreakdown is
// ExplanationEngine's distractor_breakdown part — a structured array of
// { label, text, whyWrong, misconception } (one per wrong option), not a
// string. This picks out the single entry for whichever option the
// student actually chose, matching Learn Module §8.2's "the student's own
// error becomes the lesson's entry point" — the full array would be more
// than a focused lesson needs.
function pickedDistractorNote(lesson) {
  const breakdown = lesson.steps.explanation?.distractorBreakdown;
  if (!breakdown || breakdown.length === 0) return null;
  const picked = lesson.steps.question?.selectedOption;
  const entry = (picked && breakdown.find(d => d.label === picked)) || breakdown[0];
  return entry?.whyWrong || null;
}

export default function LearnLesson() {
  const { conceptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { engine, refresh } = useEngine();

  const [lesson, setLesson] = useState(null);
  const [tryPhase, setTryPhase] = useState('answering'); // answering | feedback | done
  const [selected, setSelected] = useState(null);
  const [masteryCheck, setMasteryCheck] = useState(null);
  const shownAtRef = useRef(0);
  const builtRef = useRef(false);

  useEffect(() => {
    if (builtRef.current) return;
    builtRef.current = true;

    const resumed = engine.learn.resumeLesson(conceptId);
    let built;
    if (resumed) {
      built = resumed;
    } else {
      const ctx = location.state || {};
      built = ctx.entryPoint === 'fromIncorrectAnswer' && ctx.questionId
        ? engine.learn.fromIncorrectAnswer({
            conceptId, questionId: ctx.questionId, selectedOption: ctx.selectedOption,
            errorTag: ctx.errorTag, responseTimeMs: ctx.responseTimeMs
          })
        : engine.learn.fromDashboard({ conceptId });
    }
    setLesson(built);
    shownAtRef.current = Date.now();
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!lesson) return <div className="screen center-fill"><div className="spinner" /></div>;

  const returnTo = (location.state?.entryPoint === 'fromIncorrectAnswer') ? 'practice' : 'learn';

  function finish() {
    const outcome = engine.learn.completeLesson({ conceptId, returnTo });
    refresh();
    navigate(returnTo === 'practice' ? '/practice' : '/learn', { state: { kaiClosing: outcome.kaiClosing?.text } });
  }

  if (lesson.alreadyMastered) {
    return (
      <div className="screen">
        <div className="h1">{lesson.conceptName}</div>
        <div className="card card--sunken"><p style={{ margin: 0 }}>{lesson.kaiOpening.text}</p></div>
        <button className="btn btn--primary btn--full" onClick={finish}>Back to it</button>
      </div>
    );
  }

  const tryQuestionRef = lesson.steps.reinforcementQuestions[0];
  const tryQuestion = tryQuestionRef ? engine.questionGraph.getQuestion(tryQuestionRef.id) : null;

  function submitTry() {
    if (!selected || !tryQuestion) return;
    const responseTimeMs = Date.now() - shownAtRef.current;
    const correct = selected === tryQuestion.correctOption;
    const outcome = engine.learn.submitReinforcementAttempt({
      conceptId, correct, responseTimeMs, questionId: tryQuestion.id
    });
    refresh();
    setMasteryCheck(outcome.masteryCheck);
    setTryPhase('feedback');
  }

  return (
    <div className="screen">
      <div>
        <span className="pill pill--calm">{lesson.subject}</span>
        <div className="h1" style={{ marginTop: 10 }}>{lesson.conceptName}</div>
        <p className="muted" style={{ marginTop: 6 }}>{lesson.kaiOpening.text}</p>
      </div>

      {lesson.topicContext?.text && (
        <div className="pill pill--gold" style={{ width: 'fit-content' }}>{lesson.topicContext.text}</div>
      )}

      {lesson.steps.coreConcept?.conceptSummary && (
        <div className="card">
          <div className="eyebrow">The idea</div>
          <p style={{ margin: '8px 0 0' }}>{lesson.steps.coreConcept.conceptSummary}</p>
        </div>
      )}

      {lesson.steps.simpleBreakdown?.text && (
        <div className="card card--sunken">
          <div className="eyebrow">In simple terms</div>
          <p style={{ margin: '8px 0 0' }}>{lesson.steps.simpleBreakdown.text}</p>
        </div>
      )}

      {pickedDistractorNote(lesson) && (
        <div className="card card--sunken">
          <div className="eyebrow">About what you picked</div>
          <p style={{ margin: '8px 0 0' }}>{pickedDistractorNote(lesson)}</p>
        </div>
      )}

      {lesson.steps.commonMisconceptions.length > 0 && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Common mix-ups</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lesson.steps.commonMisconceptions.map(m => (
              <div key={m.id} className="card" style={{ padding: 12 }}>
                <div style={{ fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-body-sm)' }}>{m.name}</div>
                <div className="muted" style={{ fontSize: 'var(--fs-body-sm)' }}>{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.steps.keyIdea && (
        <div className="pill pill--gold" style={{ width: 'fit-content' }}>💡 {lesson.steps.keyIdea}</div>
      )}
      {lesson.steps.examInsight && (
        <p className="muted" style={{ fontSize: 'var(--fs-body-sm)' }}>Exam tip: {lesson.steps.examInsight}</p>
      )}

      {tryQuestion && tryPhase !== 'done' && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Try it</div>
          <div className="card">
            <p style={{ marginTop: 0 }}>{tryQuestion.stem}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tryQuestion.options.map(opt => {
                const isSelected = selected === opt.label;
                const showState = tryPhase === 'feedback';
                const isCorrectOpt = opt.label === tryQuestion.correctOption;
                let border = 'var(--color-border-subtle)';
                let bg = 'transparent';
                if (showState && isCorrectOpt) { border = 'var(--state-success)'; bg = 'var(--state-success-bg)'; }
                else if (showState && isSelected) { border = 'var(--kairo-blue-500)'; bg = 'var(--kairo-blue-100)'; }
                else if (isSelected) { border = 'var(--kairo-navy-900)'; }
                return (
                  <button key={opt.label} disabled={tryPhase === 'feedback'} onClick={() => setSelected(opt.label)}
                    style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${border}`, background: bg, cursor: tryPhase === 'feedback' ? 'default' : 'pointer', fontSize: 'var(--fs-body-sm)' }}>
                    <strong style={{ marginRight: 8, color: 'var(--text-muted)' }}>{opt.label}</strong>{opt.text}
                  </button>
                );
              })}
            </div>
            {tryPhase === 'answering' ? (
              <button className="btn btn--secondary btn--sm" style={{ marginTop: 14 }} disabled={!selected} onClick={submitTry}>Check</button>
            ) : (
              <p className="muted" style={{ marginTop: 14, marginBottom: 0 }}>{masteryCheck?.text}</p>
            )}
          </div>
        </div>
      )}

      <button className="btn btn--primary btn--full" style={{ marginTop: 'auto' }} onClick={finish}>
        {returnTo === 'practice' ? 'Done — back to practice' : 'Done'}
      </button>
    </div>
  );
}
