import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Button, Card } from '../../components';
import { ScreenHeader, QuestionDiagram } from '../learning/shared';
import { isQuestionBookmarked, reportQuestion, toggleBookmark } from '../../lib/kairoEngine';
import type { CbtPaperQuestion, CbtQuestionResult } from '../../lib/kairoEngine';

type DistractorExplanation = { label: string; text?: string; whyWrong: string };
type ReviewResult = CbtQuestionResult & { distractors?: DistractorExplanation[] };

export interface CbtReviewProps {
  paper: CbtPaperQuestion[];
  questionResults: ReviewResult[];
  onBack?: () => void;
}

/** Saved correction view: one question at a time, with a ledger, Previous/Next controls, bookmark/report actions, and the full distractor diagnosis. */
export function CbtReview({ paper, questionResults, onBack }: CbtReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [reported, setReported] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const result = questionResults[currentIndex];
  const question = result ? paper[result.globalIndex] : undefined;
  const options = question?.options || result?.options || [];

  useEffect(() => {
    setCurrentIndex(0);
  }, [questionResults]);

  useEffect(() => {
    if (!result?.questionId) return;
    setBookmarked(isQuestionBookmarked(result.questionId));
    setReported(false);
  }, [result?.questionId]);

  const distractorMap = useMemo(() => new Map((result?.distractors || []).map((d) => [d.label, d])), [result?.distractors]);
  const wrongOptions = options.filter((opt) => opt.label !== result?.correctOption);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  async function handleBookmark() {
    if (!result?.questionId) return;
    const previous = bookmarked;
    setBookmarked(!previous);
    try {
      setBookmarked(await toggleBookmark(result.questionId));
    } catch {
      setBookmarked(previous);
      flash("Couldn't update bookmark — try again.");
    }
  }

  async function handleReport() {
    if (!result?.questionId || reported) return;
    setReported(true);
    try {
      await reportQuestion(result.questionId, 'report', 'Reported from saved question review');
      flash("Reported — thanks, we'll review this question.");
    } catch {
      setReported(false);
      flash("Couldn't send the report — try again.");
    }
  }

  if (!result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--dark-bg-canvas)' }}>
        <ScreenHeader onBack={onBack} title="Saved correction" tone="dark" />
        <div style={{ padding: 24, color: 'var(--dark-text-muted)', textAlign: 'center' }}>No question-level review is available for this session.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Saved correction" tone="dark" />
      <div style={{ padding: '10px 20px 110px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-text-faint)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {result.subject} · Question {currentIndex + 1} of {questionResults.length}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={handleBookmark} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark question'} style={toolButton(bookmarked)}>{bookmarked ? '★ Saved' : '☆ Save'}</button>
            <button type="button" onClick={handleReport} disabled={reported} aria-label="Report question" style={toolButton(false)}>{reported ? 'Reported' : '⚑ Report'}</button>
          </div>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: 'var(--dark-border)', overflow: 'hidden' }}><div style={{ width: `${((currentIndex + 1) / questionResults.length) * 100}%`, height: '100%', background: 'var(--kairo-gold-500)' }} /></div>

        <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none', padding: 18 }}>
          <div style={{ fontSize: 11, color: result.isCorrect ? 'var(--dark-success)' : 'var(--dark-danger)', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {result.isCorrect ? 'Correct' : result.studentAnswer ? 'Needs review' : 'Not answered'}
          </div>
          <div style={{ fontSize: 19, lineHeight: 1.5, color: 'var(--dark-text-heading)', marginTop: 12, fontWeight: 600 }}>{question?.text || result.text || 'Question text unavailable'}</div>
          <QuestionDiagram imageUrl={question?.imageUrl || result.imageUrl} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
            {options.map((opt) => {
              const isCorrect = opt.label === result.correctOption;
              const isStudentPick = opt.label === result.studentAnswer;
              const color = isCorrect ? 'var(--dark-success)' : isStudentPick ? 'var(--dark-danger)' : 'var(--dark-border)';
              const bg = isCorrect ? 'var(--dark-success-bg)' : isStudentPick ? 'var(--dark-danger-bg)' : 'var(--dark-bg-elevated)';
              return <div key={opt.label} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${color}`, background: bg, color: 'var(--dark-text-body)', fontSize: 15 }}><span style={{ width: 25, height: 25, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, background: isCorrect ? 'var(--dark-success)' : isStudentPick ? 'var(--dark-danger)' : 'transparent', color: isCorrect || isStudentPick ? '#fff' : 'var(--dark-text-muted)', border: `1px solid ${color}` }}>{isCorrect ? '✓' : isStudentPick ? '✕' : opt.label}</span><span>{opt.text}</span></div>;
            })}
          </div>

          <div style={{ marginTop: 18, padding: 14, borderLeft: `4px solid ${result.isCorrect ? 'var(--dark-success)' : 'var(--dark-danger)'}`, background: result.isCorrect ? 'var(--dark-success-bg)' : 'var(--dark-danger-bg)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: result.isCorrect ? 'var(--dark-success)' : 'var(--dark-danger)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Correct answer · {result.correctOption || 'Not available'}</div>
            <div style={{ marginTop: 7, color: 'var(--dark-text-body)', fontSize: 13.5, lineHeight: 1.55 }}>{result.explanation || 'Review the distinction between the correct answer and the distractors below.'}</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--dark-accent-blue)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Why the other options are wrong</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {wrongOptions.slice(0, 3).map((opt) => <div key={opt.label} style={{ padding: '11px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', color: 'var(--dark-text-muted)', fontSize: 13, lineHeight: 1.5 }}><strong style={{ color: 'var(--dark-text-body)' }}>{opt.label}. {opt.text}</strong><div style={{ marginTop: 4 }}>{distractorMap.get(opt.label)?.whyWrong || `This option is not correct because it does not match the rule tested in this question.`}</div></div>)}
            </div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(42px, 1fr))', gap: 6, padding: 12, background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)' }}>
          {questionResults.map((item, index) => <button key={`${item.questionId || index}-${index}`} type="button" onClick={() => setCurrentIndex(index)} aria-label={`Go to question ${index + 1}`} style={{ minHeight: 34, borderRadius: 4, border: index === currentIndex ? '2px solid var(--kairo-gold-500)' : '1px solid transparent', background: item.isCorrect ? 'var(--dark-success)' : item.studentAnswer ? 'var(--dark-danger)' : 'var(--dark-border)', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>{String(index + 1).padStart(2, '0')} {item.isCorrect ? '✓' : item.studentAnswer ? '×' : '·'}</button>)}
        </div>
      </div>
      {toast && <div style={{ position: 'fixed', left: 20, right: 20, bottom: 90, zIndex: 110, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--dark-bg-elevated)', color: 'var(--dark-text-body)', border: '1px solid var(--dark-border)', textAlign: 'center', fontSize: 13 }}>{toast}</div>}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 105, display: 'flex', gap: 10, padding: '10px 20px calc(10px + env(safe-area-inset-bottom))', background: 'var(--dark-bg-canvas)', borderTop: '1px solid var(--dark-border)' }}>
        <Button variant="secondary" size="lg" fullWidth disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}>Previous</Button>
        <Button variant="gold" size="lg" fullWidth disabled={currentIndex === questionResults.length - 1} onClick={() => setCurrentIndex((i) => Math.min(questionResults.length - 1, i + 1))}>{currentIndex === questionResults.length - 1 ? 'Last question' : 'Next question'}</Button>
      </div>
    </div>
  );
}

function toolButton(active: boolean): CSSProperties {
  return { minHeight: 34, padding: '0 10px', borderRadius: 5, border: `1px solid ${active ? 'var(--kairo-gold-500)' : 'var(--dark-border)'}`, background: active ? 'rgba(201,162,39,.12)' : 'transparent', color: active ? 'var(--kairo-gold-500)' : 'var(--dark-text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };
}
