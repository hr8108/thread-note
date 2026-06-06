// 버전 바꾸면 자동으로 모든 사용자에게 업데이트됨
const CACHE = 'threadnote-v31';
const ASSETS = ['/thread-note/', '/thread-note/index.html', '/thread-note/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting(); // 즉시 활성화
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // 즉시 모든 탭에 적용
  );
});

self.addEventListener('fetch', e => {
  // HTML은 항상 네트워크 우선 → 업데이트 즉시 반영
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // 나머지는 캐시 우선
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// 새 버전 감지 시 모든 탭 자동 새로고침
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
