// Tryb offline: pliki aplikacji trafiają do pamięci podręcznej.
// Strategia "stale-while-revalidate": od razu pokazujemy wersję z pamięci,
// a w tle pobieramy nowszą. Przy większych zmianach podbij CACHE.
const CACHE = 'inglisz-v16';
const FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data/words.js',
  './data/sentences.js',
  './data/dict.js',
  './data/tatoeba.js',
  './data/grammar.js',
  './data/grammar_extra1.js',
  './data/grammar_extra2.js',
  './data/grammar_extra3.js',
  './data/grammar_extra4.js',
  './data/grammar_extra5.js',
  './data/grammar_extra6.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  // cache: 'reload' omija pamięć HTTP przeglądarki, żeby nowa wersja nie dostała starych plików.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      const network = fetch(e.request, { cache: 'no-cache' })
        .then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
