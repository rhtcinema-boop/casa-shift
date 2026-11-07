/* casa シフト（GitHub Pages）: 一度読んだページをスマホに置いて、次からはすぐ開く。裏で最新を取り、次に開いた時に新しい版になる。
   サーバー（script.google.com）への問い合わせには手を出さない。2026-11-07 */
const C = 'casa-shift-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== C) await caches.delete(k); await self.clients.claim(); })()));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return; const u = new URL(r.url); if (u.origin !== location.origin) return;
  const key = u.origin + u.pathname; /* ?k= などは無視して同じページとして控える */
  e.respondWith((async () => {
    const c = await caches.open(C); const hit = await c.match(key);
    const net = fetch(r).then(res => { if (res && res.ok) c.put(key, res.clone()); return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  })());
});
