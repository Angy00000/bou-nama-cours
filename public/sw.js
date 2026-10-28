// Service worker IBD RENF : permet de rouvrir l'app et les cours déjà consultés sans connexion.
const APP = 'app-v3';
const API = 'api-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(APP).then((c) => c.addAll(['/', '/manifest.webmanifest', '/icon-192.png'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== APP && k !== API).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => {
  if (e.data === 'vider-cache') caches.delete(API);
});

const reseauPuisCache = async (req, nom, cle = req) => {
  const cache = await caches.open(nom);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(cle, res.clone());
    return res;
  } catch {
    const hit = await cache.match(cle);
    if (hit) return hit;
    throw new Error('hors connexion');
  }
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname === '/api/state' || url.pathname === '/api/public' || url.pathname === '/api/file') {
    e.respondWith(reseauPuisCache(req, API));
    return;
  }
  if (url.pathname.startsWith('/api/')) return;
  if (req.mode === 'navigate') {
    e.respondWith(reseauPuisCache(req, APP, '/'));
    return;
  }
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(caches.open(APP).then(async (c) => (await c.match(req)) || fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; })));
  }
});
