import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Required for PWA installability (beforeinstallprompt never fires without
// an active service worker) and for Web Push delivery — see public/sw.js.
// Registered after the initial render rather than gating it.
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
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
