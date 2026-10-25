import { useState, useRef, useEffect, useId } from 'react';
import { useSyncStatus, type SyncState } from '../../lib/syncStatus';

export interface SyncStatusIndicatorProps {
  /** When true, renders a compact micro-badge (icon only), ideal for constrained header spaces */
  compact?: boolean;
  /** Tone matching canvas theme, default 'dark' */
  tone?: 'dark' | 'light';
  id?: string;
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Not yet this session';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Icons for different states
function CloudOffIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0-4 7h1a5 5 0 0 0 4.15 4.95" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function CloudCheckIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      <polyline points="9 13 11 15 15 11" />
    </svg>
  );
}

function RefreshSpinIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'kairo-spin 1.2s linear infinite' }}>
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  );
}

function AlertIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function SyncStatusIndicator({ compact = false, tone = 'dark', id }: SyncStatusIndicatorProps) {
  const { isOnline, status, lastSyncedAt, pendingCount, lastError, syncNow } = useSyncStatus();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [manualSyncing, setManualSyncing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const elementId = id || `sync-indicator-${autoId.replace(/:/g, '')}`;

  // Dismiss popover on click outside or Escape key
  useEffect(() => {
    if (!popoverOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopoverOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [popoverOpen]);

  // Handle manual sync action
  const handleManualSync = async () => {
    if (manualSyncing || !isOnline) return;
    setManualSyncing(true);
    try {
      await syncNow();
    } finally {
      setTimeout(() => setManualSyncing(false), 600);
    }
  };

  // Determine appearance based on effective status
  const effectiveStatus: SyncState = !isOnline ? 'offline' : (manualSyncing ? 'syncing' : status);

  let label = 'Synced';
  let icon = <CloudCheckIcon />;
  let color = 'var(--dark-success, #2ecc8f)';
  let bg = 'rgba(46, 204, 143, 0.08)';
  let border = 'rgba(46, 204, 143, 0.22)';
  let titleAttr = 'Cloud sync active: All progress backed up';

  if (effectiveStatus === 'offline') {
    label = 'Offline';
    icon = <CloudOffIcon />;
    color = 'var(--dark-caution, #e0a039)';
    bg = 'rgba(224, 160, 57, 0.12)';
    border = 'rgba(224, 160, 57, 0.28)';
    titleAttr = 'Working offline: Progress stored locally on device';
  } else if (effectiveStatus === 'syncing') {
    label = 'Syncing...';
    icon = <RefreshSpinIcon />;
    color = 'var(--dark-accent-blue, #2e7cf6)';
    bg = 'rgba(46, 124, 246, 0.12)';
    border = 'rgba(46, 124, 246, 0.28)';
    titleAttr = 'Syncing data with cloud...';
  } else if (effectiveStatus === 'error') {
    label = 'Sync issue';
    icon = <AlertIcon />;
    color = 'var(--dark-danger, #ff5c6c)';
    bg = 'rgba(255, 92, 108, 0.1)';
    border = 'rgba(255, 92, 108, 0.25)';
    titleAttr = 'Last sync failed: Tap to retry';
  }

  const isDark = tone === 'dark';

  return (
    <div
      ref={containerRef}
      id={`${elementId}-container`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
      }}
    >
      <style>{`
        @keyframes kairo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Main Pill Button */}
      <button
        id={elementId}
        type="button"
        onClick={() => setPopoverOpen((prev) => !prev)}
        aria-expanded={popoverOpen}
        aria-haspopup="dialog"
        aria-label={`Connection status: ${label}`}
        title={titleAttr}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: compact ? 0 : 5,
          padding: compact ? '4px 6px' : '3px 9px',
          minHeight: 26,
          borderRadius: 'var(--radius-pill)',
          background: bg,
          border: `1px solid ${border}`,
          color,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.01em',
          lineHeight: 1,
          transition: 'background 0.15s ease, border-color 0.15s ease, transform 0.12s ease',
          outline: 'none',
          boxShadow: popoverOpen ? `0 0 0 2px ${color}33` : 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </span>
        {!compact && <span>{label}</span>}
      </button>

      {/* Interactive Detail Popover */}
      {popoverOpen && (
        <div
          id={`${elementId}-popover`}
          role="dialog"
          aria-label="Sync & Connection Status"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 90,
            width: 270,
            maxWidth: 'calc(100vw - 32px)',
            background: isDark ? 'var(--dark-bg-surface, #012748)' : 'var(--kairo-white, #ffffff)',
            border: `1px solid ${isDark ? 'var(--dark-border, rgba(255, 255, 255, 0.14))' : 'var(--color-border-subtle, #e2e8f0)'}`,
            borderRadius: 'var(--radius-md, 14px)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            fontFamily: 'var(--font-body)',
            boxSizing: 'border-box',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: color,
                display: 'inline-block',
                boxShadow: `0 0 6px ${color}`,
              }} />
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: isDark ? 'var(--dark-text-heading, #ffffff)' : 'var(--text-heading, #012748)',
              }}>
                {effectiveStatus === 'offline' ? 'Working Offline' : (effectiveStatus === 'syncing' ? 'Syncing...' : 'Data Up to Date')}
              </span>
            </div>

            <button
              id={`${elementId}-btn-close`}
              type="button"
              onClick={() => setPopoverOpen(false)}
              aria-label="Close status panel"
              style={{
                background: 'transparent',
                border: 'none',
                color: isDark ? 'var(--dark-text-faint, #5d7096)' : 'var(--text-faint, #94a3b8)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                borderRadius: 4,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Descriptive text */}
          <p style={{
            fontSize: 12,
            lineHeight: 1.45,
            color: isDark ? 'var(--dark-text-body, #d3ddf0)' : 'var(--text-body, #334155)',
            margin: 0,
          }}>
            {effectiveStatus === 'offline'
              ? 'You are practicing offline. All answers, CBT attempts, and bookmarks are saved securely on your device and will sync automatically when back online.'
              : 'Your questions, progress, streaks, and flashcards are backed up safely to the cloud.'}
          </p>

          {/* Sync Metadata summary */}
          <div style={{
            background: isDark ? 'var(--dark-bg-canvas, #001d36)' : 'var(--color-bg-sunken, #f8fafc)',
            borderRadius: 'var(--radius-sm, 8px)',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            fontSize: 11,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: isDark ? 'var(--dark-text-muted, #93a6c9)' : 'var(--text-muted, #64748b)' }}>
              <span>Connection:</span>
              <span style={{ fontWeight: 600, color: isOnline ? 'var(--dark-success, #2ecc8f)' : 'var(--dark-caution, #e0a039)' }}>
                {isOnline ? 'Online' : 'Disconnected'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: isDark ? 'var(--dark-text-muted, #93a6c9)' : 'var(--text-muted, #64748b)' }}>
              <span>Last synced:</span>
              <span style={{ fontWeight: 600, color: isDark ? 'var(--dark-text-heading, #fff)' : 'var(--text-heading, #012748)' }}>
                {formatRelativeTime(lastSyncedAt)}
              </span>
            </div>
            {pendingCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDark ? 'var(--dark-text-muted, #93a6c9)' : 'var(--text-muted, #64748b)' }}>
                <span>Queued local items:</span>
                <span style={{ fontWeight: 600, color: 'var(--dark-accent-blue, #2e7cf6)' }}>
                  {pendingCount} pending
                </span>
              </div>
            )}
            {lastError && effectiveStatus === 'error' && (
              <div style={{ color: 'var(--dark-danger, #ff5c6c)', marginTop: 2, fontSize: 10.5 }}>
                Notice: {lastError}
              </div>
            )}
          </div>

          {/* Action button */}
          {isOnline ? (
            <button
              id={`${elementId}-btn-sync-now`}
              type="button"
              onClick={handleManualSync}
              disabled={manualSyncing || effectiveStatus === 'syncing'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm, 8px)',
                background: 'var(--dark-accent-blue, #2e7cf6)',
                border: 'none',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                cursor: manualSyncing ? 'default' : 'pointer',
                opacity: manualSyncing ? 0.7 : 1,
                transition: 'background 0.15s ease, opacity 0.15s ease',
              }}
            >
              <RefreshSpinIcon size={12} />
              <span>{manualSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          ) : (
            <div style={{
              fontSize: 11,
              color: 'var(--dark-caution, #e0a039)',
              textAlign: 'center',
              fontWeight: 500,
            }}>
              Will sync automatically when internet restores
            </div>
          )}
        </div>
      )}
    </div>
  );
}
