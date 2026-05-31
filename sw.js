/* watermellie service worker — offline shell cache.
   Bump CACHE on each deploy (kept in step with the ?v= query in index.html). */
const CACHE = 'watermellie-v15';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=15',
  './app.js?v=15',
  './curriculum.js?v=15',
  './manifest.webmanifest',
  './favicon.svg',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});

// let the page tell a waiting worker to activate immediately
self.addEventListener('message', (e) => { if (e.data === 'skip-waiting') self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // never cache Supabase / weather / geocode API calls — always go to network
  if (url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;
  // network-first for our own HTML/JS/CSS so updates land; fall back to cache offline
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
