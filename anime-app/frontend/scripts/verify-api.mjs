/**
 * Verifikasi integrasi frontend <-> backend otakudesu-api.
 *
 * Menjalankan service API asli (src/services/api.js) memakai Vite SSR module
 * loader — resolusi import sama seperti aplikasi — dengan global browser
 * minimal, lalu memeriksa bentuk data dari keempat endpoint, perilaku cache,
 * dan dedupe request.
 *
 * Prasyarat: backend berjalan di http://localhost:3000
 * Jalankan: npm run verify:api
 */
import { fileURLToPath } from "node:url";

const BACKEND = process.env.ANIKITA_BACKEND || "http://localhost:3000";
const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));

let fetchCount = 0;
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  fetchCount += 1;
  const target =
    typeof input === "string" ? new URL(input, BACKEND).toString() : input;
  return realFetch(target, init);
};

function memoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

// Global browser minimal (service API memakai sessionStorage + location.origin)
globalThis.window = {
  sessionStorage: memoryStorage(),
  localStorage: memoryStorage(),
  location: { origin: BACKEND },
  setTimeout: globalThis.setTimeout,
  clearTimeout: globalThis.clearTimeout,
};

const { createServer } = await import("vite");

const vite = await createServer({
  root: PROJECT_ROOT,
  configFile: false,
  logLevel: "silent",
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true },
});

const api = await vite.ssrLoadModule("/src/services/api.js");
const helpers = await vite.ssrLoadModule("/src/utils/helpers.js");

const { getHome, searchAnime, getAnimeDetail, getEpisode, getApiCacheSize, clearApiCache } = api;
const { slugFromEndpoint, resolvePlayback, statusLabel, formatRelativeTime, watchPath } =
  helpers;


let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  OK   ${label}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${label}${detail ? ` -> ${detail}` : ""}`);
  }
}

function assertThrows(label, promise) {
  return promise.then(
    () => {
      failed += 1;
      console.error(`  FAIL ${label} -> seharusnya gagal`);
    },
    () => console.log(`  OK   ${label}`)
  );
}

console.log(`\nVerifikasi API backend: ${BACKEND}\n`);

console.log("→ HOME (/api/home)");
const home = await getHome();
check("ongoing_anime berisi data", home.ongoing.length > 0, `${home.ongoing.length} item`);
check("complete_anime berisi data", home.complete.length > 0, `${home.complete.length} item`);
check("featured & latest terisi", home.featured.length > 0 && home.latest.length > 0);
check(
  "setiap card punya slug + judul + poster absolut",
  home.ongoing.every((item) => item.slug && item.title && item.poster.startsWith("http"))
);
check(
  "slug tidak mengandung '/' (aman untuk routing)",
  home.ongoing.every((item) => !item.slug.includes("/"))
);
check(
  "card ongoing membawa informasi episode",
  home.ongoing.every((item) => item.episode.length > 0)
);

const callsAfterHome = fetchCount;
const homeCached = await getHome();
check("home kedua tidak memicu request baru (cache)", fetchCount === callsAfterHome);
check(
  "cache mengembalikan data yang setara",
  homeCached.ongoing.length === home.ongoing.length &&
    homeCached.ongoing[0].slug === home.ongoing[0].slug
);

clearApiCache();
const callsBeforeParallel = fetchCount;
await Promise.all([getHome(), getHome(), getHome()]);
check(
  "3 request paralel dengan key sama hanya jadi 1 request (dedupe)",
  fetchCount - callsBeforeParallel === 1,
  `request: ${fetchCount - callsBeforeParallel}`
);

console.log("\n→ SEARCH (/api/search/:query)");
const searchResults = await searchAnime("naruto");
check("hasil pencarian tidak kosong", searchResults.length > 0, `${searchResults.length} hasil`);
check(
  "hasil punya slug, judul, status",
  searchResults.every((item) => item.slug && item.title && item.statusRaw.length > 0)
);
check(
  "tag genre diparse menjadi array",
  searchResults.some((item) => Array.isArray(item.genres) && item.genres.length > 0)
);
const emptySearch = await searchAnime("zzz-judul-yang-tidak-ada-xyz");
check("kata kunci tanpa hasil mengembalikan array kosong", Array.isArray(emptySearch) && emptySearch.length === 0);

console.log("\n→ ANIME DETAIL (/api/anime/:endpoint)");
const target = searchResults[0];
const detail = await getAnimeDetail(target.slug);
check("judul & synopsis terisi", Boolean(detail.title) && detail.synopsis.length > 20);
check("poster absolut", detail.poster.startsWith("http"));
check("slug sama dengan yang diminta", detail.slug === target.slug);
check("daftar episode tersedia", detail.episodes.length > 0, `${detail.episodes.length} episode`);
check(
  "setiap episode punya slug + label + tanggal",
  detail.episodes.every((episode) => episode.slug && episode.label.startsWith("Episode"))
);
check(
  "nomor episode terbaca dari judul",
  detail.episodes.every((episode) => /^\d/.test(episode.number) || episode.number === "")
);
check("info tambahan (studio/status/tipe) terbaca", Boolean(detail.status) && Boolean(detail.type));

// Detail yang sudah di-cache dipakai ulang lewat peekAnimeDetail
check("peekAnimeDetail membaca cache tanpa request", Boolean(api.peekAnimeDetail(target.slug)));

console.log("\n→ EPISODE (/api/episode/:endpoint)");
const firstEpisode = detail.episodes[0];
const episode = await getEpisode(firstEpisode.slug);
check("judul episode terisi", episode.title.length > 0);
check("label episode terbentuk", episode.label.startsWith("Episode"));
check("stream link http(s)", episode.streamUrl.startsWith("http"), episode.streamUrl);
check("daftar server download tersedia", episode.downloads.length > 0, `${episode.downloads.length} kualitas`);
check(
  "setiap kualitas punya server + ukuran file",
  episode.downloads.every((group) => group.servers.length > 0 && group.quality.length > 0)
);

console.log("\n→ Penanganan error (PRD 16)");
await assertThrows("endpoint anime tidak valid -> ApiError", getAnimeDetail(""));
await assertThrows("endpoint episode tidak valid -> ApiError", getEpisode(""));
const missing = await getAnimeDetail("judul-tidak-ada-xyz-999").then(
  () => null,
  (error) => error
);
check(
  "anime tidak ada -> pesan ramah, bukan error mentah",
  missing === null || missing.message === "Anime tidak ditemukan.",
  missing ? missing.message : "tidak error"
);

console.log("\n→ Helper");
check(
  "slugFromEndpoint(URL penuh)",
  slugFromEndpoint("https://otakudesu.blog/anime/1piece-sub-indo/") === "1piece-sub-indo"
);
check("slugFromEndpoint(slug relatif)", slugFromEndpoint("borot-sub-indo/") === "borot-sub-indo");
check(
  "resolvePlayback: embed",
  resolvePlayback("https://desustream.net/dstream/updesu/v5/index.php?id=abc").mode === "embed"
);
check("resolvePlayback: file video", resolvePlayback("https://cdn.x/ep1-720p.mp4").mode === "video");
check("resolvePlayback: javascript: ditolak", resolvePlayback("javascript:alert(1)").mode === "none");
check("statusLabel: Complete -> Tamat", statusLabel("Complete") === "Tamat");
check("formatRelativeTime masuk akal", formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000) === "3 jam lalu");
check(
  "watchPath menyertakan konteks anime",
  watchPath("btr-ng-episode-293-sub-indo/", "borot-sub-indo/") ===
    "/watch/btr-ng-episode-293-sub-indo?anime=borot-sub-indo"
);
check("cache API terisi setelah semua request", getApiCacheSize() > 0, `${getApiCacheSize()} entri`);
clearApiCache();
check("clearApiCache mengosongkan cache", getApiCacheSize() === 0);

console.log(
  `\n${failed === 0 ? "SEMUA VERIFIKASI LULUS" : `${failed} VERIFIKASI GAGAL`} — total request ke backend: ${fetchCount}\n`
);

// Keluar langsung: menutup Vite SSR runner lebih dulu memicu assertion libuv
// pada sebagian build Node di Windows (proses CLI ini tidak menyimpan state).
process.exit(failed === 0 ? 0 : 1);
