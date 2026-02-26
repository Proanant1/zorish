const CACHE_VERSION = "freefinity-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.png",
  "/icons/icon-48.png",
  "/icons/icon-72.png",
  "/icons/icon-96.png",
  "/icons/icon-144.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png"
];

// ── Install: pre-cache static assets ──────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_ASSETS).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ── Activate: clean up old caches ─────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: stale-while-revalidate for pages, skip for API ────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept non-GET or cross-origin requests
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Pass API calls straight through (always live)
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/objects/")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            const cacheName = PRECACHE_ASSETS.includes(url.pathname)
              ? STATIC_CACHE
              : DYNAMIC_CACHE;
            caches.open(cacheName).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached ?? new Response("Offline", { status: 503 }));

      // Return cached version immediately, update in background
      return cached || networkFetch;
    })
  );
});

// ── Push notifications (future-ready) ─────────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data?.json?.() ?? {};
  const title = data.title || "Freefinity India";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-96.png",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
