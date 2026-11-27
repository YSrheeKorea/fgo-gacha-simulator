// ============================================================
// CHALDEA SUMMON SIMULATOR — OFFLINE-READY PWA SERVICE WORKER (sw.js)
// Strategy: Network-First for core app files + Cache-First for Atlas Academy card images
// ============================================================
const CACHE_NAME = 'chaldea-gacha-pwa-v26';
const IMG_CACHE_NAME = 'chaldea-gacha-art-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './style.css?v=23',
  './servant_catalog.js?v=15',
  './mystic_codes.js?v=11',
  './class_passives.js?v=21',
  './chaldea_gate.js?v=22',
  './data.js?v=22',
  './atlas_images.js?v=10',
  './kr_lore.js?v=6',
  './audio.js',
  './art.js?v=10',
  './summon_fx.js?v=12',
  './terminal.js?v=23',
  './game.js?v=23',
  './battle.js?v=23',
  './pwa.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => k !== CACHE_NAME && k !== IMG_CACHE_NAME)
            .map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Atlas Academy 공식 일러스트 캐싱 (한 번 불러온 일러스트는 오프라인에서도 표시!)
  if (url.hostname === 'static.atlasacademy.io') {
    event.respondWith(
      caches.open(IMG_CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(resp => {
            if (resp && (resp.status === 200 || resp.type === 'opaque')) {
              cache.put(event.request, resp.clone());
            }
            return resp;
          }).catch(() => new Response('', { status: 504 }));
        })
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // 앱 핵심 파일: Network-First (온라인에서는 최신 유지, 오프라인에서는 캐시 사용)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503 });
        })
      )
  );
});
