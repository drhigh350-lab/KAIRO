import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ProgressBar, AnswerFeedback, Button, IconButton, Badge } from '../../components';
import {
  BookmarkIcon, CalcIcon, OverflowIcon, KaiPanel, ConfidenceRating,
  InlineToast, Modal, OverflowMenu, MiniCalculator, type ConfidenceLevel,
} from '../learning/shared';
import type { PracticeQuestion as PracticeQuestionData } from './data';
import { generateKaiTextWithDiagnostics } from '../../lib/kaiAi';
import { reportQuestion, isQuestionBookmarked, toggleBookmark } from '../../lib/kairoEngine';

export interface PracticeQuestionResult {
  correct: boolean;
  confidence: ConfidenceLevel | null;
  selectedIndex: number | null;
  /** Real elapsed time from this question rendering to the student submitting — same stopwatch pattern as CBT Exam Mode and Rapid Fire, not an estimate. */
  responseTimeMs: number;
  /** How many times the student switched their selected option before hitting Submit (0 = went with their first pick). Feeds the Hesitation Penalty Insight — see KairoEngine.submitAnswer()'s answerChangeCount. */
  answerChanges: number;
}

/** Shape of ExplanationEngine.generate()'s output (kairo-learning-engine's
 * qim/ExplanationEngine.js) — the same structure LearnModule already
 * consumes, now also returned from submitAnswer() for Practice. Loosely
 * typed on purpose: the engine ships as plain JS with no declared types
 * (see kairo-learning-engine.d.ts), so this models only the fields this
 * component actually reads rather than the engine's full internal shape. */
export interface PracticeExplanationDistractor {
  label: string;
  text: string;
  whyWrong: string;
  misconception: { id: string; name: string; description: string } | null;
}
export interface PracticeExplanationPart {
  type: string;
  title: string;
  content: string | PracticeExplanationDistractor[];
}
export interface PracticeExplanation {
  questionId: string;
  parts: PracticeExplanationPart[];
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

export interface PracticeQuestionProps {
  question: PracticeQuestionData;
  index: number;
  total: number;
  onNext: (result: PracticeQuestionResult) => void;
  onExit: () => void;
  /** Fires once, right when the answer is graded — before the student advances — so a caller can record the real attempt and offer a "Learn this" follow-up immediately. */
  onAnswered?: (result: { correct: boolean; selectedIndex: number | null; responseTimeMs: number; answerChanges: number }) => void;
  /** Only rendered when the answer was wrong and a caller passes this — routes to the real Learn Module lesson for the concept just missed. */
  onLearnThis?: () => void;
  /** Kai's real, context-aware response to this specific attempt (from submitAnswer()'s kaiResponse, optionally upgraded by generateKaiText()) — falls back to question.kai if not provided. */
  kaiNote?: string | null;
  /** The same ExplanationEngine output Learn already renders (distractor breakdown, misconception diagnosis, exam tip) — from submitAnswer()'s explanation field. Absent for older engine builds or a question missing from questionGraph; every render below degrades cleanly when it's null. */
  explanation?: PracticeExplanation | null;
  /** RecommendationEngine.processAnswer()'s per-answer interrupt — computed on every answer, previously discarded entirely. Absent (null) on the ordinary 'continue' case; present when Kairo is rerouting to a weak prerequisite, dropping to a lower-stakes diagnostic question after a guess, or easing off after repeated careless slips. `reason` is the engine's own real sentence — rendered verbatim, not paraphrased. */
  nextStepNote?: { action: string; reason: string } | null;
  /** Set for sessions with no student-picked question count (Mixed Practice / a weak-topic boost, both now uncapped to "every real question available") — a raw "Question 7 of 23" reads as an arbitrary number the student never chose, so the header shows completion percentage instead. */
  showPercent?: boolean;
  /** Seconds allotted for this question under Custom Timer / Exam Pace pacing (PracticeHub) — null under Study (untimed) pacing, which shows no countdown at all. */
  timerSec?: number | null;
}

const NEXT_STEP_TITLES: Record<string, string> = {
  reroute_prerequisite: 'Before we continue',
  diagnostic: "Let's check something",
  difficulty_pullback: 'Easing up a little',
};

export function CloseIconSmall() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 6h16M4 18h10" /></svg>;
}
export function FeedbackIconSmall() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
}

export function PracticeQuestion({ question, index, total, onNext, onExit, onAnswered, onLearnThis, explanation, nextStepNote, showPercent, timerSec = null }: PracticeQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isQuestionBookmarked(question.id));
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [reported, setReported] = useState(false);
  const [hideElim, setHideElim] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const questionStartedAt = useRef(Date.now());
  // Guards against a duplicate advance (e.g. two rapid taps landing before
  // the button can visually disable) firing onNext twice for the same
  // question — the root cause class behind "Finish Session" occasionally
  // re-surfacing questions past the real end of a session.
  const hasAdvancedRef = useRef(false);

  // Custom Timer / Exam Pace countdown (Practice Module Spec §5.11: "framed
  // as a pacing aid, not a penalty countdown" — kept calm/neutral, never a
  // red flashing warning). null under Study pacing, which shows nothing.
  const [timeLeft, setTimeLeft] = useState<number | null>(timerSec);
  const submittedRef = useRef(false);
  const selectedRef = useRef<number | null>(null);
  // Hesitation Penalty Insight: real count of option switches before
  // Submit, not the final answer alone — a ref (not state) since the
  // auto-submit timer callback below needs the latest value without
  // re-subscribing its interval on every change.
  const [answerChanges, setAnswerChanges] = useState(0);
  const answerChangesRef = useRef(0);

  // Re-syncs against the real bookmark set in case loadBookmarks() (called
  // once when Practice starts) hadn't resolved yet when this question's
  // initial state was computed.
  useEffect(() => {
    setBookmarked(isQuestionBookmarked(question.id));
  }, [question.id]);

  useEffect(() => { submittedRef.current = submitted; }, [submitted]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { answerChangesRef.current = answerChanges; }, [answerChanges]);

  // One countdown per question (this component remounts per question via
  // its `key`, so timeLeft always starts fresh at timerSec). Ticks down
  // once a second and auto-submits — with whatever was selected, or none —
  // the moment it reaches zero, exactly like the student tapping Submit.
  useEffect(() => {
    if (timerSec == null) return;
    const interval = setInterval(() => {
      if (submittedRef.current) return;
      setTimeLeft((t) => {
        if (t !== null && t <= 1) {
          submittedRef.current = true;
          setSubmitted(true);
          onAnswered?.({ correct: selectedRef.current === question.correct, selectedIndex: selectedRef.current, responseTimeMs: Date.now() - questionStartedAt.current, answerChanges: answerChangesRef.current });
          return 0;
        }
        return t !== null ? t - 1 : null;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerSec]);

  function submit() {
    setSubmitted(true);
    onAnswered?.({ correct: selected === question.correct, selectedIndex: selected, responseTimeMs: Date.now() - questionStartedAt.current, answerChanges });
  }
  function flashToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2200); }
  async function handleBookmarkToggle() {
    const prev = bookmarked;
    setBookmarked(!prev);
    try {
      const newState = await toggleBookmark(question.id);
      setBookmarked(newState);
    } catch {
      setBookmarked(prev);
      flashToast("Couldn't update bookmark — try again.");
    }
  }
  async function report(reason?: string) {
    if (reported) return;
    setReported(true);
    setShowReportSheet(false);
    flashToast("Thanks — we'll take a look at this question.");
    try {
      await reportQuestion(question.id, 'report', reason);
    } catch {
      setReported(false);
      flashToast("Couldn't send that — try again.");
    }
  }
  async function sendFeedback() {
    try {
      await reportQuestion(question.id, 'feedback');
      flashToast('Feedback sent — thanks for helping Kai improve.');
    } catch {
      flashToast("Couldn't send that — try again.");
    }
  }

  /**
   * KaiPanel's "Ask Kai for more" row (Explain again / Give another example
   * / Simplify / Teach from scratch / Show formula / Show memory trick) —
   * previously had no onAction handler at all, so tapping any of them did
   * nothing. Uses the diagnostics variant and throws the real failure
   * reason on error (KaiPanel surfaces it) — temporary, while tracking
   * down why some calls to kai-generate never even reach Supabase's logs.
   */
  async function handleKaiFollowupAction(action: string): Promise<string | null> {
    const result = await generateKaiTextWithDiagnostics('explain_followup', {
      action,
      subject: question.subject,
      topic: question.topic,
      questionText: question.stem,
      options: question.options.map((text, i) => ({ label: String.fromCharCode(65 + i), text })),
      correctOption: String.fromCharCode(65 + question.correct),
      explanation: question.why,
    });
    if (!result.text) throw new Error(result.errorDetail || "Kai couldn't get to that just now — try again.");
    return result.text;
  }

  const isCorrect = selected === question.correct;

  // ExplanationEngine only includes distractor_breakdown/common_mistake
  // when the attempt was wrong (see qim/ExplanationEngine.js's generate())
  // — exam_tip is included either way, so it's read independently below.
  const distractorPart = explanation?.parts.find((p) => p.type === 'distractor_breakdown');
  const distractors = Array.isArray(distractorPart?.content) ? distractorPart.content : [];
  const examTipPart = explanation?.parts.find((p) => p.type === 'exam_tip');
  const examTip = typeof examTipPart?.content === 'string' ? examTipPart.content : null;
  const selectedLabel = selected !== null ? String.fromCharCode(65 + selected) : null;
  const yourMisconception = distractors.find((d) => d.label === selectedLabel)?.misconception ?? null;

  const overflowItems = [
    { label: hideElim ? 'Show elimination marks' : 'Hide elimination marks', icon: <CloseIconSmall />, onClick: () => setHideElim((h) => !h) },
    { label: 'Question feedback', icon: <FeedbackIconSmall />, onClick: sendFeedback },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', position: 'relative', background: 'var(--dark-bg-canvas)' }}>
      {toastMsg && <InlineToast>{toastMsg}</InlineToast>}
      <div className="app-topbar" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px 10px', background: 'var(--dark-bg-canvas)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton dark onClick={() => setShowExitConfirm(true)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg></IconButton>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-muted)' }}>
              {showPercent ? `${Math.round(((index + 1) / total) * 100)}% complete` : `Question ${index + 1} of ${total}`}
            </div>
            {timeLeft !== null && (
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)' }}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <IconButton dark active={bookmarked} onClick={handleBookmarkToggle}><BookmarkIcon filled={bookmarked} /></IconButton>
            <IconButton dark onClick={() => setShowCalc(true)}><CalcIcon /></IconButton>
            <IconButton dark onClick={() => setShowOverflow(true)}><OverflowIcon /></IconButton>
          </div>
        </div>
        <ProgressBar value={index + 1} max={total} tone="dark" />
      </div>
      {showOverflow && <OverflowMenu items={overflowItems} onClose={() => setShowOverflow(false)} tone="dark" />}
      {showCalc && (
        <Modal onClose={() => setShowCalc(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--dark-text-heading)', marginBottom: 14 }}>Calculator</div>
          <MiniCalculator tone="dark" />
        </Modal>
      )}
      {showExitConfirm && (
        <Modal onClose={() => setShowExitConfirm(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Leave session?</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', lineHeight: 1.5, marginBottom: 20 }}>Your progress in this session won't be recorded if you leave now.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="darkAccent" size="lg" fullWidth onClick={() => setShowExitConfirm(false)}>Resume Practice</Button>
            <Button variant="danger" size="lg" fullWidth onClick={onExit}>Quit Session</Button>
          </div>
        </Modal>
      )}
      {showReportSheet && (
        <Modal onClose={() => setShowReportSheet(false)} tone="dark">
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, color: 'var(--dark-text-heading)', marginBottom: 14 }}>What's wrong with this question?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Typo / Formatting', 'Wrong Answer Key', 'Incomplete Question'].map((reason) => (
              <button key={reason} type="button" onClick={() => report(reason)} style={{
                textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--dark-border)', background: 'var(--dark-bg-surface)', color: 'var(--dark-text-body)',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>{reason}</button>
            ))}
          </div>
        </Modal>
      )}

      <div style={{ padding: '22px 20px', flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', textTransform: 'uppercase' }}>{question.subject} · {question.topic}</div>
        <div style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--dark-text-body)', marginTop: 16, fontWeight: 500 }}>{question.stem}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const showCorrect = submitted && i === question.correct;
            const showWrongPick = submitted && isSelected && i !== question.correct;
            let border = 'var(--dark-border)', bg = 'var(--dark-bg-surface)';
            if (!submitted && isSelected) { border = 'var(--dark-accent-blue)'; bg = 'var(--dark-bg-elevated)'; }
            if (showCorrect) { border = 'var(--dark-success)'; bg = 'var(--dark-success-bg)'; }
            if (showWrongPick && !hideElim) { border = 'var(--dark-danger)'; bg = 'var(--dark-danger-bg)'; }
            return (
              <button key={i} disabled={submitted} onClick={() => {
                setSelected((prev) => {
                  if (prev !== null && prev !== i) setAnswerChanges((c) => c + 1);
                  return i;
                });
              }} style={{
                textAlign: 'left', minHeight: 'var(--touch-min)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${border}`,
                background: bg, color: 'var(--dark-text-body)', fontSize: 16, cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit',
                display: 'flex', gap: 10, alignItems: 'center', transition: 'background var(--dur-base), border-color var(--dur-base)',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${isSelected || showCorrect ? border : 'var(--dark-text-faint)'}`,
                  background: (isSelected && !submitted) ? 'var(--dark-accent-blue)' : showCorrect ? 'var(--dark-success)' : showWrongPick ? 'var(--dark-danger)' : 'transparent',
                  color: ((isSelected && !submitted) || showCorrect || showWrongPick) ? '#fff' : 'var(--dark-text-muted)',
                }}>{showCorrect ? '✓' : (showWrongPick && !hideElim) ? '✕' : String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <AnswerFeedback dark correct={isCorrect} title={isCorrect ? "That's correct" : `Correct answer: ${String.fromCharCode(65 + question.correct)}`} detail={question.why} />

            {!isCorrect && yourMisconception && (
              <KaiPanel tone="dark" note={<><strong style={{ color: 'var(--dark-text-heading)' }}>{yourMisconception.name} — </strong>{yourMisconception.description}</>} />
            )}

            {distractors.length > 0 && (
              <Section title="Why the other options are wrong">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {distractors.map((d) => (
                    <div key={d.label}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {/* distractors excludes the correct option, so this can only ever
                            match a genuine wrong pick — never a red flag on a correct answer. */}
                        {d.label === selectedLabel && !isCorrect && <Badge tone="danger">Your answer</Badge>}
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{d.label}. {d.text}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', lineHeight: 1.55 }}>{d.whyWrong}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {examTip && (
              <KaiPanel tone="dark" note={<><strong style={{ color: 'var(--dark-text-heading)' }}>Exam strategy — </strong>{examTip}</>} />
            )}

            {!isCorrect && onLearnThis && (
              <button type="button" onClick={onLearnThis} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 'var(--touch-min)', padding: '12px 16px',
                borderRadius: 'var(--radius-md)', border: '1.5px solid var(--dark-accent-blue)', background: 'rgba(46,124,246,0.1)',
                color: 'var(--dark-accent-blue)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z" /></svg>
                Understand this before moving on
              </button>
            )}

            {nextStepNote && (
              <KaiPanel tone="dark" note={<><strong style={{ color: 'var(--dark-text-heading)' }}>{NEXT_STEP_TITLES[nextStepNote.action] ?? "What's next"} — </strong>{nextStepNote.reason}</>} />
            )}

            <KaiPanel tone="dark" onAction={handleKaiFollowupAction} comingSoon />

            <ConfidenceRating value={confidence} onChange={setConfidence} tone="dark" />
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button type="button" onClick={() => setShowReportSheet(true)} disabled={reported} style={{
            background: 'none', border: 'none', cursor: reported ? 'default' : 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, color: reported ? 'var(--dark-text-faint)' : 'var(--kairo-gold-500, #e0a039)', padding: 8,
          }}>{reported ? 'Reported — thanks for the heads-up' : 'Report an issue with this question'}</button>
        </div>
      </div>

      <div className="app-footer-bar" style={{ padding: '16px 20px 24px', background: 'var(--dark-bg-canvas)' }}>
        {!submitted ? (
          <Button variant="darkAccent" size="lg" fullWidth disabled={selected === null} onClick={submit}>Submit Answer</Button>
        ) : (
          <Button variant="darkAccent" size="lg" fullWidth disabled={hasAdvancedRef.current} onClick={() => {
            if (hasAdvancedRef.current) return;
            hasAdvancedRef.current = true;
            onNext({ correct: isCorrect, confidence, selectedIndex: selected, responseTimeMs: Date.now() - questionStartedAt.current, answerChanges });
          }}>{index + 1 === total ? 'Finish Session' : 'Next Question'}</Button>
        )}
      </div>
    </div>
  );
}
