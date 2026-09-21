/**
 * Konstanta global aplikasi.
 * Nilai cache/TTL mengikuti PRD bagian 19 (Caching).
 */

export const APP_NAME = "AniKita";
export const APP_VERSION = "1.0.0";

function normalizeBaseUrl(value) {
  const fallback = "/api";
  if (!value || typeof value !== "string") return fallback;
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed || fallback;
}

/**
 * Base URL API backend (otakudesu-api).
 * - Default "/api" => diproxy oleh Vite dev server ke http://localhost:3000
 * - Bisa diubah lewat VITE_API_BASE_URL (lihat .env.example)
 */
export const API_BASE_URL = normalizeBaseUrl(import.meta.env?.VITE_API_BASE_URL);

/** Timeout request (ms) supaya UI tidak menggantung saat scraping lambat. */
export const REQUEST_TIMEOUT = 25000;

/** TTL cache per jenis request (PRD 19). */
export const CACHE_TTL = {
  home: 10 * 60 * 1000, // 10 menit (5-15 menit)
  search: 5 * 60 * 1000, // 5 menit
  anime: 20 * 60 * 1000, // 20 menit (15-30 menit)
  episode: 5 * 60 * 1000, // 5 menit (beberapa menit)
};

/** Key localStorage (PRD 13 & 14: versi pertama pakai localStorage, tanpa akun). */
export const STORAGE_KEYS = {
  favorites: "anikita:favorites",
  history: "anikita:history",
  recentSearches: "anikita:recent-searches",
  installBanner: "anikita:install-banner-dismissed",
  apiCache: "anikita:api-cache",
  settings: "anikita:settings",
};

/** Batas data agar localStorage & DOM tetap ringan. */
export const LIMITS = {
  history: 60,
  favorites: 200,
  recentSearches: 8,
  initialEpisodes: 24,
  episodePageSize: 48,
  featured: 5,
  latestEpisodes: 6,
  continueWatching: 8,
};

/** Menu bottom navigation (PRD 6). */
export const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/search", label: "Search", icon: "search", end: false },
  { to: "/library", label: "Library", icon: "heart", end: false },
  { to: "/history", label: "History", icon: "clock", end: false },
];

/** Debounce pencarian (PRD 9 & 26). */
export const SEARCH_DEBOUNCE_MS = 450;
export const SEARCH_MIN_LENGTH = 2;

/** Pesan error ramah pengguna (PRD 16: jangan tampilkan error mentah backend). */
export const MESSAGES = {
  genericError: "Tidak dapat mengambil data anime.",
  genericErrorHint: "Periksa koneksi internet kamu, lalu coba lagi.",
  emptySearch: "Anime tidak ditemukan.",
  emptySearchHint: "Coba gunakan kata kunci lain atau periksa ejaan judul.",
  episodeError: "Episode tidak dapat dimuat.",
  animeNotFound: "Anime tidak ditemukan.",
  episodeNotFound: "Episode tidak ditemukan.",
};
