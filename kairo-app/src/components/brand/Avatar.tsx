export interface AvatarProps {
  /** The student's name, if known — renders as a bold initial. Omit (or pass a name with no usable character) for the generic person icon. */
  name?: string | null;
  size?: number;
  /** Blue ring around the avatar, matching the tappable-button treatment Home's own profile nav button already used. */
  ring?: boolean;
}

/**
 * The student's identity mark, used wherever Kairo currently shows "you" —
 * Home's profile-nav button and Profile's identity card. Previously each of
 * those was its own bare outlined circle (Home's had no content inside it
 * at all; Profile's initial-in-a-circle sat on a flat surface color) —
 * neither read as belonging to the student, just an empty/generic shape.
 * A real photo/upload flow doesn't exist yet, so this stays illustrative
 * rather than pretending to be one: a brand-gradient circle (the same
 * blue Profile's own Kairo Score card and every primary CTA already use,
 * so it reads as Kairo's identity mark, not a random color) carrying the
 * student's own initial in bold white — distinguishable at a glance,
 * still unmistakably "Kairo".
 */
export function Avatar({ name, size = 40, ring = false }: AvatarProps) {
  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--dark-accent-blue), var(--dark-accent-blue-deep))',
      border: ring ? '2px solid var(--dark-accent-blue)' : '1.5px solid rgba(255,255,255,0.18)',
      boxShadow: ring ? undefined : '0 2px 10px var(--dark-accent-blue-glow)',
    }}>
      {initial ? (
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', fontSize: Math.round(size * 0.42) }}>{initial}</span>
      ) : (
        <svg width={Math.round(size * 0.5)} height={Math.round(size * 0.5)} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" opacity={0.9}>
          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
      )}
    </div>
  );
}
