// Kairo service worker — registered once from src/main.tsx.
//
// Two responsibilities:
//   1. A registered service worker with a fetch handler is part of
//      Chrome/Edge's install criteria (Batch 2 — without this,
//      beforeinstallprompt never fires no matter how complete
//      manifest.json is).
//   2. Receive and display Web Push notifications sent to the VAPID
//      subscription stored in kairo.push_subscriptions when the student
//      opts in (Batch 3 — see NotificationSettings.tsx / EnableNotifications.tsx
//      and lib/pushSubscription.ts for the client-side half).
//
// Deliberately not an offline app-shell cache — Kairo's real offline story
// already lives in IndexedDB (LocalStore/SyncManager, see kairoEngine.ts),
// so a competing Cache API layer here would only risk serving stale HTML/JS
// on top of that, not add real offline capability.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// No-op passthrough: every request still goes straight to the network.
// Present only so the browser recognizes a "real" fetch handler exists.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Kairo', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Kairo';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/assets/icon-192.png',
    badge: payload.badge || '/assets/icon-192.png',
    tag: payload.tag,
    data: { url: payload.url || '/home' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Deep-links into whichever screen the notification was about — reuses an
// already-open Kairo tab/window on that same route if one exists, instead
// of always spawning a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/home';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          if (new URL(client.url).pathname === targetUrl && 'focus' in client) return client.focus();
        } catch {
          // malformed client.url — fall through and try the next one
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    }),
  );
});
