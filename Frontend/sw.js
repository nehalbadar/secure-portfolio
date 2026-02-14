// Service Worker for caching and performance optimization
// NOTE: Bump CACHE_VERSION whenever you deploy changes to HTML/CSS/JS.
const CACHE_VERSION = 'v1.0.1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/about.html',
    '/skills.html',
    '/projects.html',
    '/project-detail.html',
    '/contact.html',
    '/styles.css',
    '/script.js',
    '/manifest.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/api/projects',
    '/api/github/stats',
    '/api/github/contributions'
];

self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('[SW] Error caching static assets:', error);
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

function isHttpRequest(url) {
    return url.protocol === 'http:' || url.protocol === 'https:';
}

function isSameOrigin(url) {
    return url.origin === self.location.origin;
}

function shouldCache(request, response, url) {
    if (request.method !== 'GET') return false;
    if (!response || response.status !== 200) return false;
    if (!isHttpRequest(url)) return false;
    // Avoid caching cross-origin resources to reduce opaque caching issues.
    return isSameOrigin(url);
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Never intercept non-http(s) requests (prevents chrome-extension:// cache errors)
    if (!isHttpRequest(url)) return;

    // Navigation (HTML) requests: network-first so updates show up immediately
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(STATIC_CACHE)
                        .then((cache) => {
                            cache.put('/index.html', responseClone);
                        });
                    return response;
                })
                .catch(() => caches.match(request).then((r) => r || caches.match('/index.html')))
        );
        return;
    }

    // Handle API requests with network-first strategy
    if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone the response for caching
                    if (shouldCache(request, response, url)) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(request);
                })
        );
        return;
    }

    // Static assets: stale-while-revalidate so CSS/JS updates propagate without manual cache clears
    if (STATIC_ASSETS.includes(url.pathname) || request.destination === 'style' || request.destination === 'script') {
        event.respondWith(
            caches.match(request).then((cached) => {
                const networkFetch = fetch(request)
                    .then((response) => {
                        if (shouldCache(request, response, url)) {
                            const responseClone = response.clone();
                            caches.open(STATIC_CACHE)
                                .then((cache) => {
                                    cache.put(request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => cached);

                // If we have a cached response, return it immediately and update cache in background.
                if (cached) {
                    event.waitUntil(networkFetch.catch(() => undefined));
                    return cached;
                }

                return networkFetch;
            })
        );
        return;
    }

    // Default network-first strategy for other requests
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses
                if (shouldCache(request, response, url)) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then((cache) => {
                            cache.put(request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        // Return offline fallback for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync for contact form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForm());
    }
});

async function syncContactForm() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const keys = await cache.keys();
        const contactRequests = keys.filter(request =>
            request.url.includes('/api/contact')
        );

        await Promise.all(
            contactRequests.map(async (request) => {
                try {
                    const response = await fetch(request);
                    if (response.ok) {
                        await cache.delete(request);
                    }
                } catch (error) {
                    console.error('[SW] Failed to sync contact form:', error);
                }
            })
        );
    } catch (error) {
        console.error('[SW] Error in background sync:', error);
    }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192x192.svg',
            badge: '/icon-192x192.svg',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});