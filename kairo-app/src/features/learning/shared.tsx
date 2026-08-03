import { useEffect, useState, type ReactNode } from 'react';

/** Closes an overlay (modal/menu) on the Escape key, for the lifetime of the overlay. */
function useEscapeToClose(onClose: () => void) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
}

export function BackIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>;
}
export function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>;
}
export function BookmarkIcon({ filled }: { filled?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'var(--kairo-gold-500)' : 'none'} stroke={filled ? 'var(--kairo-gold-600)' : 'currentColor'} strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>;
}
export function FlagIcon({ filled }: { filled?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'var(--kairo-gold-500)' : 'none'} stroke={filled ? 'var(--kairo-gold-600)' : 'currentColor'} strokeWidth="2"><path d="M5 3v18M5 4h12l-3 4 3 4H5" /></svg>;
}
export function ReportIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16v.01" /></svg>;
}
export function CalcIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" /></svg>;
}
export function ChevronRight() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>;
}
export function OverflowIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>;
}
export function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
}
export function BackspaceIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6h11v12H9l-6-6z" /><path d="M14 10l-4 4M10 10l4 4" /></svg>;
}

export interface ScreenHeaderProps {
  onBack?: () => void;
  title: string;
  right?: ReactNode;
  tone?: 'light' | 'dark';
}
export function ScreenHeader({ onBack, title, right, tone = 'light' }: ScreenHeaderProps) {
  const dark = tone === 'dark';
  return (
    <div className="app-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 6px', fontFamily: 'var(--font-body)', background: dark ? 'var(--dark-bg-canvas)' : undefined, color: dark ? 'var(--dark-text-heading)' : undefined }}>
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Back" style={{
          width: 36, height: 36, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)', margin: '-6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: dark ? 'var(--dark-text-heading)' : 'var(--text-heading)',
          background: 'none', border: 'none', padding: 0, borderRadius: '50%',
        }}>
          <BackIcon />
        </button>
      ) : (
        <div style={{ width: 36, height: 36 }} />
      )}
      <div style={{ fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: dark ? 'var(--dark-text-heading)' : 'var(--text-heading)' }}>{title}</div>
      <div style={{ minWidth: 36, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

export interface OptionRowProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  subtitle?: string;
  tone?: 'light' | 'dark';
}
export function OptionRow({ label, selected, onClick, subtitle, tone = 'light' }: OptionRowProps) {
  const dark = tone === 'dark';
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} style={{
      padding: '16px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      border: `1.5px solid ${selected ? (dark ? 'var(--dark-accent-blue)' : 'var(--kairo-navy-900)') : (dark ? 'var(--dark-border)' : 'var(--color-border-subtle)')}`,
      background: selected ? (dark ? 'var(--dark-bg-elevated)' : 'var(--kairo-blue-100)') : (dark ? 'var(--dark-bg-surface)' : '#fff'), marginBottom: 10,
      width: '100%', minHeight: 'var(--touch-min)', textAlign: 'left', fontFamily: 'inherit', color: dark ? 'var(--dark-text-faint)' : undefined,
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: dark ? 'var(--dark-text-heading)' : 'var(--text-heading)' }}>{label}</div>
        {subtitle && <div style={{ fontSize: 12, color: dark ? 'var(--dark-text-muted)' : 'var(--text-muted)', marginTop: 3 }}>{subtitle}</div>}
      </div>
      <ChevronRight />
    </button>
  );
}

export interface KaiPanelProps {
  note: ReactNode;
  onAction?: (action: string) => void;
  tone?: 'light' | 'dark';
}
export function KaiPanel({ note, onAction, tone = 'light' }: KaiPanelProps) {
  const dark = tone === 'dark';
  const [expanded, setExpanded] = useState(false);
  const actions = ['Explain again', 'Give another example', 'Simplify', 'Teach from scratch', 'Show formula', 'Show memory trick'];
  return (
    <div style={{ background: dark ? 'var(--dark-bg-elevated)' : 'var(--kairo-blue-100)', borderRadius: 'var(--radius-lg)', padding: 16, fontFamily: 'var(--font-body)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${dark ? 'var(--dark-accent-blue)' : 'var(--kairo-blue-500)'}`, flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', width: '60%', height: '60%', top: '20%', left: '20%', borderRadius: '50%', background: dark ? 'var(--dark-accent-blue)' : 'var(--kairo-navy-900)' }} />
        </div>
        <div style={{ fontSize: 13, color: dark ? 'var(--dark-text-body)' : 'var(--text-body)', lineHeight: 1.55 }}>{note}</div>
      </div>
      <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} style={{
        marginTop: 12, fontSize: 12, fontWeight: 700, color: dark ? 'var(--dark-accent-blue)' : 'var(--kairo-blue-700)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', padding: 0, minHeight: 'var(--touch-min)', fontFamily: 'inherit',
      }}>
        Ask Kai for more
        <span style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform var(--dur-base)' }}><ChevronRight /></span>
      </button>
      {expanded && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {actions.map((a) => (
            <button type="button" key={a} onClick={() => onAction && onAction(a)} style={{
              fontSize: 12, fontWeight: 600, color: dark ? 'var(--dark-text-heading)' : 'var(--kairo-navy-900)', background: dark ? 'var(--dark-bg-surface)' : '#fff', border: `1px solid ${dark ? 'var(--dark-border)' : 'var(--color-border-subtle)'}`,
              padding: '8px 12px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'inherit', minHeight: 'var(--touch-min)',
            }}>{a}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export type ConfidenceLevel = 'guessed' | 'unsure' | 'confident' | 'certain';
export interface ConfidenceRatingProps {
  value: ConfidenceLevel | null;
  onChange: (value: ConfidenceLevel) => void;
  tone?: 'light' | 'dark';
}
export function ConfidenceRating({ value, onChange, tone = 'light' }: ConfidenceRatingProps) {
  const dark = tone === 'dark';
  const levels: { key: ConfidenceLevel; label: string }[] = [
    { key: 'guessed', label: 'Guessed' },
    { key: 'unsure', label: 'Unsure' },
    { key: 'confident', label: 'Confident' },
    { key: 'certain', label: 'Certain' },
  ];
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: dark ? 'var(--dark-text-muted)' : 'var(--text-muted)', letterSpacing: '.02em', marginBottom: 10 }}>HOW CONFIDENT WERE YOU?</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {levels.map((l) => {
          const active = value === l.key;
          return (
            <button type="button" key={l.key} aria-pressed={active} onClick={() => onChange(l.key)} style={{
              flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', minHeight: 'var(--touch-min)',
              border: `1.5px solid ${active ? (dark ? 'var(--dark-accent-blue)' : 'var(--kairo-navy-900)') : (dark ? 'var(--dark-border)' : 'var(--color-border-subtle)')}`,
              background: active ? (dark ? 'var(--dark-accent-blue)' : 'var(--kairo-navy-900)') : (dark ? 'var(--dark-bg-surface)' : '#fff'),
              color: active ? '#fff' : (dark ? 'var(--dark-text-body)' : 'var(--text-body)'),
            }}>{l.label}</button>
          );
        })}
      </div>
    </div>
  );
}

export function StatTile({ label, value, dark = false }: { label: string; value: ReactNode; dark?: boolean }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: dark ? 'var(--dark-text-heading)' : 'var(--text-heading)' }}>{value}</div>
      <div style={{ fontSize: 11, color: dark ? 'var(--dark-text-muted)' : 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export interface InlineToastProps {
  children: ReactNode;
  tone?: 'default' | 'danger' | 'caution';
}
export function InlineToast({ children, tone = 'default' }: InlineToastProps) {
  const bg = tone === 'danger' ? 'var(--state-danger)' : tone === 'caution' ? 'var(--kairo-gold-600)' : 'var(--dark-bg-elevated)';
  return (
    <div style={{
      position: 'absolute', top: 16, left: 16, right: 16, zIndex: 20, background: bg, color: '#fff', padding: '12px 16px',
      borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-md)', textAlign: 'center',
    }}>{children}</div>
  );
}

export interface OverflowMenuItem {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  tone?: 'default' | 'danger';
}
export interface OverflowMenuProps {
  items: OverflowMenuItem[];
  onClose: () => void;
  tone?: 'light' | 'dark';
}
export function OverflowMenu({ items, onClose, tone = 'light' }: OverflowMenuProps) {
  const dark = tone === 'dark';
  useEscapeToClose(onClose);
  return (
    <div onClick={onClose} role="presentation" style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
      <div onClick={(e) => e.stopPropagation()} role="menu" style={{
        position: 'absolute', top: 54, right: 16, background: dark ? 'var(--dark-bg-elevated)' : '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
        border: `1px solid ${dark ? 'var(--dark-border)' : 'var(--color-border-subtle)'}`, minWidth: 210, padding: 6, fontFamily: 'var(--font-body)',
      }}>
        {items.map((it, idx) => (
          <button type="button" key={idx} role="menuitem" onClick={() => { it.onClick?.(); onClose(); }} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', width: '100%',
            textAlign: 'left', background: 'none', border: 'none', minHeight: 'var(--touch-min)', fontFamily: 'inherit',
            fontSize: 13.5, fontWeight: 600, color: it.tone === 'danger' ? 'var(--state-danger)' : (dark ? 'var(--dark-text-heading)' : 'var(--text-heading)'),
          }}>
            {it.icon}{it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function formatCalcNumber(tok: string): string {
  if (!tok) return tok;
  const neg = tok.startsWith('-');
  if (neg) tok = tok.slice(1);
  let [int, dec] = tok.split('.');
  int = int.replace(/^0+(?=\d)/, '');
  const formatted = int ? Number(int).toLocaleString('en-US') : '0';
  return (neg ? '-' : '') + formatted + (dec !== undefined ? '.' + dec : '');
}
export function formatCalcExpr(raw: string): string {
  return raw.replace(/\d+\.?\d*/g, (m) => formatCalcNumber(m));
}

/** Precedence-climbing evaluator (no eval/Function) for the calculator's button-built expression string. */
function evalCalcExpr(str: string): number {
  const clean = str
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/^-/, '0-')
    .replace(/([+\-*/])-/g, '$10-');
  const tokens = clean.match(/\d+\.?\d*|[+\-*/]/g) ?? [];
  const prec: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const values: number[] = [];
  const ops: string[] = [];
  const applyOp = () => {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    if (op === undefined || a === undefined || b === undefined) throw new Error('bad expression');
    values.push(op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b);
  };
  for (const tok of tokens) {
    if (prec[tok]) {
      while (ops.length && prec[ops[ops.length - 1]] >= prec[tok]) applyOp();
      ops.push(tok);
    } else {
      values.push(Number(tok));
    }
  }
  while (ops.length) applyOp();
  if (values.length !== 1) throw new Error('bad expression');
  return values[0];
}

export function MiniCalculator({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';
  const [raw, setRaw] = useState('');
  function press(k: string) {
    if (k === 'C') { setRaw(''); return; }
    if (k === '⌫') { setRaw((r) => r.slice(0, -1)); return; }
    if (k === '=') {
      try { setRaw((r) => { const v = evalCalcExpr(r || '0'); return Number.isFinite(v) ? String(Math.round(v * 1e8) / 1e8) : 'Error'; }); }
      catch { setRaw('Error'); }
      return;
    }
    if (k === '√') {
      try { setRaw((r) => { const v = Math.sqrt(evalCalcExpr(r || '0')); return Number.isFinite(v) ? String(Math.round(v * 1e8) / 1e8) : 'Error'; }); }
      catch { setRaw('Error'); }
      return;
    }
    if (k === '%') {
      try { setRaw((r) => { const v = evalCalcExpr(r || '0') / 100; return Number.isFinite(v) ? String(v) : 'Error'; }); }
      catch { setRaw('Error'); }
      return;
    }
    setRaw((r) => (r === 'Error' ? k : r + k));
  }
  const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '%', '0', '.', '+'];
  const utilKeys = ['√', '⌫', 'C', '='];
  return (
    <div>
      <div style={{ background: dark ? 'var(--dark-bg-elevated)' : 'var(--kairo-blue-100)', borderRadius: 'var(--radius-md)', padding: '16px', fontSize: 24, fontWeight: 700, color: dark ? 'var(--dark-text-heading)' : 'var(--text-heading)', textAlign: 'right', marginBottom: 14, minHeight: 32, overflowX: 'auto', whiteSpace: 'nowrap' }}>{raw === 'Error' ? 'Error' : (formatCalcExpr(raw) || '0')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {keys.map((k) => (
            <button key={k} onClick={() => press(k)} style={{ padding: '15px 0', borderRadius: 'var(--radius-md)', border: 'none', background: dark ? 'var(--dark-bg-surface)' : '#fff', boxShadow: dark ? 'none' : 'var(--shadow-xs)', fontSize: 17, fontWeight: 600, color: dark ? 'var(--dark-text-heading)' : 'var(--text-heading)', cursor: 'pointer' }}>{k}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {utilKeys.map((k) => (
            <button key={k} onClick={() => press(k)} style={{
              padding: '13px 0', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700,
              background: k === '=' ? (dark ? 'var(--dark-accent-blue)' : 'var(--kairo-navy-900)') : (dark ? 'var(--dark-bg-surface)' : '#fff'),
              color: k === '=' ? '#fff' : (dark ? 'var(--dark-text-heading)' : 'var(--text-heading)'),
              boxShadow: k === '=' || dark ? 'none' : 'var(--shadow-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{k === '⌫' ? <BackspaceIcon /> : k}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  tone?: 'light' | 'dark';
}
export function Modal({ children, onClose, tone = 'light' }: ModalProps) {
  const dark = tone === 'dark';
  useEscapeToClose(onClose);
  return (
    <div onClick={onClose} role="presentation" style={{ position: 'absolute', inset: 0, background: 'rgba(11,23,32,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 30 }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ background: dark ? 'var(--dark-bg-elevated)' : '#fff', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', fontFamily: 'var(--font-body)' }}>
        {children}
      </div>
    </div>
  );
}
