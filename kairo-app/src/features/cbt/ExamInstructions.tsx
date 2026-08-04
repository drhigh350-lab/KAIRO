import { Button } from '../../components';
import { ScreenHeader } from '../learning/shared';

export interface ExamInstructionsProps {
  onBack?: () => void;
  onBegin?: () => void;
}
export function ExamInstructions({ onBack, onBegin }: ExamInstructionsProps) {
  const rules = [
    'This session simulates the real JAMB CBT experience.',
    'Each subject has its own timer and question set.',
    'You may skip, flag, and return to any question before submitting.',
    'The question palette shows answered, flagged, and unanswered questions at a glance.',
    'Once submitted, answers cannot be changed.',
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Instructions" tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--dark-text-heading)' }}>Before you begin</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rules.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--dark-bg-elevated)', color: 'var(--dark-accent-blue)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <div style={{ fontSize: 14, color: 'var(--dark-text-body)', lineHeight: 1.55 }}>{r}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <Button variant="darkAccent" size="lg" fullWidth onClick={onBegin}>Begin Exam</Button>
        </div>
      </div>
    </div>
  );
}
