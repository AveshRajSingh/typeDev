// Service Worker for Offline Support
const CACHE_VERSION = 'typedev-v3';
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Check if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Pages to cache for offline use
const PAGES_TO_CACHE = [
  '/',
  '/auth',
  '/results',
];

// Static assets to cache
const STATIC_ASSETS = [
  '/favicon.ico',
];

// Install event - cache core pages
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(PAGES_CACHE).then((cache) => {
        console.log('Service Worker: Caching pages');
        return cache.addAll(PAGES_TO_CACHE.map(url => new Request(url, { cache: 'reload' })));
      }).catch(error => {
        console.error('Failed to cache pages:', error);
      }),
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(error => {
          console.error('Failed to cache static assets:', error);
        });
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('typedev-') && cacheName !== PAGES_CACHE && cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip API requests to backend (handled by Cache API)
  if (url.hostname === 'localhost' && url.port === '5000') {
    return;
  }

  // Handle navigation requests (page loads)
  if (request.mode === 'navigate') {
    event.respondWith(
      // Network-first strategy: Always try network first
      fetch(request, { cache: 'no-cache' })
        .then((response) => {
          // Clone and cache successful responses only if not in development
          if (response.ok && !isDevelopment) {
            const responseClone = response.clone();
            caches.open(PAGES_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('Service Worker: Serving page from cache:', url.pathname);
              return cachedResponse;
            }
            
            // No cache, serve root page as fallback
            return caches.match('/').then((rootResponse) => {
              if (rootResponse) {
                console.log('Service Worker: Serving root page as fallback');
                return rootResponse;
              }
              
              // Return a basic offline page
              return new Response(
                `<!DOCTYPE html>
                <html>
                  <head>
                    <title>Offline - TypeDev</title>
                    <style>
                      body {
                        font-family: system-ui, -apple-system, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: #0f172a;
                        color: #e2e8f0;
                      }
                      .container {
                        text-align: center;
                        padding: 2rem;
                      }
                      h1 { color: #60a5fa; margin-bottom: 1rem; }
                      p { color: #94a3b8; margin-bottom: 1.5rem; }
                      button {
                        background: #60a5fa;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        font-size: 1rem;
                      }
                      button:hover { background: #3b82f6; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <h1>🔌 You're Offline</h1>
                      <p>Please check your internet connection and try again.</p>
                      <button onclick="location.reload()">Retry</button>
                    </div>
                  </body>
                </html>`,
                {
                  headers: { 'Content-Type': 'text/html' }
                }
              );
            });
          });
        })
    );
    return;
  }

  // Handle other requests (JS, CSS, images, etc.)
  // In development: Network-first always
  // In production: Cache-first for performance, but revalidate
  event.respondWith(
    isDevelopment
      ? // Development: Always fetch from network
        fetch(request, { cache: 'no-store' })
          .catch(() => caches.match(request))
      : // Production: Try cache first, then network
        caches.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((response) => {
            // Cache successful responses
            if (response.ok && request.method === 'GET') {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });

          // Return cached version while updating in background
          return cachedResponse || fetchPromise;
        })
        .catch(() => {
          // Network failed and no cache
          console.log('Service Worker: Failed to fetch:', request.url);
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        })
  );
});

// Message event - handle commands from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_PAGES') {
    event.waitUntil(
      caches.open(PAGES_CACHE).then((cache) => {
        return cache.addAll(PAGES_TO_CACHE);
      })
    );
  }
});
