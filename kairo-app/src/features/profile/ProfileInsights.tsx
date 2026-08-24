import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, ProgressBar, Button } from '../../components';
import {
  getActionableInsightCards, getWeeklyDrop, getSubjectHealth, getMonthlyCheckpoint, getProfileSummary,
  type ActionableInsightCard, type ActionableInsightCta, type WeeklyDrop, type MonthlyCheckpoint,
} from '../../lib/kairoEngine';
import { isWeeklyDropUnlocked, daysUntilNextDrop } from '../../lib/weeklyDrop';
import { isMonthlyCheckpointUnlocked, daysUntilMonthlyCheckpoint } from '../../lib/monthlyCheckpoint';

/** Routes an Action Card's CTA to a real Practice session — kept here (not in kairoEngine.ts) since navigation is a UI-layer concern. */
function launchCta(navigate: ReturnType<typeof useNavigate>, cta: ActionableInsightCta) {
  if (cta.kind === 'drill') {
    navigate('/practice', { state: { entry: 'drill', drillCategory: cta.category, drillSubjects: cta.subjects, drillTimerSec: cta.timerSec } });
  } else if (cta.kind === 'suggested') {
    navigate('/practice', { state: { entry: 'suggested' } });
  } else if (cta.kind === 'endurance') {
    navigate('/practice', { state: { entry: 'endurance' } });
  } else if (cta.kind === 'rapidFire') {
    navigate('/rapid-fire', { state: { timePerQuestionSec: cta.timerSec } });
  } else {
    navigate('/practice', { state: { entry: 'weak' } });
  }
}

/** One "Action Card" (Batch 2's Card Anatomy: minimal header metric, mentor copy, a primary Gold CTA) — sized to fill exactly one carousel page. */
function ActionCard({ card, onAction }: { card: ActionableInsightCard; onAction: () => void }) {
  return (
    <div style={{
      flex: '0 0 100%', scrollSnapAlign: 'center', minWidth: '100%', boxSizing: 'border-box',
      padding: '0 20px',
    }}>
      <div style={{
        borderRadius: 'var(--radius-lg)', padding: 22,
        background: 'linear-gradient(160deg, var(--dark-bg-elevated), var(--dark-bg-surface))',
        border: '1px solid rgba(201,162,39,0.35)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        minHeight: 200, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--kairo-gold-500)', textTransform: 'uppercase' }}>
          Actionable Insight
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, color: 'var(--dark-text-heading)', marginTop: 10, lineHeight: 1.25 }}>
          {card.header}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--dark-text-muted)', lineHeight: 1.55, marginTop: 12, flex: 1 }}>
          {card.mentorCopy}
        </div>
        <div style={{ marginTop: 18 }}>
          <Button variant="gold" size="md" fullWidth onClick={onAction}>{card.ctaLabel}</Button>
        </div>
      </div>
    </div>
  );
}

/** Batch 2's horizontal snap-scroll carousel — one card visible at a time, dot pagination tracks scroll position. */
function ActionCardCarousel({ cards, onAction }: { cards: ActionableInsightCard[]; onAction: (card: ActionableInsightCard) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  if (cards.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        style={{
          display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}
      >
        {cards.map((card) => (
          <ActionCard key={card.id} card={card} onAction={() => onAction(card)} />
        ))}
      </div>
      {cards.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {cards.map((card, i) => (
            <div key={card.id} style={{
              width: i === activeIndex ? 16 : 6, height: 6, borderRadius: 3,
              background: i === activeIndex ? 'var(--kairo-gold-500)' : 'var(--dark-border)',
              transition: 'width var(--dur-base), background var(--dur-base)',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text-faint)" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}

function MagnifyingGlassIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--dark-bg-canvas)" strokeWidth="3">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

/** Shared locked-state shell for both Weekly Drop and Monthly Checkpoint — dimmed navy, lock icon, a "how long left" line. */
function LockedCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        borderRadius: 'var(--radius-lg)', padding: 26, textAlign: 'center',
        background: 'rgba(1,39,72,0.55)', border: '1px solid var(--dark-border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><LockIcon /></div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--dark-text-muted)' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--dark-text-faint)', marginTop: 6, lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

/** One Core-3 stat tile — monospace metric per the design tokens, a colored delta line when there's a real prior-week comparison to show. */
function DeltaStat({ label, value, delta, deltaSuffix }: { label: string; value: string; delta: number | null; deltaSuffix: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.04em', lineHeight: 1.3 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 19, color: 'var(--dark-text-heading)', marginTop: 4 }}>{value}</div>
      {delta != null && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: delta >= 0 ? 'var(--dark-success)' : 'var(--dark-danger)', marginTop: 2 }}>
          {delta >= 0 ? '↑' : '↓'}{Math.abs(delta)}{deltaSuffix}
        </div>
      )}
    </div>
  );
}

/** Batch 3's "One Thing" Focus — Kai mascot + the composed highlight/threat/directive sentence from InsightsModule.getWeeklyDrop(). */
function OneThingCallout({ copy }: { copy: string }) {
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 18, padding: 14,
      borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--dark-border)',
    }}>
      <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'var(--dark-bg-elevated)' }}>
          <img src="/assets/illustration-kai-mascot.png" alt="Kai" style={{ width: '160%', height: '160%', objectFit: 'cover', objectPosition: '20% 30%' }} />
        </div>
        <div style={{
          position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%',
          background: 'var(--kairo-gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--dark-bg-elevated)',
        }}>
          <MagnifyingGlassIcon />
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--dark-text-body)', lineHeight: 1.55, paddingTop: 2 }}>{copy}</div>
    </div>
  );
}

/** Batch 2's unlocked state: streak hook, gold-bordered card, the Core 3 Deltas (+ real weekly show-up count), the One Thing callout, and the Share My Week ghost CTA. */
function WeeklyDropUnlocked({ drop, streak }: { drop: WeeklyDrop; streak: number }) {
  const [shareCopied, setShareCopied] = useState(false);

  function handleShare() {
    const parts = [`${drop.pointsThisWeek.toLocaleString()} Kairo Points this week`];
    if (drop.accuracyThisWeek != null) parts.push(`${drop.accuracyThisWeek}% avg accuracy`);
    if (drop.weakTopicsMastered > 0) parts.push(`${drop.weakTopicsMastered} weak topic${drop.weakTopicsMastered === 1 ? '' : 's'} mastered`);
    const text = `My week on Kairo: showed up ${drop.sessionCount} time${drop.sessionCount === 1 ? '' : 's'}, ${parts.join(', ')}.${drop.biggestTurnaround ? ` Biggest turnaround: ${drop.biggestTurnaround.topic} (${drop.biggestTurnaround.beforeAccuracy}% → ${drop.biggestTurnaround.weekAccuracy}%).` : ''}`;
    if (navigator.share) {
      navigator.share({ title: 'My Week on Kairo', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2200);
    }
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        borderRadius: 'var(--radius-lg)', padding: 22,
        background: 'linear-gradient(160deg, var(--dark-bg-elevated), var(--dark-bg-surface))',
        border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--kairo-gold-500)', textTransform: 'uppercase' }}>
          Weekly Intel
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, color: 'var(--dark-text-heading)', marginTop: 8, lineHeight: 1.35 }}>
          {streak > 0
            ? `${streak}-day streak! The algorithm is dialing in. Ready for next week?`
            : "Your first Weekly Intel drop — let's build a real picture of how you learn."}
        </div>
        <div style={{ fontSize: 13, color: 'var(--dark-text-muted)', marginTop: 6 }}>
          You showed up {drop.sessionCount} time{drop.sessionCount === 1 ? '' : 's'} this week — that's the rhythm that moves your score.
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <DeltaStat label="Kairo Points" value={drop.pointsThisWeek.toLocaleString()} delta={drop.pointsDeltaPct} deltaSuffix="%" />
          <DeltaStat label="Avg Accuracy" value={drop.accuracyThisWeek != null ? `${drop.accuracyThisWeek}%` : '—'} delta={drop.accuracyDeltaPts} deltaSuffix="pts" />
          <DeltaStat label="Weak Topics Mastered" value={String(drop.weakTopicsMastered)} delta={null} deltaSuffix="" />
        </div>

        {drop.oneThingCopy && <OneThingCallout copy={drop.oneThingCopy} />}

        <div style={{ marginTop: 18 }}>
          <button type="button" onClick={handleShare} style={{
            width: '100%', minHeight: 'var(--touch-min)', padding: '12px 16px', borderRadius: 'var(--radius-pill)',
            background: 'transparent', border: '1.5px solid var(--kairo-gold-500)', color: 'var(--kairo-gold-500)',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {shareCopied ? 'Copied — paste it anywhere' : 'Share My Week'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Batch 2's Time-Locked Weekly Drop: locked every day but Sunday, real week-over-week deltas once unlocked. Renders nothing (not even the locked state) until the student has at least one session ever — a brand-new account has no "week" to speak of yet. */
function WeeklyDropSection() {
  const drop = getWeeklyDrop();
  const streak = getProfileSummary()?.stats?.currentStreak ?? 0;
  if (!drop) return null;
  return isWeeklyDropUnlocked()
    ? <WeeklyDropUnlocked drop={drop} streak={streak} />
    : <LockedCard title="Your Weekly Intel drops on Sunday." body={`Keep practicing to give Kairo more data.${daysUntilNextDrop() > 0 ? ` ${daysUntilNextDrop()} day${daysUntilNextDrop() === 1 ? '' : 's'} to go.` : ''}`} />;
}

/** Batch 6's 28-day Consistency Grid: a real activity heatmap, 7 columns (a week) x 4 rows, oldest at the top. */
function ConsistencyGrid({ days }: { days: MonthlyCheckpoint['consistencyGrid'] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginTop: 8 }}>
      {days.map((d) => (
        <div key={d.date} title={d.date} style={{
          aspectRatio: '1', borderRadius: 4,
          background: d.active ? 'var(--kairo-gold-500)' : 'var(--dark-bg-canvas)',
          border: `1px solid ${d.active ? 'var(--kairo-gold-500)' : 'var(--dark-border)'}`,
        }} />
      ))}
    </div>
  );
}

/** Batch 6's unlocked Monthly Checkpoint: a premium gold-accented summary — Syllabus Velocity, the 4-week Consistency Grid, this month's real session/question totals, and the Macro Directive naming next month's target. */
function MonthlyCheckpointUnlocked({ checkpoint }: { checkpoint: MonthlyCheckpoint }) {
  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        borderRadius: 'var(--radius-lg)', padding: 22,
        background: 'linear-gradient(160deg, var(--dark-bg-elevated), var(--dark-bg-surface))',
        border: '1.5px solid var(--kairo-gold-500)', boxShadow: '0 8px 30px rgba(201,162,39,0.18)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--kairo-gold-500)', textTransform: 'uppercase' }}>
          Monthly Checkpoint
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 34, color: 'var(--dark-text-heading)' }}>{checkpoint.syllabusVelocityPct}%</div>
          <div style={{ fontSize: 12.5, color: 'var(--dark-text-muted)' }}>of your syllabus mastered this month</div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Sessions</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 17, color: 'var(--dark-text-heading)', marginTop: 2 }}>{checkpoint.sessionsThisMonth}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Questions</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 17, color: 'var(--dark-text-heading)', marginTop: 2 }}>{checkpoint.questionsThisMonth}</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--dark-text-faint)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Consistency — last 4 weeks</div>
          <ConsistencyGrid days={checkpoint.consistencyGrid} />
        </div>

        {checkpoint.macroDirective && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 18, padding: 14,
            borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.18)', borderLeft: '3px solid var(--kairo-gold-500)',
          }}>
            <div style={{ fontSize: 13, color: 'var(--dark-text-body)', lineHeight: 1.55 }}>{checkpoint.macroDirective}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Batch 6's Time-Locked Monthly Checkpoint: locked every day but the month's last day. Renders nothing until the student has completed a session this calendar month. */
function MonthlyCheckpointSection() {
  const checkpoint = getMonthlyCheckpoint();
  if (!checkpoint) return null;
  return isMonthlyCheckpointUnlocked()
    ? <MonthlyCheckpointUnlocked checkpoint={checkpoint} />
    : <LockedCard title="Your Monthly Checkpoint drops on the last day of the month." body={`Keep showing up — it's building the full picture.${daysUntilMonthlyCheckpoint() > 0 ? ` ${daysUntilMonthlyCheckpoint()} day${daysUntilMonthlyCheckpoint() === 1 ? '' : 's'} to go.` : ''}`} />;
}

/** Subject Health: every enrolled subject with mastery %, a Fading-count badge when a subject genuinely needs urgent review, and real accuracy — not just a single top-3 mastery number. */
function SubjectHealthSection() {
  const subjects = getSubjectHealth();
  if (subjects.length === 0) return null;
  return (
    <div style={{ padding: '0 20px' }}>
      <Card style={{ background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)', boxShadow: 'none' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark-text-heading)' }}>Subject Health</div>
        {subjects.map(({ subject, masteryPct, fadingCount, accuracy }) => (
          <div key={subject} style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--dark-text-body)', marginBottom: 6 }}>
              <span>{subject}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {fadingCount > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-danger)', background: 'var(--dark-danger-bg)', padding: '2px 7px', borderRadius: 'var(--radius-pill)' }}>
                    {fadingCount} fading
                  </span>
                )}
                {accuracy != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--dark-text-muted)' }}>{accuracy}% acc</span>}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--dark-text-heading)' }}>{masteryPct}%</span>
              </div>
            </div>
            <ProgressBar value={masteryPct} tone={masteryPct < 60 ? 'gold' : 'dark'} />
          </div>
        ))}
      </Card>
    </div>
  );
}

/**
 * The Insights Hub — item 2 of Profile's vertical stack (Batch 6): Weekly
 * Drop, the Actionable Insights carousel, Subject Health, then the
 * Monthly Checkpoint. Embedded directly in Profile.tsx now (not a
 * separate route a student has to tap through to) — This Week / This
 * Month — Kairo Wrapped are permanently gone from here, superseded by the
 * real Weekly Drop / Monthly Checkpoint above.
 */
export function InsightsHub() {
  const navigate = useNavigate();
  const actionCards = getActionableInsightCards();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ padding: '0 20px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--dark-text-heading)' }}>
        Insights
      </div>
      <WeeklyDropSection />
      {actionCards.length > 0 && (
        <ActionCardCarousel cards={actionCards} onAction={(card) => launchCta(navigate, card.cta)} />
      )}
      <SubjectHealthSection />
      <MonthlyCheckpointSection />
    </div>
  );
}
