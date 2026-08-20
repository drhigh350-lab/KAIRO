import { Button } from '../../components';
import { FlowHeader, KaiMark } from './shared';
import type { OnboardingData } from './data';

export interface AccountReadyProps {
  step: number;
  total: number;
  onBack: () => void;
  /** Jumps straight back to the "About You" step to correct something — distinct from onBack's plain history pop, since a student landing here has just entered several fields and may want to fix one without re-walking the whole flow. */
  onEdit: () => void;
  data: OnboardingData;
  onStart: () => void;
}

function formatExamDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function AccountReady({ step, total, onBack, onEdit, data, onStart }: AccountReadyProps) {
  const firstName = (data.name || '').split(' ')[0] || 'there';
  return (
    <div style={{ padding: '20px 24px 32px', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 26, flex: 1, background: 'var(--dark-bg-canvas)' }}>
      <FlowHeader onBack={onBack} step={step} total={total} tone="dark" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}>
        <KaiMark size={72} check tone="white" />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, color: 'var(--dark-text-heading)' }}>Here's what I've got, {firstName}.</div>
          <div style={{ fontSize: 14, color: 'var(--dark-text-muted)', marginTop: 10, lineHeight: 1.55, maxWidth: 300 }}>Quick look before we find out what you already know.</div>
        </div>
      </div>
      <div style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-lg)', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-text-muted)', letterSpacing: '.02em', textTransform: 'uppercase' }}>Your Details</div>
          <button type="button" onClick={onEdit} aria-label="Edit your details" style={{
            width: 30, height: 30, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)', flexShrink: 0,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            background: 'var(--dark-bg-elevated)', border: '1px solid var(--dark-border)', color: 'var(--dark-accent-blue)', padding: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" /></svg>
          </button>
        </div>
        <SummaryRow label="Name" value={data.name || '—'} />
        <SummaryRow label="Course" value={data.course ? data.course.name : 'Not set yet'} />
        <SummaryRow label="Exam Date" value={formatExamDate(data.examDate)} />
        <div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-muted)', marginBottom: 8 }}>Subjects</div>
          {data.subjects.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.subjects.map((s) => <span key={s} style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark-accent-blue)', background: 'rgba(46,124,246,0.15)', padding: '5px 10px', borderRadius: 'var(--radius-pill)' }}>{s}</span>)}
            </div>
          ) : <div style={{ fontSize: 13, color: 'var(--dark-text-faint)' }}>Not chosen yet</div>}
        </div>
      </div>
      <Button variant="darkAccent" size="lg" fullWidth onClick={onStart}>Continue</Button>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: 'var(--dark-text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--dark-text-heading)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
