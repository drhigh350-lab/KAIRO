import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button, Badge } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { KaiMark } from '../onboarding/shared';
import { PracticeQuestion } from '../practice/PracticeQuestion';
import { toUiQuestion, type EngineFlatQuestion } from '../../lib/engineAdapter';
import {
  resumeLearnLesson, getLearnQuestion, submitLearnReinforcement, completeLearnLesson,
  type LearnLesson as LearnLessonData, type LearnCompletion,
} from '../../lib/kairoEngine';

type Screen = 'lesson' | 'reinforcement' | 'closing';

export function LearnLesson() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo || '/practice';

  const [lesson, setLesson] = useState<LearnLessonData | null | undefined>(undefined);
  const [screen, setScreen] = useState<Screen>('lesson');
  const [rIndex, setRIndex] = useState(0);
  const [rQuestion, setRQuestion] = useState<EngineFlatQuestion | null | undefined>(undefined);
  const [closing, setClosing] = useState<LearnCompletion | null>(null);

  useEffect(() => {
    if (!conceptId) return;
    setLesson(resumeLearnLesson(conceptId));
  }, [conceptId]);

  useEffect(() => {
    if (screen !== 'reinforcement' || !lesson) return;
    const q = lesson.steps.reinforcementQuestions[rIndex];
    if (!q) return;
    setRQuestion(getLearnQuestion(q.id));
  }, [screen, rIndex, lesson]);

  function exit() { navigate(returnTo); }

  async function finish() {
    if (!conceptId) return exit();
    try {
      const result = await completeLearnLesson(conceptId, returnTo);
      setClosing(result);
    } catch {
      setClosing(null);
    }
    setScreen('closing');
  }

  function startReinforcement() {
    if (!lesson || lesson.steps.reinforcementQuestions.length === 0) {
      finish();
      return;
    }
    setRIndex(0);
    setScreen('reinforcement');
  }

  if (lesson === undefined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Loading…</div>
      </div>
    );
  }
  if (lesson === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>This lesson session has ended.</div>
        <button type="button" onClick={exit} style={{ background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)' }}>Back to Practice</button>
      </div>
    );
  }

  if (screen === 'reinforcement') {
    if (rQuestion === undefined) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Loading…</div>
        </div>
      );
    }
    if (rQuestion === null) {
      finish();
      return null;
    }
    const total = lesson.steps.reinforcementQuestions.length;
    return (
      <PracticeQuestion
        key={rQuestion.id}
        question={toUiQuestion(rQuestion)}
        index={rIndex}
        total={total}
        onExit={exit}
        onAnswered={({ correct }) => {
          submitLearnReinforcement(lesson.conceptId, correct, 15000, rQuestion.id);
        }}
        onNext={() => {
          if (rIndex + 1 >= total) finish();
          else { setRIndex(rIndex + 1); setRQuestion(undefined); }
        }}
      />
    );
  }

  if (screen === 'closing') {
    return (
      <div style={{ padding: '20px 24px 32px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--dark-bg-canvas)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
          <KaiMark size={72} check={closing?.masteryHolding !== false} tone="white" />
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--dark-text-heading)', maxWidth: 300 }}>
            {closing?.kaiClosing.text || 'Good — back to it.'}
          </div>
        </div>
        <Button variant="darkAccent" size="lg" fullWidth onClick={exit}>Back to Practice</Button>
      </div>
    );
  }

  // screen === 'lesson'
  const { steps } = lesson;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={exit} title={lesson.conceptName} tone="dark" />
      <div style={{ padding: '10px 20px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', textTransform: 'uppercase' }}>{lesson.subject} · {lesson.topic}</div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--dark-bg-elevated)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
          <KaiMark size={32} tone="white" />
          <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.55 }}>{lesson.kaiOpening.text}</div>
        </div>

        {lesson.alreadyMastered ? (
          <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', lineHeight: 1.6 }}>You've already shown a solid handle on this — nothing more to walk through right now.</div>
        ) : (
          <>
            {steps.coreConcept && (
              <Section title="What this concept is asking">
                <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.6 }}>{steps.coreConcept.learningObjective}</div>
                {steps.coreConcept.conceptSummary && (
                  <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', lineHeight: 1.6, marginTop: 8 }}>{steps.coreConcept.conceptSummary}</div>
                )}
              </Section>
            )}

            {steps.simpleBreakdown && (
              steps.simpleBreakdown.sparse ? (
                <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', fontStyle: 'italic' }}>Full material for this concept is still being built out.</div>
              ) : (
                <Section title="Simple breakdown">
                  <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.6 }}>{steps.simpleBreakdown.text}</div>
                </Section>
              )
            )}

            {steps.explanation?.correctReasoning && (
              <Section title="Why the correct answer works">
                <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.6 }}>{steps.explanation.correctReasoning}</div>
              </Section>
            )}

            {steps.commonMisconceptions.length > 0 && (
              <Section title="Common misconceptions">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {steps.commonMisconceptions.map((m) => (
                    <div key={m.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {m.ownMistake && <Badge tone="danger">Your mistake</Badge>}
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{m.name}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', lineHeight: 1.55 }}>{m.description}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {steps.keyIdea && (
              <Section title="Key idea">
                <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.6 }}>{steps.keyIdea}</div>
              </Section>
            )}

            {steps.examInsight && (
              <Section title="Exam insight">
                <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.6 }}>{steps.examInsight}</div>
              </Section>
            )}

            {lesson.topicContext && (
              <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', fontStyle: 'italic' }}>{lesson.topicContext.text}</div>
            )}
          </>
        )}
      </div>
      <div className="app-footer-bar" style={{ padding: '16px 20px 24px', background: 'var(--dark-bg-canvas)' }}>
        <Button variant="darkAccent" size="lg" fullWidth onClick={startReinforcement}>
          {steps.reinforcementQuestions.length > 0 ? 'Quick check' : "I've got it"}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
