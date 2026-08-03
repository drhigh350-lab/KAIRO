import { useState } from 'react';
import type { ReactNode } from 'react';
import { ProgressBar, AnswerFeedback, Button, IconButton } from '../../components';
import {
  BookmarkIcon, ReportIcon, FlagIcon, CalcIcon, OverflowIcon, KaiPanel, ConfidenceRating,
  InlineToast, Modal, OverflowMenu, MiniCalculator, type ConfidenceLevel,
} from '../learning/shared';
import type { PracticeQuestion as PracticeQuestionData } from './data';

export interface PracticeQuestionResult {
  correct: boolean;
  confidence: ConfidenceLevel | null;
  selectedIndex: number | null;
}

export interface PracticeQuestionProps {
  question: PracticeQuestionData;
  index: number;
  total: number;
  onNext: (result: PracticeQuestionResult) => void;
  onExit: () => void;
}

export function CloseIconSmall() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 6h16M4 18h10" /></svg>;
}
export function FeedbackIconSmall() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
}

export function PracticeQuestion({ question, index, total, onNext, onExit }: PracticeQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [reported, setReported] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [hideElim, setHideElim] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function submit() { setSubmitted(true); }
  function flashToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2200); }
  function report() { setReported(true); flashToast("Thanks — we'll take a look at this question."); }
  function toggleFlag() { setFlagged((f) => !f); flashToast(!flagged ? 'Flagged for review.' : 'Flag removed.'); }
  function sendFeedback() { flashToast('Feedback sent — thanks for helping Kai improve.'); }

  const isCorrect = selected === question.correct;

  const overflowItems = [
    { label: flagged ? 'Unflag question' : 'Flag question', icon: <FlagIcon filled={flagged} />, onClick: toggleFlag },
    { label: reported ? 'Question reported' : 'Report question', icon: <ReportIcon />, onClick: report, tone: 'danger' as const },
    { label: hideElim ? 'Show elimination marks' : 'Hide elimination marks', icon: <CloseIconSmall />, onClick: () => setHideElim((h) => !h) },
    { label: 'Question feedback', icon: <FeedbackIconSmall />, onClick: sendFeedback },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', position: 'relative', background: 'var(--dark-bg-canvas)' }}>
      {toastMsg && <InlineToast>{toastMsg}</InlineToast>}
      <div className="app-topbar" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px 10px', background: 'var(--dark-bg-canvas)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton dark onClick={onExit}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg></IconButton>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-muted)' }}>Question {index + 1} of {total}</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <IconButton dark active={bookmarked} onClick={() => setBookmarked(!bookmarked)}><BookmarkIcon filled={bookmarked} /></IconButton>
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
              <button key={i} disabled={submitted} onClick={() => setSelected(i)} style={{
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

            <ExplanationBlock question={question} />

            <KaiPanel note={question.kai} tone="dark" />

            <ConfidenceRating value={confidence} onChange={setConfidence} tone="dark" />
          </div>
        )}
      </div>

      <div className="app-footer-bar" style={{ padding: '16px 20px 24px', background: 'var(--dark-bg-canvas)' }}>
        {!submitted ? (
          <Button variant="darkAccent" size="lg" fullWidth disabled={selected === null} onClick={submit}>Submit Answer</Button>
        ) : (
          <Button variant="darkAccent" size="lg" fullWidth onClick={() => onNext({ correct: isCorrect, confidence, selectedIndex: selected })}>{index + 1 === total ? 'Finish Session' : 'Next Question'}</Button>
        )}
      </div>
    </div>
  );
}

export interface ExplanationBlockProps {
  question: PracticeQuestionData;
}

export function ExplanationBlock({ question }: ExplanationBlockProps) {
  const rows: { label: string; body: ReactNode }[] = [
    { label: 'Common mistake', body: question.mistake },
    { label: 'Key concept', body: question.concept },
    { label: 'Exam tip', body: question.tip },
  ];
  return (
    <div style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--dark-text-heading)' }}>Why this matters</div>
      {rows.map((r) => (
        <div key={r.label}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{r.label}</div>
          <div style={{ fontSize: 13, color: 'var(--dark-text-body)', lineHeight: 1.55, marginTop: 4 }}>{r.body}</div>
        </div>
      ))}
    </div>
  );
}
