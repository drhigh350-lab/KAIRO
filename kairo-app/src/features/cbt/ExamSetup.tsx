import { Button, Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { CBT_DEFAULT_SUBJECTS as cbtSubjects, CBT_TOTAL_TIME_MIN, CBT_TOTAL_QUESTIONS } from '../../lib/kairoEngine';

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

export interface ExamSetupProps {
  onBack?: () => void;
  onContinue?: () => void;
  onViewHistory?: () => void;
}
export function ExamSetup({ onBack, onContinue, onViewHistory }: ExamSetupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="CBT Exam Mode" tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>Your subject combination for this simulation.</div>
          {onViewHistory && (
            <button type="button" onClick={onViewHistory} style={{
              flexShrink: 0, background: 'none', border: 'none', color: 'var(--dark-accent-blue)', fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', minHeight: 'var(--touch-min)', padding: '4px 0 4px 12px',
            }}>Past Exams</button>
          )}
        </div>
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
        <div style={{ marginTop: 'auto' }}>
          <Button variant="darkAccent" size="lg" fullWidth onClick={onContinue}>Continue to Instructions</Button>
        </div>
      </div>
    </div>
  );
}
