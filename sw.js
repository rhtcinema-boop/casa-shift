/* casa シフト（GitHub Pages）: 一度読んだページをスマホに置いて、次からはすぐ開く。裏で最新を取り、次に開いた時に新しい版になる。
   サーバー（script.google.com）への問い合わせには手を出さない。2026-11-07 */
const C = 'casa-shift-v3';
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
/* アプリ通知（Firebase Cloud Messaging から届く）。iPhone は届いたら必ず表示する決まり 2026-11-07 */
self.addEventListener('push', e => {
  let j = {}; try { j = e.data ? e.data.json() : {}; } catch (er) { j = { data: { body: e.data && e.data.text() } }; }
  const d = j.data || {}, n = j.notification || {}; const title = d.title || n.title || 'casa シフト', body = d.body || n.body || '';
  const link = d.link || (j.fcmOptions && j.fcmOptions.link) || n.click_action || '/casa-shift/';
  /* 開いているページにも知らせる（公開した瞬間に画面を最新へ 2026-11-07） */
  const tell = self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => cs.forEach(c => { try { c.postMessage({ type: 'casa-push', kind: d.kind || '', link }); } catch (er) {} })).catch(() => {});
  e.waitUntil(Promise.all([self.registration.showNotification(title, { body, icon: '/casa-shift/icon-192.png', badge: '/casa-shift/icon-192.png', data: { link }, tag: title + body }), tell]));
});
self.addEventListener('notificationclick', e => {
  e.notification.close(); const link = (e.notification.data && e.notification.data.link) || '/casa-shift/';
  e.waitUntil((async () => { const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true }); const base = link.split('?')[0];
    for (const c of cs) if (c.url.split('?')[0] === base && 'focus' in c) { try { await c.navigate(link); } catch (er) {} return c.focus(); }
    return self.clients.openWindow(link); })());
});
