import { Button, Card } from '../../components';
import { ScreenHeader } from '../learning/shared';
import { cbtSubjects } from './data';

export interface RowProps {
  label: string;
  value: string;
}
export function Row({ label, value }: RowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>{value}</span>
    </div>
  );
}

export interface ExamSetupProps {
  onBack?: () => void;
  onContinue?: () => void;
}
export function ExamSetup({ onBack, onContinue }: ExamSetupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)' }}>
      <ScreenHeader onBack={onBack} title="CBT Exam Mode" />
      <div style={{ padding: '10px 20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Your subject combination for this simulation.</div>
        <Card>
          {cbtSubjects.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < cbtSubjects.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)' }}>{s}</span>
              {i === 0 && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--kairo-blue-700)', background: 'var(--kairo-blue-100)', padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}>Compulsory</span>}
            </div>
          ))}
        </Card>
        <Card style={{ background: 'var(--kairo-blue-100)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kairo-blue-700)', letterSpacing: '.03em', marginBottom: 8 }}>THIS SESSION</div>
          <Row label="Questions" value="16 total (4 per subject)" />
          <Row label="Duration" value="20 minutes" />
          <Row label="Mode" value="Simulated JAMB CBT" />
        </Card>
        <div style={{ marginTop: 'auto' }}>
          <Button variant="primary" size="lg" fullWidth onClick={onContinue}>Continue to Instructions</Button>
        </div>
      </div>
    </div>
  );
}
