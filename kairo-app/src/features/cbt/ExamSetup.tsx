import { Button, Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import {
  CBT_DEFAULT_SUBJECTS as cbtSubjects,
  CBT_TOTAL_TIME_MIN,
  CBT_TOTAL_QUESTIONS,
  cbtQuestionCountFor,
  cbtProportionalTimeMin,
  type CbtExamType,
} from '../../lib/kairoEngine';

export interface RowProps {
  label: string;
  value: string;
}
export function Row({ label, value }: RowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--dark-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)' }}>{value}</span>
    </div>
  );
}

const EXAM_TYPES: { key: CbtExamType; label: string }[] = [
  { key: 'full', label: 'Full UTME Mock' },
  { key: 'subject', label: 'Subject-Specific' },
  { key: 'custom', label: 'Custom Mock' },
];

// Custom Mock offers bounded, realistic presets rather than freeform input
// (CBT Exam Mode Spec §4.3/§4.7) — mirroring Practice's own Short/Standard/
// Long question-count pattern (Practice Module §4.4), scaled up for a
// multi-subject mock instead of a single-subject practice set.
const CUSTOM_TOTAL_PRESETS = [
  { total: 40, label: 'Short · 40' },
  { total: 80, label: 'Standard · 80' },
  { total: 120, label: 'Long · 120' },
];

export interface ExamSetupProps {
  onBack?: () => void;
  onContinue?: () => void;
  onViewHistory?: () => void;
  examType: CbtExamType;
  onExamTypeChange: (t: CbtExamType) => void;
  subject: string;
  onSubjectChange: (s: string) => void;
  customSubjects: string[];
  onToggleCustomSubject: (s: string) => void;
  customTotalPreset: number;
  onCustomTotalPresetChange: (n: number) => void;
}
export function ExamSetup({
  onBack, onContinue, onViewHistory,
  examType, onExamTypeChange,
  subject, onSubjectChange,
  customSubjects, onToggleCustomSubject,
  customTotalPreset, onCustomTotalPresetChange,
}: ExamSetupProps) {
  const subjectQuestions = cbtQuestionCountFor(subject);
  const subjectTimeMin = cbtProportionalTimeMin(subjectQuestions);
  const customTimeMin = cbtProportionalTimeMin(customTotalPreset);
  const canContinue = examType !== 'custom' || customSubjects.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="CBT Exam Mode" tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Choose how you want to be tested.</div>
          {onViewHistory && (
            <button type="button" onClick={onViewHistory} style={{
              flexShrink: 0, background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', minHeight: 'var(--touch-min)', padding: '4px 0 4px 12px',
            }}>Past Exams</button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {EXAM_TYPES.map((t) => {
            const active = examType === t.key;
            return (
              <button type="button" key={t.key} aria-pressed={active} onClick={() => onExamTypeChange(t.key)} style={{
                flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: 12.5, fontFamily: 'inherit', minHeight: 'var(--touch-min)',
                border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: active ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)', color: active ? '#fff' : 'var(--dark-text-body)',
              }}>{t.label}</button>
            );
          })}
        </div>

        {examType === 'full' && (
          <>
            <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
              {cbtSubjects.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < cbtSubjects.length - 1 ? '1px solid var(--dark-border)' : 'none' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-text-heading)' }}>{s}</span>
                  {i === 0 && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-accent-blue)', background: 'var(--dark-bg-elevated)', padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}>Compulsory</span>}
                </div>
              ))}
            </Card>
            <Card style={{ background: 'var(--dark-bg-elevated)', boxShadow: 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 8 }}>THIS SESSION</div>
              <Row label="Questions" value={`${CBT_TOTAL_QUESTIONS} total (60 English, 40 each other subject)`} />
              <Row label="Duration" value={`${CBT_TOTAL_TIME_MIN} minutes`} />
              <Row label="Mode" value="Simulated JAMB CBT" />
            </Card>
          </>
        )}

        {examType === 'subject' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)' }}>Pick a subject</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cbtSubjects.map((s) => {
                const active = subject === s;
                return (
                  <button type="button" key={s} aria-pressed={active} onClick={() => onSubjectChange(s)} style={{
                    padding: '10px 16px', borderRadius: 'var(--radius-pill)', minHeight: 'var(--touch-min)', fontFamily: 'inherit',
                    border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: active ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)', color: active ? '#fff' : 'var(--dark-text-body)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>{s}</button>
                );
              })}
            </div>
            <Card style={{ background: 'var(--dark-bg-elevated)', boxShadow: 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 8 }}>THIS SESSION</div>
              <Row label="Questions" value={`${subjectQuestions} total`} />
              <Row label="Duration" value={`${subjectTimeMin} minutes`} />
              <Row label="Mode" value={`${subject} · Subject-Specific Mock`} />
            </Card>
          </>
        )}

        {examType === 'custom' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)' }}>Subjects</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cbtSubjects.map((s) => {
                const active = customSubjects.includes(s);
                return (
                  <button type="button" key={s} aria-pressed={active} onClick={() => onToggleCustomSubject(s)} style={{
                    padding: '10px 16px', borderRadius: 'var(--radius-pill)', minHeight: 'var(--touch-min)', fontFamily: 'inherit',
                    border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: active ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)', color: active ? '#fff' : 'var(--dark-text-body)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>{s}</button>
                );
              })}
            </div>
            {customSubjects.length === 0 && (
              <div style={{ fontSize: 12.5, color: 'var(--dark-accent-red, #e5484d)' }}>Pick at least one subject.</div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)' }}>Length</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {CUSTOM_TOTAL_PRESETS.map((p) => {
                const active = customTotalPreset === p.total;
                return (
                  <button type="button" key={p.total} aria-pressed={active} onClick={() => onCustomTotalPresetChange(p.total)} style={{
                    flex: 1, textAlign: 'center', padding: '12px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', minHeight: 'var(--touch-min)',
                    border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`, background: active ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)', color: active ? '#fff' : 'var(--dark-text-body)',
                  }}>{p.label}</button>
                );
              })}
            </div>
            <Card style={{ background: 'var(--dark-bg-elevated)', boxShadow: 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-accent-blue)', letterSpacing: '.03em', marginBottom: 8 }}>THIS SESSION</div>
              <Row label="Questions" value={`${customTotalPreset} total, split across ${customSubjects.length || 0} subject${customSubjects.length === 1 ? '' : 's'}`} />
              <Row label="Duration" value={`${customTimeMin} minutes`} />
              <Row label="Mode" value="Custom Mock" />
            </Card>
          </>
        )}

        <div style={{ marginTop: 'auto' }}>
          <Button variant="darkAccent" size="lg" fullWidth disabled={!canContinue} onClick={onContinue}>Continue to Instructions</Button>
        </div>
      </div>
    </div>
  );
}
