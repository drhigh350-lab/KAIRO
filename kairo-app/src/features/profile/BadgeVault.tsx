/**
 * Batch 2 — Evolving Badge Vault UI.
 * The compact 4-icon summary row (Profile) and the bottom-sheet detail view
 * (tap an icon), sharing the exact vault shape kairo-learning-engine's
 * BadgeSystem.getVault()/getDisplayBadges() already compute — this file is
 * presentation only, no threshold logic lives here.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VaultEntry = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Vault = any;

function trackKind(trackKey: string): 'consistency' | 'resilience' | 'execution' | 'subject' {
  if (trackKey.startsWith('subject:')) return 'subject';
  return trackKey as 'consistency' | 'resilience' | 'execution';
}

/** One SVG per track — kept simple/line-style, matching every other icon already in shared.tsx. */
function TrackIcon({ kind }: { kind: ReturnType<typeof trackKind> }) {
  if (kind === 'consistency') {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c1 4-4 5-4 9a4 4 0 008 0c1.5 1 2 3 2 4a6 6 0 01-12 0c0-5 3-6 3-9 0-1.5.5-3 3-4z" /></svg>;
  }
  if (kind === 'resilience') {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /></svg>;
  }
  if (kind === 'execution') {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.5" fill="currentColor" /></svg>;
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4.5A2.5 2.5 0 016.5 2H20v16.5A2.5 2.5 0 0117.5 21H4V4.5z" /><path d="M4 17.5A2.5 2.5 0 016.5 15H20" /></svg>;
}

/** Plain, student-facing copy — never "algorithm"/"mastery level"/"retention state" etc. Varied per track so the sheet doesn't read as one line copy-pasted 4 times. */
function nextTierChallengeCopy(kind: ReturnType<typeof trackKind>, subjectLabel: string | null): string {
  if (kind === 'consistency') return 'Every day you show up adds to this. Ready to keep the streak alive?';
  if (kind === 'resilience') return 'Every real comeback and every topic you rebuild counts toward this. Ready to prove it again?';
  if (kind === 'execution') return 'Precision compounds over time. Ready to test how much you retained?';
  return `There's more of ${subjectLabel ?? 'this subject'} to make solid. Ready to see how much you've really got down?`;
}

function formatAchievedDate(ms: number | null): string {
  if (!ms) return '';
  return new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export interface BadgeVaultRowProps {
  badges: VaultEntry[];
  onboarded: boolean;
  onSelect: (trackKey: string) => void;
}

/** Up to 4 icons — locked ones render grayscale, the top tier (tier 3) of any track gets the amber glow treatment matching Batch 1's Outlier tier. */
export function BadgeVaultRow({ badges, onboarded, onSelect }: BadgeVaultRowProps) {
  const anyEarned = badges.some((b) => !b.locked);

  if (!anyEarned) {
    return (
      <div style={{ fontSize: 13, color: 'var(--dark-text-faint)', lineHeight: 1.55 }}>
        {onboarded
          ? "Nothing in the Vault yet — it fills in as you keep practising."
          : "We don't have enough data yet. Complete a quick diagnostic test so Kairo can build your roadmap."}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {badges.map((b) => {
        const kind = trackKind(b.trackKey);
        const glow = b.isMaxTier;
        return (
          <button
            key={b.trackKey}
            type="button"
            onClick={() => onSelect(b.trackKey)}
            aria-label={b.locked ? `${b.label} — locked` : `${b.label}: ${b.currentTierName}`}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 68,
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: b.locked ? 'var(--dark-bg-elevated)' : 'rgba(224,160,57,0.15)',
              color: b.locked ? 'var(--dark-text-faint)' : 'var(--kairo-prestige-amber)',
              filter: b.locked ? 'grayscale(1)' : 'none',
              opacity: b.locked ? 0.55 : 1,
              boxShadow: glow ? '0 0 0 3px var(--kairo-prestige-amber-glow), 0 2px 12px var(--kairo-prestige-amber-glow)' : 'none',
            }}>
              <TrackIcon kind={kind} />
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 600, textAlign: 'center', color: b.locked ? 'var(--dark-text-faint)' : 'var(--dark-text-heading)', lineHeight: 1.25 }}>
              {b.locked ? b.label : b.currentTierName}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export interface BadgeVaultSheetProps {
  trackKey: string;
  vault: Vault;
}

/** Bottom-sheet detail for one track — achieved date for the current tier, next tier framed as a challenge. */
export function BadgeVaultSheet({ trackKey, vault }: BadgeVaultSheetProps) {
  const entry: VaultEntry | undefined = trackKey.startsWith('subject:')
    ? vault.subjects.find((s: VaultEntry) => s.trackKey === trackKey)
    : vault.tracks[trackKey];
  if (!entry) return null;

  const kind = trackKind(trackKey);
  const subjectLabel = kind === 'subject' ? entry.label : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: entry.locked ? 'var(--dark-bg-elevated)' : 'rgba(224,160,57,0.15)',
          color: entry.locked ? 'var(--dark-text-faint)' : 'var(--kairo-prestige-amber)',
          filter: entry.locked ? 'grayscale(1)' : 'none',
          boxShadow: entry.isMaxTier ? '0 0 0 3px var(--kairo-prestige-amber-glow)' : 'none',
        }}>
          <TrackIcon kind={kind} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: 'var(--dark-text-muted)' }}>{entry.label.toUpperCase()}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--dark-text-heading)' }}>
            {entry.locked ? 'Not unlocked yet' : entry.currentTierName}
          </div>
        </div>
      </div>

      {!entry.locked && (
        <>
          <div style={{ fontSize: 13.5, color: 'var(--dark-text-body)', lineHeight: 1.6 }}>{entry.currentTierDesc}</div>
          <div style={{ fontSize: 12, color: 'var(--dark-text-faint)', marginTop: 8 }}>Earned {formatAchievedDate(entry.achievedAt)}</div>
        </>
      )}
      {entry.locked && (
        <div style={{ fontSize: 13.5, color: 'var(--dark-text-body)', lineHeight: 1.6 }}>{entry.nextTier?.desc}</div>
      )}

      {entry.nextTier ? (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--dark-bg-surface)', border: '1px solid var(--dark-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.03em', color: 'var(--dark-accent-blue)', marginBottom: 4 }}>NEXT: {entry.nextTier.name.toUpperCase()}</div>
          <div style={{ fontSize: 13, color: 'var(--dark-text-body)', lineHeight: 1.55 }}>{nextTierChallengeCopy(kind, subjectLabel)}</div>
        </div>
      ) : (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 'var(--radius-md)', background: 'rgba(224,160,57,0.1)', border: '1px solid rgba(224,160,57,0.3)' }}>
          <div style={{ fontSize: 13, color: 'var(--dark-text-body)', lineHeight: 1.55 }}>You've reached the top tier on this one. Kairo will keep an eye on the rest.</div>
        </div>
      )}
    </div>
  );
}
