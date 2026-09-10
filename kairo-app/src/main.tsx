import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import App from './App';

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(_error: unknown, _info: ErrorInfo) {
    // Keep the boundary intentionally quiet in production; the user gets a
    // recovery action instead of a blank document.
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: '#071426', color: '#fff', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, margin: '0 0 10px' }}>KAIRO needs a refresh</h1>
            <p style={{ color: '#b7c8d8', lineHeight: 1.5, maxWidth: 360 }}>That screen could not be loaded. Your draft text is still safe to paste again.</p>
            <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 999, padding: '12px 20px', background: '#e0a039', color: '#1a1200', fontWeight: 800, cursor: 'pointer' }}>Reload KAIRO</button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
);

// Required for PWA installability (beforeinstallprompt never fires without
// an active service worker) and for Web Push delivery — see public/sw.js.
// Registered after the initial render rather than gating it.
if ('serviceWorker' in navigator) {
  // The service worker is only used for installability and push. Do not
  // force a document reload when Chrome changes controllers: returning from
  // the Android file picker can coincide with that event, which would wipe
  // the in-memory quiz-import draft and look like the app restarted.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=kairo-profile-preview-20260908', { updateViaCache: 'none' }).then((registration) => {
      registration.update().catch(() => {
        // Best-effort — the active app remains usable if the update check is unavailable.
      });
    }).catch(() => {
      // Best-effort — a failed registration just means no install prompt/push this session.
    });
  });
}
