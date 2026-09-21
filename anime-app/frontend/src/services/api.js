/**
 * API service — satu-satunya tempat frontend berbicara dengan backend
 * (PRD 22). Komponen UI tidak boleh memanggil fetch secara langsung.
 *
 * Tanggung jawab file ini:
 * 1. Transport + timeout + normalisasi error (PRD 16).
 * 2. Caching response (PRD 19) + dedupe request yang identik (PRD 26).
 * 3. Normalisasi bentuk data API -> bentuk yang siap dipakai UI.
 */
import {
  API_BASE_URL,
  CACHE_TTL,
  LIMITS,
  MESSAGES,
  REQUEST_TIMEOUT,
  STORAGE_KEYS,
} from "../utils/constants";
import {
  animeDisplayTitle,
  animeTitleFromEpisode,
  cleanText,
  episodeShortTitle,
  extractEpisodeNumber,
  firstText,
  normalizeEndpoint,
  safeUrl,
  scoreLabel,
  slugFromEndpoint,
  splitGenres,
  statusLabel,
} from "../utils/helpers";

/** Error ramah pengguna; pesan mentah dari backend tidak pernah ditampilkan. */
export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.kind = options.kind ?? "unknown"; // network | timeout | server | empty | invalid
  }
}

const MAX_CACHE_ENTRIES = 80;
const memoryCache = new Map();
const inFlightRequests = new Map();
let sessionLoaded = false;

function readSessionCache() {
  if (sessionLoaded) return;
  sessionLoaded = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEYS.apiCache);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.entries(parsed || {}).forEach(([key, entry]) => {
      if (
        entry &&
        typeof entry.expiresAt === "number" &&
        entry.expiresAt > Date.now()
      ) {
        memoryCache.set(key, entry);
      }
    });
  } catch {
    /* cache hanya optimasi, kegagalan diabaikan */
  }
}

function persistSessionCache() {
  try {
    const payload = {};
    const now = Date.now();
    memoryCache.forEach((entry, key) => {
      if (entry.expiresAt > now) payload[key] = entry;
    });
    window.sessionStorage.setItem(STORAGE_KEYS.apiCache, JSON.stringify(payload));
  } catch {
    /* storage penuh / diblokir: abaikan */
  }
}

function readCache(key) {
  readSessionCache();
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key, data, ttl) {
  memoryCache.set(key, { data, expiresAt: Date.now() + ttl });
  while (memoryCache.size > MAX_CACHE_ENTRIES) {
    const oldest = memoryCache.keys().next();
    if (oldest.done) break;
    memoryCache.delete(oldest.value);
  }
  persistSessionCache();
}

/** Hapus seluruh cache API (dipakai dari menu profil / debugging). */
export function clearApiCache() {
  memoryCache.clear();
  inFlightRequests.clear();
  try {
    window.sessionStorage.removeItem(STORAGE_KEYS.apiCache);
  } catch {
    /* abaikan */
  }
}

/** Info cache untuk halaman profil (transparansi untuk pengguna). */
export function getApiCacheSize() {
  readSessionCache();
  const now = Date.now();
  let count = 0;
  memoryCache.forEach((entry) => {
    if (entry.expiresAt > now) count += 1;
  });
  return count;
}

function toApiError(error) {
  if (error instanceof ApiError) return error;
  if (error?.name === "AbortError") {
    return new ApiError(MESSAGES.genericError, { kind: "timeout" });
  }
  return new ApiError(MESSAGES.genericError, { kind: "network" });
}

/**
 * Request JSON ke backend dengan cache + dedupe.
 *
 * - Jika respons masih ada di cache (TTL belum lewat) -> langsung dipakai,
 *   tidak ada request baru ke backend.
 * - Jika request dengan key sama sedang berjalan -> promise yang sama dipakai
 *   ulang (mencegah request ganda saat React strict mode / navigasi cepat).
 * - `force: true` (tombol "Coba Lagi") melewati cache.
 */
async function request(path, { ttl = CACHE_TTL.search, cacheKey, force = false } = {}) {
  const key = cacheKey || path;

  if (!force) {
    const cached = readCache(key);
    if (cached) return cached;

    const pending = inFlightRequests.get(key);
    if (pending) return pending;
  }

  const task = (async () => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store",
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new ApiError(MESSAGES.genericError, {
          status: response.status,
          kind: "server",
        });
      }

      if (!payload || payload.status === false) {
        throw new ApiError(MESSAGES.genericError, {
          status: response.status,
          kind: "empty",
        });
      }

      writeCache(key, payload, ttl);
      return payload;
    } catch (error) {
      throw toApiError(error);
    } finally {
      window.clearTimeout(timer);
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, task);
  return task;
}

function dedupeBySlug(items) {
  const seen = new Set();
  const result = [];
  items.forEach((item) => {
    if (!item || !item.slug || seen.has(item.slug)) return;
    seen.add(item.slug);
    result.push(item);
  });
  return result;
}

/** Normalisasi item anime dari /api/home maupun /api/search. */
function normalizeAnimeCard(raw) {
  if (!raw || typeof raw !== "object") return null;
  const slug = slugFromEndpoint(raw.endpoint);
  if (!slug) return null;

  const statusRaw = cleanText(raw.status);
  return {
    slug,
    title: animeDisplayTitle(firstText(raw.title)) || slug,
    poster: safeUrl(raw.thumb),
    episode: cleanText(raw.episode),
    day: cleanText(raw.day_updated),
    uploadedOn: cleanText(raw.upload_on),
    score: scoreLabel(raw.score),
    rating: scoreLabel(raw.rating),
    status: statusLabel(statusRaw),
    statusRaw,
    genres: splitGenres(raw.genres),
  };
}

function mapCards(list) {
  if (!Array.isArray(list)) return [];
  return dedupeBySlug(list.map(normalizeAnimeCard).filter(Boolean));
}

/** /api/home -> daftar ongoing, complete, featured, dan episode terbaru. */
export function normalizeHome(payload) {
  const ongoing = mapCards(payload?.ongoing_anime);
  const complete = mapCards(payload?.complete_anime);

  return {
    ongoing,
    complete,
    // Featured & episode terbaru memanfaatkan anime ongoing terbaru
    // (urutan dari API sudah dari yang paling baru diupdate).
    featured: ongoing.slice(0, LIMITS.featured),
    latest: ongoing.slice(0, LIMITS.latestEpisodes),
  };
}

/** /api/search/:query -> daftar hasil pencarian. */
export function normalizeSearch(payload) {
  return mapCards(payload?.search_results);
}

/** /api/anime/:endpoint -> detail anime + daftar episode. */
export function normalizeAnimeDetail(payload) {
  const detail = payload?.anime_detail;
  if (!detail || typeof detail !== "object") return null;

  const episodes = (Array.isArray(detail.episode_list) ? detail.episode_list : [])
    .map((item) => {
      const slug = slugFromEndpoint(item?.endpoint);
      if (!slug) return null;
      const title = cleanText(item?.title);
      return {
        slug,
        title,
        date: cleanText(item?.date),
        number: extractEpisodeNumber(title),
        label: episodeShortTitle(title),
      };
    })
    .filter(Boolean);

  const title = animeDisplayTitle(firstText(detail.title));
  if (!title && episodes.length === 0) return null;

  return {
    title: title || slugFromEndpoint(detail.endpoint) || "Anime",
    japaneseTitle: firstText(detail.japanese, detail.judul_jepang),
    alternativeTitle: firstText(detail.judul),
    poster: safeUrl(detail.thumb),
    synopsis: cleanText(detail.synopsis),
    score: scoreLabel(detail.skor),
    status: statusLabel(detail.status),
    statusRaw: cleanText(detail.status),
    type: firstText(detail.tipe),
    genres: splitGenres(detail.genre),
    studio: firstText(detail.studio),
    producer: firstText(detail.produser),
    duration: firstText(detail.durasi),
    totalEpisode: firstText(detail.total_episode),
    releaseDate: firstText(detail.tanggal_rilis),
    episodes,
  };
}

/** /api/episode/:endpoint -> link streaming + daftar server/download. */
export function normalizeEpisode(payload) {
  const detail = payload?.episode_detail;
  if (!detail || typeof detail !== "object") return null;

  const title = cleanText(detail.title);
  const downloads = (Array.isArray(detail.downloads) ? detail.downloads : [])
    .map((group) => ({
      quality: firstText(group?.quality) || "Lainnya",
      size: cleanText(group?.size),
      servers: (Array.isArray(group?.links) ? group.links : [])
        .map((link) => ({
          name: firstText(link?.server) || "Server",
          url: safeUrl(link?.url),
        }))
        .filter((server) => server.url),
    }))
    .filter((group) => group.servers.length > 0);

  const episodeNumber = extractEpisodeNumber(title);

  return {
    title,
    animeTitle: animeTitleFromEpisode(title),
    label: episodeNumber ? `Episode ${episodeNumber}` : episodeShortTitle(title),
    episodeNumber,
    streamUrl: safeUrl(detail.stream_link),
    downloads,
  };
}

/* ------------------------------------------------------------------ */
/* API publik yang dipakai komponen (PRD 22)                          */
/* ------------------------------------------------------------------ */

/** GET /api/home */
export async function getHome({ force = false } = {}) {
  const payload = await request("/home", {
    ttl: CACHE_TTL.home,
    cacheKey: "home",
    force,
  });
  return normalizeHome(payload);
}

/** GET /api/search/:query */
export async function searchAnime(query, { force = false } = {}) {
  const term = cleanText(query);
  if (!term) return [];

  const payload = await request(`/search/${encodeURIComponent(term)}`, {
    ttl: CACHE_TTL.search,
    cacheKey: `search:${term.toLowerCase()}`,
    force,
  });
  return normalizeSearch(payload);
}

/** GET /api/anime/:endpoint */
export async function getAnimeDetail(endpoint, { force = false } = {}) {
  const slug = normalizeEndpoint(endpoint);
  if (!slug) {
    throw new ApiError(MESSAGES.animeNotFound, { kind: "invalid" });
  }

  const payload = await request(`/anime/${encodeURIComponent(slug)}`, {
    ttl: CACHE_TTL.anime,
    cacheKey: `anime:${slug}`,
    force,
  });

  const detail = normalizeAnimeDetail(payload);
  if (!detail) {
    throw new ApiError(MESSAGES.animeNotFound, { kind: "empty" });
  }
  return { ...detail, slug };
}

/** GET /api/episode/:endpoint */
export async function getEpisode(endpoint, { force = false } = {}) {
  const slug = normalizeEndpoint(endpoint);
  if (!slug) {
    throw new ApiError(MESSAGES.episodeNotFound, { kind: "invalid" });
  }

  const payload = await request(`/episode/${encodeURIComponent(slug)}`, {
    ttl: CACHE_TTL.episode,
    cacheKey: `episode:${slug}`,
    force,
  });

  const episode = normalizeEpisode(payload);
  if (!episode) {
    throw new ApiError(MESSAGES.episodeError, { kind: "empty" });
  }
  return { ...episode, slug };
}

/**
 * Baca detail anime dari cache tanpa memicu request.
 * Dipakai halaman Watch agar judul anime & daftar episode bisa tampil
 * seketika bila pengguna datang dari halaman detail (tanpa request ulang).
 */
export function peekAnimeDetail(endpoint) {
  const slug = normalizeEndpoint(endpoint);
  if (!slug) return null;

  const payload = readCache(`anime:${slug}`);
  if (!payload) return null;

  const detail = normalizeAnimeDetail(payload);
  return detail ? { ...detail, slug } : null;
}

/* ------------------------------------------------------------------ */
/* Resolver & relay video (server.cjs port 4000, diproxy Vite)        */
/* ------------------------------------------------------------------ */

/**
 * Ekstrak URL video langsung dari halaman embed desustream.
 * Mengembalikan { ok, direct, size } atau melempar Error.
 */
export async function resolveStream(embedUrl) {
  const response = await fetch(`/resolve?url=${encodeURIComponent(embedUrl)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error((data && data.error) || `Resolver HTTP ${response.status}`);
  }
  return response.json();
}

/** Bentuk URL relay untuk <video src>. */
export function relayUrl(directUrl) {
  return `/vstream?url=${encodeURIComponent(directUrl)}`;
}



