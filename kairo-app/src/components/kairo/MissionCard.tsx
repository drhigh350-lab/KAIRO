import type { CSSProperties } from 'react';

export interface MissionCardSecondaryOption {
  label: string;
  onStart: () => void;
}

export interface MissionCardProps {
  eyebrow?: string;
  badge?: string;
  title: string;
  reason?: string;
  duration?: string;
  chips?: string[];
  progress?: number;
  ctaLabel?: string;
  onStart?: () => void;
  /** Kairo V1 2-Option Dashboard's Secondary option — a ghost/outline CTA under the solid Primary one. Absent entirely (not just unclicked) when RecommendationEngine had nothing eligible to offer as Secondary. */
  secondary?: MissionCardSecondaryOption;
}

// Truncation guardrail (per the Mentor Copy Generator spec): real UTME
// topic names can be long (e.g. "Separation of mixtures and purification
// of chemical substances"), and a button is a fixed-width pill — this
// keeps the label to one line with an ellipsis instead of wrapping or
// stretching the button. No Tailwind in this codebase (verified — every
// component here is inline-styled), so this is the plain-CSS equivalent
// of Tailwind's `truncate`, not an actual utility class. minWidth: 0 is
// required alongside it: a flex child won't shrink below its content's
// natural width otherwise, and the ellipsis never gets a chance to apply.
const truncateStyle: CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 };

/** The Mentor Copy Generator's button strings already end in a literal "→" (part of the exact specified copy) — this button also renders its own SVG arrow icon for plain labels that don't. Auto-detecting avoids a caller having to know which of MissionCard's two arrow mechanisms is in play, and avoids a doubled arrow ("Fix X → →") for generator-driven copy without silently dropping the icon for every other existing caller (e.g. the plain "Start Mission"/"Start Session" labels that have no embedded arrow). */
function hasEmbeddedArrow(label: string): boolean {
  return label.trim().endsWith('→');
}

export function MissionCard({ eyebrow = "TODAY'S MISSION", badge, title, reason, duration, chips, progress, ctaLabel = 'Start Mission', onStart, secondary }: MissionCardProps) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, var(--dark-accent-blue) 0%, var(--dark-accent-blue-deep) 60%, var(--dark-bg-elevated) 100%)',
      borderRadius: 'var(--radius-xl)', padding: 24, color: '#fff',
      fontFamily: 'var(--font-body)', boxShadow: '0 12px 40px var(--dark-accent-blue-glow)',
    }}>
      {badge ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.16)', padding: '6px 12px', borderRadius: 'var(--radius-pill)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" /></svg>
          {badge}
        </div>
      ) : (
        <div style={{ fontSize: 11, letterSpacing: '.08em', color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>{eyebrow}</div>
      )}
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, marginTop: 12, lineHeight: 1.25 }}>{title}</div>
      {reason && <div style={{ fontSize: 'var(--fs-body-sm)', color: 'rgba(255,255,255,0.85)', marginTop: 10, lineHeight: 1.5 }}>{reason}</div>}
      {chips && chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {chips.map((c) => (
            <span key={c} style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.14)', padding: '6px 12px', borderRadius: 'var(--radius-pill)' }}>{c}</span>
          ))}
        </div>
      )}
      {duration && !chips && <div style={{ fontSize: 'var(--fs-caption)', color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>{duration}</div>}
      {progress != null && (
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 6, borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#fff' }} />
          </div>
        </div>
      )}
      <button onClick={onStart} style={{
        marginTop: 20, width: '100%', minHeight: 'var(--touch-min)', background: 'rgba(255,255,255,0.95)', color: 'var(--dark-accent-blue-deep)',
        border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 16px',
      }}>
        <span style={truncateStyle}>{ctaLabel}</span>
        {!hasEmbeddedArrow(ctaLabel) && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dark-accent-blue-deep)" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        )}
      </button>
      {secondary && (
        // Ghost/outline, not the shared Button component's variant="ghost"
        // (that one's tokened for the light theme — --kairo-blue-700 on a
        // light surface — and would read wrong on this card's dark
        // gradient). Transparent fill + translucent white border/text
        // reads as "the other option" without competing with the solid
        // white Primary CTA above it.
        <button onClick={secondary.onStart} style={{
          marginTop: 10, width: '100%', minHeight: 'var(--touch-min)', background: 'transparent', color: '#fff',
          border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 'var(--radius-pill)', fontWeight: 600, fontSize: 'var(--fs-body)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 16px',
        }}>
          <span style={truncateStyle}>{secondary.label}</span>
        </button>
      )}
    </div>
  );
}
