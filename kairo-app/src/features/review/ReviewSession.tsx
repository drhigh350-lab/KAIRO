import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, ProgressBar, AnswerFeedback } from '../../components';
import { ScreenHeader } from '../learning/shared';
import {
  getEngine,
  getReviewSessionPlan,
  ensureReviewContentLoaded,
  getReviewOriginalQuestion,
  getReviewReinforcementQuestion,
  getConceptRetentionState,
  type ReviewSessionPlan,
  type ReviewSessionItem,
} from '../../lib/kairoEngine';
import { selectedOptionLabel, type EngineFlatQuestion } from '../../lib/engineAdapter';
import { saveSessionSnapshot, clearSessionSnapshot, getReviewSessionSnapshot } from '../../lib/sessionResume';

type ItemPhase = 'reflect' | 'reinforce';
type Screen = 'loading' | 'framing' | 'item' | 'pattern' | 'summary';

interface ItemResult {
  conceptName: string;
  correct: boolean;
  reinforcedTransition: boolean;
}

/**
 * A real Review Session — Session Framing -> Reflection Moment -> Resolution
 * -> Pattern Surfacing -> Reinforcement Attempt -> Consolidation Summary
 * (Review Module Spec §5.3), replacing "Start Review" simply redirecting
 * into an ordinary Practice weak-areas session with no reflective structure
 * of its own.
 */
export function ReviewSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const isResume = !!(location.state as { resume?: boolean } | null)?.resume;
  const [plan, setPlan] = useState<ReviewSessionPlan | null>(null);
  const [screen, setScreen] = useState<Screen>('loading');
  const [itemIndex, setItemIndex] = useState(0);
  const [phase, setPhase] = useState<ItemPhase>('reinforce');
  const [question, setQuestion] = useState<EngineFlatQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<ItemResult[]>([]);
  const startedAt = useRef(Date.now());
  const patternShown = useRef(false);
  const resumeStartIndex = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Continue Reviewing (Review Module §4.3 item 2) — resume always
      // restarts at the beginning of the item it was on (mid-item reflect
      // vs. reinforce position isn't preserved); prior items' results
      // carry forward so the Consolidation Summary still reflects the
      // whole session, not just what happened after resuming.
      if (isResume) {
        const snapshot = getReviewSessionSnapshot(getEngine()?.profile?.studentId);
        if (snapshot) {
          try {
            const restoredPlan = JSON.parse(snapshot.planJson) as ReviewSessionPlan;
            const restoredResults = JSON.parse(snapshot.resultsJson) as ItemResult[];
            await ensureReviewContentLoaded(restoredPlan.items);
            if (!cancelled) {
              resumeStartIndex.current = Math.min(snapshot.itemIndex, restoredPlan.items.length);
              setResults(restoredResults);
              setPlan(restoredPlan);
              setScreen('framing');
            }
            return;
          } catch {
            // Corrupt snapshot — fall through to a fresh plan below.
          }
        }
      }
      const p = getReviewSessionPlan(8);
      if (p) await ensureReviewContentLoaded(p.items);
      if (!cancelled) {
        setPlan(p);
        setScreen('framing');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toReview = () => navigate('/review');

  function startItem(i: number, currentPlan: ReviewSessionPlan) {
    const item = currentPlan.items[i];
    setItemIndex(i);
    setSelected(null);
    setSubmitted(false);
    startedAt.current = Date.now();
    if (item.hasPriorMiss && item.priorQuestionId) {
      const original = getReviewOriginalQuestion(item.priorQuestionId);
      if (original) {
        setPhase('reflect');
        setQuestion(original);
        setScreen('item');
        return;
      }
    }
    const fresh = getReviewReinforcementQuestion(item.conceptId);
    if (!fresh) {
      // No question available for this concept at all (sparse content pool)
      // — skip it silently rather than rendering a dead screen; it isn't a
      // scored data point either way (Review Module §10's own preservation
      // rule already treats an un-attempted item this way).
      const nextIndex = i + 1;
      if (nextIndex < currentPlan.items.length) {
        startItem(nextIndex, currentPlan);
      } else if (currentPlan.pattern && !patternShown.current) {
        patternShown.current = true;
        setScreen('pattern');
      } else {
        setScreen('summary');
      }
      return;
    }
    setPhase('reinforce');
    setQuestion(fresh);
    setScreen('item');
  }

  function beginSession() {
    if (!plan || plan.items.length === 0) { setScreen('summary'); return; }
    if (resumeStartIndex.current >= plan.items.length) { setScreen('summary'); return; }
    startItem(resumeStartIndex.current, plan);
  }

  function finishItem(correct: boolean, item: ReviewSessionItem, reinforcedTransition = false) {
    const newResults = [...results, { conceptName: item.conceptName, correct, reinforcedTransition }];
    setResults(newResults);
    const nextIndex = itemIndex + 1;
    const studentId = getEngine()?.profile?.studentId;
    if (plan && nextIndex < plan.items.length) {
      // Continue Reviewing — only worth saving once at least one item is
      // genuinely done, same threshold as Practice's Quick Resume.
      saveSessionSnapshot(studentId, {
        kind: 'review',
        planJson: JSON.stringify(plan),
        itemIndex: nextIndex,
        resultsJson: JSON.stringify(newResults),
        savedAt: Date.now(),
      });
      startItem(nextIndex, plan);
    } else {
      clearSessionSnapshot(studentId, 'review');
      if (plan?.pattern && !patternShown.current) {
        patternShown.current = true;
        setScreen('pattern');
      } else {
        setScreen('summary');
      }
    }
  }

  function handleContinue() {
    if (!plan || !question) return;
    const item = plan.items[itemIndex];
    const label = selectedOptionLabel(question, selected);
    const isCorrect = selected !== null && question.options[selected]?.label === question.correctOption;
    const kairo = getEngine();

    if (phase === 'reflect') {
      // The reconsideration itself is a real, logged attempt (Section 7.4's
      // supplementary signal — whether a reconsidered answer self-corrects
      // before resolution is shown) — distinct from the Reinforcement
      // Attempt that follows on a different question (Section 5.8).
      kairo?.submitAnswer({
        conceptId: item.conceptId,
        correct: isCorrect,
        responseTimeMs: Date.now() - startedAt.current,
        selectedOption: label,
        correctOption: question.correctOption,
        questionId: question.id,
        questionDifficulty: question.difficulty,
      });
      const reinforceQ = getReviewReinforcementQuestion(item.conceptId, question.id);
      setSelected(null);
      setSubmitted(false);
      startedAt.current = Date.now();
      if (reinforceQ) {
        setPhase('reinforce');
        setQuestion(reinforceQ);
      } else {
        finishItem(isCorrect, item);
      }
      return;
    }

    const preState = getConceptRetentionState(item.conceptId);
    const result = kairo?.submitAnswer({
      conceptId: item.conceptId,
      correct: isCorrect,
      responseTimeMs: Date.now() - startedAt.current,
      selectedOption: label,
      correctOption: question.correctOption,
      questionId: question.id,
      questionDifficulty: question.difficulty,
    });
    const reinforcedTransition = preState !== 'reinforced' && result?.conceptState === 'reinforced';
    finishItem(isCorrect, item, reinforcedTransition);
  }

  if (screen === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Preparing your review…</div>
      </div>
    );
  }

  if (screen === 'framing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <ScreenHeader onBack={toReview} title="Review Session" tone="dark" />
        <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 19, color: 'var(--dark-text-heading)', lineHeight: 1.4 }}>{plan?.framing}</div>
          {plan && plan.items.length > 0 && (
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)' }}>About {plan.estimatedTimeMin} minute{plan.estimatedTimeMin === 1 ? '' : 's'}.</div>
          )}
          <div style={{ marginTop: 'auto' }}>
            {plan && plan.items.length > 0 ? (
              <Button variant="darkAccent" size="lg" fullWidth onClick={beginSession}>Begin</Button>
            ) : (
              <Button variant="darkAccent" size="lg" fullWidth onClick={toReview}>Back to Review</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'item' && question && plan) {
    const item = plan.items[itemIndex];
    const isCorrect = submitted && selected !== null && question.options[selected]?.label === question.correctOption;
    const isLastPhaseOfLastItem = itemIndex + 1 === plan.items.length;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <div className="app-topbar" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px 10px', background: 'var(--dark-bg-canvas)' }}>
          <ScreenHeader onBack={toReview} title={`Review ${itemIndex + 1} of ${plan.items.length}`} tone="dark" />
          <ProgressBar value={itemIndex + 1} max={plan.items.length} tone="dark" />
        </div>

        <div style={{ padding: '10px 20px 22px', flex: 1 }}>
          {phase === 'reflect' && (
            <div style={{ fontSize: 13, color: 'var(--dark-accent-blue)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>
              Take another look — what would you answer now?
            </div>
          )}
          {phase === 'reinforce' && item.hasPriorMiss && (
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>
              One more on this, to make sure it sticks.
            </div>
          )}
          {phase === 'reinforce' && !item.hasPriorMiss && (
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>
              {item.reason === 'fading' ? "This one's coming back around before you forget it." : "Coming back around for a fresh look."}
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', textTransform: 'uppercase' }}>{question.subject} · {question.topic}</div>
          <div style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--dark-text-body)', marginTop: 16, fontWeight: 500 }}>{question.text}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
            {question.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrectOpt = opt.label === question.correctOption;
              const showCorrect = submitted && isCorrectOpt;
              const showWrongPick = submitted && isSelected && !isCorrectOpt;
              const wasPriorPick = phase === 'reflect' && !submitted && item.priorSelectedOption === opt.label;
              let border = 'var(--dark-border)', bg = 'var(--dark-bg-surface)';
              if (!submitted && isSelected) { border = 'var(--dark-accent-blue)'; bg = 'var(--dark-bg-elevated)'; }
              if (showCorrect) { border = 'var(--dark-success)'; bg = 'var(--dark-success-bg)'; }
              if (showWrongPick) { border = 'var(--dark-danger)'; bg = 'var(--dark-danger-bg)'; }
              return (
                <button key={opt.label} disabled={submitted} onClick={() => setSelected(i)} style={{
                  textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${border}`,
                  background: bg, color: 'var(--dark-text-body)', fontSize: 16, cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit',
                  display: 'flex', gap: 10, alignItems: 'center', width: '100%',
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                    border: `1.5px solid ${isSelected || showCorrect ? border : 'var(--dark-text-faint)'}`,
                    background: (isSelected && !submitted) ? 'var(--dark-accent-blue)' : showCorrect ? 'var(--dark-success)' : showWrongPick ? 'var(--dark-danger)' : 'transparent',
                    color: ((isSelected && !submitted) || showCorrect || showWrongPick) ? '#fff' : 'var(--dark-text-muted)',
                  }}>{showCorrect ? '✓' : showWrongPick ? '✕' : opt.label}</span>
                  <span style={{ flex: 1 }}>{opt.text}</span>
                  {wasPriorPick && <span style={{ fontSize: 11, color: 'var(--dark-text-faint)', flexShrink: 0 }}>Your previous answer</span>}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div style={{ marginTop: 22 }}>
              <AnswerFeedback dark correct={isCorrect} title={isCorrect ? "That's correct" : `Correct answer: ${question.correctOption}`} detail={question.explanation || 'Review the option above marked correct.'} />
            </div>
          )}
        </div>

        <div className="app-footer-bar" style={{ padding: '16px 20px 24px', background: 'var(--dark-bg-canvas)' }}>
          {!submitted ? (
            <Button variant="darkAccent" size="lg" fullWidth disabled={selected === null} onClick={() => setSubmitted(true)}>Submit Answer</Button>
          ) : (
            <Button variant="darkAccent" size="lg" fullWidth onClick={handleContinue}>
              {phase === 'reflect' ? 'Continue' : isLastPhaseOfLastItem ? 'Finish Review' : 'Next'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'pattern' && plan?.pattern) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <ScreenHeader title="A pattern worth noting" tone="dark" />
        <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ background: 'var(--dark-bg-elevated)', boxShadow: 'none' }}>
            <div style={{ fontSize: 15, color: 'var(--dark-text-heading)', lineHeight: 1.6 }}>
              "{plan.pattern.tag.replace(/_/g, ' ')}" showed up {plan.pattern.count} times in this session — that's one clear pattern worth fixing, not {plan.pattern.count} separate mistakes.
            </div>
          </Card>
          <div style={{ marginTop: 'auto' }}>
            <Button variant="darkAccent" size="lg" fullWidth onClick={() => setScreen('summary')}>Continue</Button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'summary') {
    const heldUp = results.filter((r) => r.correct).length;
    const stillShaky = results.length - heldUp;
    const reinforced = results.filter((r) => r.reinforcedTransition);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <ScreenHeader title="Session Complete" tone="dark" />
        <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--dark-text-heading)' }}>
            {results.length === 0 ? "Nothing to review this time." : `${heldUp} concept${heldUp === 1 ? '' : 's'} held up${stillShaky > 0 ? `, ${stillShaky} need${stillShaky === 1 ? 's' : ''} another look` : ''}.`}
          </div>
          {reinforced.length > 0 && (
            <Card style={{ background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))', color: '#fff', boxShadow: '0 8px 30px var(--dark-accent-blue-glow)' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Reinforced</div>
              <div style={{ fontSize: 14, marginTop: 6, color: 'rgba(255,255,255,0.9)' }}>
                {reinforced.map((r) => r.conceptName).join(', ')} moved all the way to Reinforced — recall held up even after the gap. That's the real milestone.
              </div>
            </Card>
          )}
          {stillShaky > 0 && (
            <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', lineHeight: 1.5 }}>
              What's still shaky will keep resurfacing here and in Practice until it holds — nothing you missed just vanishes.
            </div>
          )}
          <div style={{ marginTop: 'auto' }}>
            <Button variant="darkAccent" size="lg" fullWidth onClick={toReview}>Done</Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
