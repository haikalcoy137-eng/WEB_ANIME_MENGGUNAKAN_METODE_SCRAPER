/**
 * Service worker AniKita (PRD 27).
 *
 * Strategi:
 * - App shell (HTML/ikon)      : cache-first, fallback ke index.html saat offline
 * - Aset statis same-origin    : cache-first
 * - POSTER gambar (cross-origin): cache-first + pemangkasan ukuran cache
 * - API /api/*                 : network-first (data scraping harus segar),
 *                               fallback ke cache maksimal 5 menit saat offline
 *
 * Tidak ada request tambahan: hanya request yang sudah dilakukan browser yang di-cache.
 */

const VERSION = "v1";
const SHELL_CACHE = `anikita-shell-${VERSION}`;
const API_CACHE = `anikita-api-${VERSION}`;
const IMAGE_CACHE = `anikita-image-${VERSION}`;

const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const API_MAX_AGE_MS = 5 * 60 * 1000;
const IMAGE_MAX_ENTRIES = 240;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(
        SHELL_ASSETS.map((asset) => cache.add(asset).catch(() => undefined))
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !key.endsWith(VERSION)).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(
    keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key))
  );
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === "opaque")) {
      await cache.put(request, response.clone());
      if (maxEntries) trimCache(cacheName, maxEntries);
    }
    return response;
  } catch (error) {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function networkFirst(request, cacheName, maxAgeMs) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const headers = new Headers(response.headers);
      headers.set("x-cached-at", String(Date.now()));
      const body = await response.clone().blob();
      await cache.put(
        request,
        new Response(body, { status: response.status, statusText: response.statusText, headers })
      );
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      const cachedAt = Number(cached.headers.get("x-cached-at") || 0);
      if (!maxAgeMs || Date.now() - cachedAt <= maxAgeMs) return cached;
    }

    // Pesan ramah, bukan error mentah (PRD 16)
    return new Response(
      JSON.stringify({
        status: false,
        message: "Tidak dapat mengambil data anime (mode offline).",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API: selalu coba jaringan dulu
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE, API_MAX_AGE_MS));
    return;
  }

  // Navigasi SPA: fallback ke app shell saat offline
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch (error) {
          const cache = await caches.open(SHELL_CACHE);
          return (
            (await cache.match("/index.html")) ||
            (await cache.match("/")) ||
            new Response("", { status: 504, statusText: "Offline" })
          );
        }
      })()
    );
    return;
  }

  // Aset statis aplikasi
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // Poster anime dari domain sumber
  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, IMAGE_MAX_ENTRIES));
  }
});
