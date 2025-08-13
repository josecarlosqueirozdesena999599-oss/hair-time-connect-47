// Service Worker para PWA
const CACHE_NAME = 'barber-app-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/lovable-uploads/b0bc04e6-32a1-44ba-b0b0-eddf5f9e9bdc.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Listen for install prompt
let deferredPrompt;

self.addEventListener('beforeinstallprompt', (e) => {
  deferredPrompt = e;
  e.preventDefault();
});