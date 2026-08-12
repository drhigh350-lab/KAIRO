import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngine } from '../engine/EngineProvider.jsx';
import { isRepairWorthy } from '../lib/copy.js';

const DEMO_SUBJECTS = ['Chemistry', 'Biology'];

/**
 * The adaptive practice loop. This screen holds no selection logic of its
 * own — every "what's next" decision comes back from
 * engine.submitAnswer()'s `decision.nextConceptId`
 * (RecommendationEngine.processAnswer under the hood), including its
 * prerequisite reroutes and diagnostic follow-ups. Practice only ever
 * asks the engine "what now" and renders the answer.
 */
export default function Practice() {
  const { engine, refresh } = useEngine();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('loading'); // loading | answering | feedback | summary | empty
  const [conceptId, setConceptId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const shownAtRef = useRef(0);
  const askedRef = useRef({}); // conceptId -> [questionId,...]
  const answeredRef = useRef([]); // [{conceptId, questionId, correct}]
  const previousScoreRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const history = engine.profile.eliteScoreHistory || [];
    previousScoreRef.current = history.length > 0 ? history[history.length - 1] : null;

    if (!engine.currentSession) engine.startSession();
    beginConcept(engine.currentSession.plan[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function beginConcept(id) {
    if (!id) return endTheSession();
    const q = engine.getQuestionForConcept(id, { excludeIds: askedRef.current[id] || [] });
    if (!q) return endTheSession();
    askedRef.current[id] = [...(askedRef.current[id] || []), q.questionId];
    setConceptId(id);
    setQuestion(q);
    setSelected(null);
    setResult(null);
    shownAtRef.current = Date.now();
    setPhase('answering');
  }

  function submit() {
    if (!selected) return;
    const responseTimeMs = Date.now() - shownAtRef.current;
    const correct = selected === question.correctOption;
    const r = engine.submitAnswer({
      conceptId,
      correct,
      responseTimeMs,
      selectedOption: selected,
      correctOption: question.correctOption,
      questionId: question.questionId,
      questionDifficulty: question.difficulty,
      questionType: 'single'
    });
    answeredRef.current.push({ conceptId, questionId: question.questionId, correct });
    refresh();
    setResult(r);
    setPhase('feedback');
  }

  function continueSession() {
    if (result?.shouldEnd || !result?.decision?.nextConceptId) {
      endTheSession();
    } else {
      beginConcept(result.decision.nextConceptId);
    }
  }

  async function endTheSession() {
    if (!engine.currentSession) {
      setPhase('empty');
      return;
    }
    const finished = await engine.endSession();
    refresh();
    if (!finished) {
      setPhase('empty');
      return;
    }
    const conceptIds = [...new Set(answeredRef.current.map(a => a.conceptId))];
    const reinforcedNow = conceptIds.filter(id => engine.graph.getConcept(id)?.retentionState === 'reinforced').length;
    const fadingRemaining = conceptIds.filter(id => engine.graph.getConcept(id)?.retentionState === 'fading').length;
    const scoreChange = previousScoreRef.current
      ? engine.eliteScore.explainChange(previousScoreRef.current, finished.eliteScore)
      : null;

    setSummary({
      questionsAnswered: answeredRef.current.length,
      correctCount: answeredRef.current.filter(a => a.correct).length,
      reinforcedNow,
      fadingRemaining,
      streakText: finished.streak?.message?.text,
      scoreChangeText: scoreChange?.text || null
    });
    setPhase('summary');
  }

  function practiseSubject(subject) {
    const built = engine.startCustomPractice({ subjects: [subject], count: 8 });
    refresh();
    askedRef.current = {};
    answeredRef.current = [];
    setShowPicker(false);
    beginConcept(built.plan?.[0] ?? built.queue?.[0] ?? null);
  }

  if (phase === 'loading') {
    return <div className="screen center-fill"><div className="spinner" /></div>;
  }

  if (phase === 'empty') {
    return (
      <div className="screen">
        <div className="h1">Nothing queued right now</div>
        <p className="muted">Everything you've got is holding steady. Come back to Practice anytime — there's no penalty for stepping away.</p>
        <button className="btn btn--secondary" onClick={() => navigate('/')}>Back to Today</button>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="screen">
        <div className="h1">Session complete</div>
        <div className="card">
          <div className="h3">You worked through {summary.questionsAnswered} question{summary.questionsAnswered !== 1 ? 's' : ''}</div>
          <p className="muted" style={{ marginBottom: 0 }}>{summary.correctCount} correct.</p>
        </div>
        {summary.reinforcedNow > 0 && (
          <div className="card" style={{ background: 'var(--accent-gold-bg)' }}>
            <div style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--kairo-gold-600)' }}>
              {summary.reinforcedNow} concept{summary.reinforcedNow > 1 ? 's' : ''} came back to you after starting to fade
            </div>
            <p className="muted" style={{ marginBottom: 0, marginTop: 4 }}>That's the hardest thing to fake — real learning, not luck.</p>
          </div>
        )}
        {summary.fadingRemaining > 0 && (
          <p className="muted">
            {summary.fadingRemaining} concept{summary.fadingRemaining > 1 ? 's are' : ' is'} still fading — Kairo will bring {summary.fadingRemaining > 1 ? 'them' : 'it'} back soon, no need to track it yourself.
          </p>
        )}
        {summary.scoreChangeText && <p className="muted">{summary.scoreChangeText}</p>}
        {summary.streakText && <div className="pill pill--quiet">{summary.streakText}</div>}
        <button className="btn btn--primary btn--full" onClick={() => navigate('/')}>Done</button>
      </div>
    );
  }

  const concept = engine.graph.getConcept(conceptId);

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="pill pill--calm">{concept?.subject}</span>
        <button className="btn btn--ghost btn--sm" onClick={() => setShowPicker(v => !v)}>Change subject</button>
      </div>

      {showPicker && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DEMO_SUBJECTS.map(s => (
            <button key={s} className="pill pill--quiet" style={{ cursor: 'pointer', border: 'none' }} onClick={() => practiseSubject(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="h2" style={{ lineHeight: 1.4 }}>{question.text}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map(opt => {
          const isSelected = selected === opt.label;
          const showState = phase === 'feedback';
          const isCorrectOpt = opt.label === question.correctOption;
          let border = 'var(--color-border-subtle)';
          let bg = 'var(--color-bg-surface)';
          if (showState && isCorrectOpt) { border = 'var(--state-success)'; bg = 'var(--state-success-bg)'; }
          else if (showState && isSelected && !isCorrectOpt) { border = 'var(--kairo-blue-500)'; bg = 'var(--kairo-blue-100)'; }
          else if (isSelected) { border = 'var(--kairo-navy-900)'; }

          return (
            <button
              key={opt.label}
              data-testid={`option-${opt.label}`}
              disabled={phase === 'feedback'}
              onClick={() => setSelected(opt.label)}
              style={{
                textAlign: 'left', padding: '14px 16px', borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${border}`, background: bg, cursor: phase === 'feedback' ? 'default' : 'pointer',
                fontSize: 'var(--fs-body)', color: 'var(--text-body)', display: 'flex', gap: 10
              }}
            >
              <span style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)' }}>{opt.label}</span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {phase === 'feedback' && result && (
        <div className="card card--sunken">
          <p style={{ margin: 0, color: 'var(--text-body)' }}>{result.kaiResponse?.text}</p>
          {!result.attempt.correct && isRepairWorthy(result.attempt.errorTag) && (
            <button
              className="btn btn--ghost btn--sm"
              style={{ padding: 0, marginTop: 10 }}
              onClick={() => navigate(`/learn/${conceptId}`, {
                state: {
                  entryPoint: 'fromIncorrectAnswer',
                  questionId: question.questionId,
                  selectedOption: selected,
                  errorTag: result.attempt.errorTag,
                  responseTimeMs: result.attempt.responseTimeMs
                }
              })}
            >
              Want a quick explanation of this? →
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        {phase === 'answering' ? (
          <button className="btn btn--primary btn--full" disabled={!selected} onClick={submit}>Submit</button>
        ) : (
          <button className="btn btn--primary btn--full" onClick={continueSession}>Continue</button>
        )}
      </div>
    </div>
  );
}
