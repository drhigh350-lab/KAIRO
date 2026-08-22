import { useState } from 'react';
import { Button, Input } from '../../components';
import { ScreenHeader } from '../learning/shared';
import type { ConfidenceLevel, PlannerInput, PlannerSubjectInput } from '../../lib/planner/plannerEngine';
import type { Subject } from '../../lib/planner/syllabus';
import { toLocalIso } from '../../lib/planner/plannerEngine';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CONFIDENCE_LEVELS: { key: ConfidenceLevel; label: string }[] = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
];

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} style={{
      padding: '10px 16px', borderRadius: 'var(--radius-pill)', minHeight: 'var(--touch-min)', fontFamily: 'inherit',
      border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`,
      background: active ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)', color: active ? '#fff' : 'var(--dark-text-body)',
      fontSize: 13, fontWeight: 700, cursor: 'pointer',
    }}>{children}</button>
  );
}

export interface PlannerSetupProps {
  onBack: () => void;
  onSubmit: (input: PlannerInput) => void;
  /** Every subject the syllabus actually has Blueprint data for. */
  allSubjects: Subject[];
  /** Student's own onboarding subject picks (label strings) — pre-selected when they match a real Blueprint subject; every Blueprint subject is still selectable, since UTME's exact subject list can differ slightly from what the student entered at onboarding. */
  defaultSelectedSlugs: string[];
  /** Pre-fills the target date from the student's real exam date, where one's already set. */
  defaultTargetDateIso: string | null;
  submitting: boolean;
}

/**
 * One-screen Study Planner setup — target date, realistic weekly capacity,
 * and per-subject confidence. Every subject starts from the beginning of
 * its Blueprint (startingStageIndex: 0); the source Astro app's "I've
 * already covered some of this" picker isn't ported — Batch 2 only asks
 * for the topic checklist + verification loop, and a first pass through
 * the whole Blueprint is the safer default for a student building a plan
 * for the first time.
 */
export function PlannerSetup({ onBack, onSubmit, allSubjects, defaultSelectedSlugs, defaultTargetDateIso, submitting }: PlannerSetupProps) {
  const [targetDate, setTargetDate] = useState(defaultTargetDateIso ?? '');
  const [availableDays, setAvailableDays] = useState<number[]>([1, 2, 3, 4, 5, 6]); // Mon-Sat by default — a realistic weekday+Saturday cadence, Sunday off
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    defaultSelectedSlugs.length ? defaultSelectedSlugs : allSubjects.map((s) => s.slug),
  );
  const [confidenceBySlug, setConfidenceBySlug] = useState<Record<string, ConfidenceLevel>>({});

  function toggleDay(day: number) {
    setAvailableDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  }
  function toggleSubject(slug: string) {
    setSelectedSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  const canSubmit = !!targetDate && availableDays.length > 0 && hoursPerDay > 0 && selectedSlugs.length > 0 && !submitting;

  function handleSubmit() {
    if (!canSubmit) return;
    const subjects: PlannerSubjectInput[] = selectedSlugs.map((slug) => ({
      slug,
      confidence: confidenceBySlug[slug] ?? 'medium',
      startingStageIndex: 0,
    }));
    onSubmit({
      targetDate,
      availableDays,
      hoursPerAvailableDay: hoursPerDay,
      subjects,
      createdAt: toLocalIso(new Date()),
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'var(--font-body)', background: 'var(--dark-bg-canvas)' }}>
      <ScreenHeader onBack={onBack} title="Study Planner" tone="dark" />
      <div style={{ padding: '10px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 14, color: 'var(--dark-text-muted)' }}>
          A realistic week-by-week plan across the real UTME Blueprint — tell Kairo when you're sitting the exam and how much time you actually have.
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Target exam date</div>
          <Input tone="dark" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Days you can realistically study</div>
          <ChipRow>
            {DAY_LABELS.map((label, day) => (
              <Chip key={day} active={availableDays.includes(day)} onClick={() => toggleDay(day)}>{label}</Chip>
            ))}
          </ChipRow>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Hours per available day</div>
          <Input tone="dark" type="number" min="1" max="12" value={hoursPerDay} onChange={(e) => setHoursPerDay(Math.max(1, parseInt(e.target.value, 10) || 1))} />
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>Subjects</div>
          <ChipRow>
            {allSubjects.map((s) => (
              <Chip key={s.slug} active={selectedSlugs.includes(s.slug)} onClick={() => toggleSubject(s.slug)}>{s.name}</Chip>
            ))}
          </ChipRow>
        </div>

        {selectedSlugs.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-text-heading)', marginBottom: 8 }}>How confident are you, subject by subject?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {allSubjects.filter((s) => selectedSlugs.includes(s.slug)).map((s) => (
                <div key={s.slug} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--dark-text-body)' }}>{s.name}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {CONFIDENCE_LEVELS.map((c) => {
                      const active = (confidenceBySlug[s.slug] ?? 'medium') === c.key;
                      return (
                        <button type="button" key={c.key} aria-pressed={active}
                          onClick={() => setConfidenceBySlug((prev) => ({ ...prev, [s.slug]: c.key }))}
                          style={{
                            padding: '8px 12px', borderRadius: 'var(--radius-md)', minHeight: 'var(--touch-min)', fontFamily: 'inherit',
                            border: `1.5px solid ${active ? 'var(--dark-accent-blue)' : 'var(--dark-border)'}`,
                            background: active ? 'var(--dark-accent-blue)' : 'var(--dark-bg-surface)', color: active ? '#fff' : 'var(--dark-text-body)',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}>{c.label}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <Button variant="darkAccent" size="lg" fullWidth disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? 'Building your plan…' : 'Build My Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
