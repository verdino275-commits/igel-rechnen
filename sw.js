// Offline-Speicher. Bei neuen Dateien die Liste ergänzen und die Versionsnummer erhöhen.
var VERSION = 'igel-rechnen-4';
var DATEIEN = [
  './',
  'index.html',
  'css/style.css',
  'js/igel.js',
  'js/aufgaben.js',
  'js/aufgaben-20.js',
  'js/app.js',
  'manifest.webmanifest',
  'icons/favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(DATEIEN); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (namen) {
    return Promise.all(namen.filter(function (n) { return n !== VERSION; }).map(function (n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

// Erst im Netz nachsehen (immer die neueste Version), ohne Internet aus dem Speicher.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || e.request.url.indexOf(self.location.origin) !== 0) return;
  e.respondWith(fetch(e.request).then(function (antwort) {
    var kopie = antwort.clone();
    caches.open(VERSION).then(function (c) { c.put(e.request, kopie); });
    return antwort;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true });
  }));
});
