import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { createQuiz, REAL_SUBJECTS, type QuestionRef } from '../../lib/quizApi';
import { OfficialQuestionPicker } from './OfficialQuestionPicker';
import { WriteQuestionForm } from './WriteQuestionForm';
import { MyQuestionsPicker } from './MyQuestionsPicker';

type Step = 1 | 2 | 3;
type QuestionTab = 'official' | 'write' | 'mine';

const STEP_LABELS: Record<Step, string> = { 1: 'Basics', 2: 'Questions', 3: 'Review' };
const DIFFICULTIES = ['easy', 'medium', 'hard', 'mixed'] as const;

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '9px 16px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: `1.5px solid ${active ? 'var(--arena-gold)' : 'var(--dark-border)'}`,
    background: active ? 'rgba(201,162,39,0.15)' : 'var(--dark-bg-surface)',
    color: active ? 'var(--arena-gold)' : 'var(--dark-text-muted)',
  };
}

export function CreateQuizFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<string>('Biology');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('mixed');
  const [durationMinutes, setDurationMinutes] = useState('10');
  const [visibility, setVisibility] = useState<'public' | 'link_only' | 'followers_only' | 'private'>('public');

  const [questionTab, setQuestionTab] = useState<QuestionTab>('official');
  const [selected, setSelected] = useState<QuestionRef[]>([]);

  function toggleQuestion(ref: QuestionRef) {
    setSelected((prev) => (prev.some((r) => r.id === ref.id) ? prev.filter((r) => r.id !== ref.id) : [...prev, ref]));
  }

  async function handlePublish() {
    setSubmitting(true);
    setError(null);
    try {
      await createQuiz({
        title, description, subject, topic, difficulty, visibility,
        estimatedDurationMinutes: durationMinutes ? Number(durationMinutes) : null,
        questionRefs: selected,
      });
      navigate('/quiz-create/my-quizzes', { state: { justCreated: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create this quiz.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100dvh', fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader
        onBack={() => (step === 1 ? navigate(-1) : setStep((s) => (s - 1) as Step))}
        title="Create a Quiz"
        tone="dark"
      />

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '4px 20px 18px' }}>
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              background: s <= step ? 'var(--arena-gold)' : 'transparent',
              color: s <= step ? '#1a1200' : 'var(--dark-text-faint)',
              border: s <= step ? 'none' : '1.5px solid var(--dark-border)',
            }}>{s}</div>
            <div style={{ fontSize: 11, color: s === step ? 'var(--arena-gold)' : 'var(--dark-text-faint)', fontWeight: s === step ? 700 : 500 }}>{STEP_LABELS[s]}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px 100px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {step === 1 && (
          <>
            <Input tone="dark" label="Quiz Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Organic Chemistry Mastery" />
            <Input tone="dark" label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this quiz about?" />

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Subject</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {REAL_SUBJECTS.map((s) => (
                  <button key={s} onClick={() => setSubject(s)} style={pillStyle(subject === s)}>{s}</button>
                ))}
              </div>
            </div>

            <Input tone="dark" label="Topic (optional)" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Carbonyl Compounds" />

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Difficulty</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {DIFFICULTIES.map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{ ...pillStyle(difficulty === d), flex: 1, textTransform: 'capitalize' }}>{d}</button>
                ))}
              </div>
            </div>

            <Input tone="dark" label="Estimated duration (minutes)" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Visibility</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {([
                  { v: 'public', label: 'Public' },
                  { v: 'link_only', label: 'Link only' },
                  { v: 'followers_only', label: 'Followers' },
                  { v: 'private', label: 'Private' },
                ] as const).map((o) => (
                  <button key={o.v} onClick={() => setVisibility(o.v)} style={pillStyle(visibility === o.v)}>{o.label}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setQuestionTab('official')} style={{ ...pillStyle(questionTab === 'official'), flex: 1 }}>Official Bank</button>
              <button onClick={() => setQuestionTab('mine')} style={{ ...pillStyle(questionTab === 'mine'), flex: 1 }}>My Questions</button>
              <button onClick={() => setQuestionTab('write')} style={{ ...pillStyle(questionTab === 'write'), flex: 1 }}>Write New</button>
            </div>

            {questionTab === 'official' && <OfficialQuestionPicker subject={subject} selected={selected} onToggle={toggleQuestion} />}
            {questionTab === 'mine' && <MyQuestionsPicker selected={selected} onToggle={toggleQuestion} />}
            {questionTab === 'write' && (
              <WriteQuestionForm
                defaultSubject={subject}
                onCreated={(ref) => {
                  toggleQuestion(ref);
                  setQuestionTab('mine');
                }}
              />
            )}
          </>
        )}

        {step === 3 && (
          <>
            <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
              <div style={{ fontSize: 11, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{subject}{topic ? ` · ${topic}` : ''}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--dark-text-heading)', marginTop: 4 }}>{title || 'Untitled Quiz'}</div>
              {description && <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>{description}</div>}
              <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 10 }}>
                {selected.length} question{selected.length === 1 ? '' : 's'} · {difficulty} · {durationMinutes || '—'} min
              </div>
              <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 4, textTransform: 'capitalize' }}>{visibility.replace('_', ' ')}</div>
            </Card>

            <Card style={{ background: 'var(--dark-bg-elevated)', boxShadow: 'none' }}>
              <div style={{ fontSize: 13, color: 'var(--dark-text-body)', lineHeight: 1.5 }}>
                Quizzes are reviewed before appearing publicly. You'll see the status (Under Review, Published, Needs Fixes) on your quizzes page.
              </div>
            </Card>

            {error && <div style={{ fontSize: 13, color: 'var(--dark-danger)' }}>{error}</div>}
          </>
        )}
      </div>

      <div className="app-footer-bar" style={{ padding: '16px 20px 24px', background: 'var(--dark-bg-canvas)', display: 'flex', gap: 10 }}>
        {step < 3 ? (
          <Button
            variant="darkAccent" size="lg" fullWidth
            disabled={step === 1 && !title.trim()}
            onClick={() => setStep((s) => (s + 1) as Step)}
          >
            {step === 2 ? 'Review' : 'Next'}
          </Button>
        ) : (
          <Button variant="darkAccent" size="lg" fullWidth disabled={submitting || selected.length === 0} onClick={handlePublish}>
            {submitting ? 'Submitting…' : 'Submit for Review'}
          </Button>
        )}
      </div>
    </div>
  );
}
