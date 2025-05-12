// Service worker for API caching

// Cache names
const STATIC_CACHE = 'todo-static-v1';
const API_CACHE = 'todo-api-v1';

// Resources to cache immediately on installation
const STATIC_ASSETS = [
  './',
  './index.html',
  './assets/index-cmbdYmzo.css',
  './assets/index-B4rPrHc8.js'
];

// Listen for the install event
self.addEventListener('install', event => {
  // Skip waiting so the new service worker activates immediately
  self.skipWaiting();

  // Cache static assets
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Listen for the activate event
self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Network-first strategy with caching for API calls
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isApiCall = url.pathname.startsWith('/api/');
  
  if (isApiCall) {
    // For API calls, use stale-while-revalidate strategy
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return fetch(event.request)
          .then(networkResponse => {
            // Only cache GET responses
            if (event.request.method === 'GET' && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // If network fails, try from cache
            return cache.match(event.request);
          });
      })
    );
  } else {
    // For non-API calls, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request)
            .then(fetchResponse => {
              return caches.open(STATIC_CACHE).then(cache => {
                // Only cache successful responses
                if (fetchResponse.ok) {
                  cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
              });
            });
        })
    );
  }
});
