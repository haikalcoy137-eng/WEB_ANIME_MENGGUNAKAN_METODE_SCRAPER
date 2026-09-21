/**
 * Helper murni (tanpa React) yang dipakai lintas komponen.
 */

/** Menggabungkan className dengan aman. */
export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

/**
 * Mengubah "endpoint" dari API menjadi slug yang aman dipakai di URL.
 *
 * Catatan penting: API otakudesu-api saat ini mengembalikan URL penuh
 * (mis. "https://otakudesu.blog/anime/one-piece-sub-indo/") ketika domain
 * sumber berbeda dengan BASE_URL di backend, dan kadang hanya slug relatif
 * (mis. "borot-sub-indo/"). Keduanya harus dinormalkan menjadi slug saja,
 * karena backend membentuk request sebagai `${BASE_URL}/anime/${endpoint}`
 * dan slug mengandung "/" akan merusak routing frontend.
 */
export function slugFromEndpoint(endpoint) {
  if (!endpoint || typeof endpoint !== "string") return "";
  let value = endpoint.trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    try {
      value = new URL(value).pathname;
    } catch {
      value = value.replace(/^https?:\/\/[^/]+/i, "");
    }
  }

  value = value.split("?")[0].split("#")[0];
  const segments = value.split("/").filter(Boolean);
  if (segments.length === 0) return "";

  const last = segments[segments.length - 1];
  try {
    return decodeURIComponent(last).trim();
  } catch {
    return last.trim();
  }
}

/** Alias pembacaan yang lebih eksplisit di layer service. */
export const normalizeEndpoint = slugFromEndpoint;

/** Bangun URL halaman detail anime. */
export function animePath(endpoint) {
  const slug = slugFromEndpoint(endpoint);
  return slug ? `/anime/${encodeURIComponent(slug)}` : "/";
}

/** Bangun URL halaman watch (episode) beserta konteks anime-nya. */
export function watchPath(episodeEndpoint, animeEndpoint) {
  const slug = slugFromEndpoint(episodeEndpoint);
  if (!slug) return "/";
  const animeSlug = slugFromEndpoint(animeEndpoint);
  const base = `/watch/${encodeURIComponent(slug)}`;
  return animeSlug ? `${base}?anime=${encodeURIComponent(animeSlug)}` : base;
}

/** Hapus spasi berlebih dari teks hasil scraping. */
export function cleanText(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

/** Ambil nilai pertama yang tidak kosong. */
export function firstText(...values) {
  for (const value of values) {
    const text = cleanText(value);
    if (text && text !== "?" && text !== "-") return text;
  }
  return "";
}

/** Angka episode pertama dari teks (PRD 11). */
export function extractEpisodeNumber(text) {
  const match = cleanText(text).match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return "";
  return match[1].replace(/[.,]0+$/, "");
}

/** Judul episode singkat: "... Episode 293 Subtitle Indonesia" -> "Episode 293". */
export function episodeShortTitle(title, index = 0) {
  const number = extractEpisodeNumber(title);
  if (number) return `Episode ${number}`;
  const text = cleanText(title);
  if (text) return text;
  return `Episode ${index + 1}`;
}

/** Ambil nama anime dari judul episode. */
export function animeTitleFromEpisode(title) {
  const text = cleanText(title);
  if (!text) return "";
  return cleanText(
    text
      .replace(/\s*Episode\s*\d+.*$/i, "")
      .replace(/\s*Subtitle Indonesia\s*$/i, "")
      .replace(/\s*Sub Indo\s*$/i, "")
  );
}

/** Hapus suffix "Subtitle Indonesia" pada judul anime. */
export function animeDisplayTitle(title) {
  return cleanText(
    cleanText(title)
      .replace(/\s*Subtitle Indonesia\s*$/i, "")
      .replace(/\s*Sub Indo\s*$/i, "")
  );
}

/** Angka aman dari nilai scraping. */
export function toNumber(value) {
  const number = Number.parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

/** Skor untuk badge; teks seperti "Fall 2025" tidak dianggap angka. */
export function scoreLabel(value) {
  const number = toNumber(value);
  if (number === null) return "";
  return number.toFixed(2).replace(/\.00$/, "");
}

/** Label status ramah bahasa Indonesia. */
export function statusLabel(status) {
  const text = cleanText(status);
  if (!text) return "";
  const key = text.toLowerCase();
  if (key === "ongoing") return "Ongoing";
  if (key === "complete" || key === "completed") return "Tamat";
  if (key === "drop" || key === "dropped") return "Dropped";
  if (key === "upcoming") return "Akan Datang";
  return text;
}

/** Nada warna badge status. */
export function statusTone(status) {
  const key = cleanText(status).toLowerCase();
  if (key === "ongoing") return "accent";
  if (key === "complete" || key === "completed") return "success";
  return "muted";
}

/** Pisahkan field "genre" (string berkoma) menjadi array. */
export function splitGenres(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);
  return cleanText(value)
    .split(",")
    .map((item) => cleanText(item))
    .filter(Boolean);
}

const VIDEO_FILE_RE = /\.(mp4|m4v|webm|ogv|ogg|mov|m3u8|mpd)(\?|#|$)/i;

/** Pastikan hanya http(s) yang boleh dipakai (data berasal dari scraping). */
export function safeUrl(value) {
  const text = cleanText(value);
  if (!text) return "";
  try {
    // Di browser, URL relatif diresolusi terhadap origin aplikasi.
    const base =
      typeof window !== "undefined" && window.location
        ? window.location.origin
        : undefined;
    const url = base ? new URL(text, base) : new URL(text);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

/**
 * Tentukan cara memutar sebuah sumber (PRD 12).
 * - "video" : file yang bisa diputar <video> HTML5 (mp4/m3u8/...)
 * - "embed" : URL embed/iframe (mis. desustream) -> diputar lewat <iframe>
 * - "none"  : tidak ada sumber
 *
 * `frameable` = false berarti host embed diketahui memblokir penyematan
 * dari situs lain (CSP frame-ancestors), sehingga <iframe> pasti ditolak
 * browser dan UI harus menawarkan "tonton di tab baru".
 */
export function resolvePlayback(url) {
  const safe = safeUrl(url);
  if (!safe) return { mode: "none", url: "", frameable: false };
  if (VIDEO_FILE_RE.test(safe)) return { mode: "video", url: safe, frameable: false };
  return { mode: "embed", url: safe, frameable: isEmbedFrameable(safe) };
}

/**
 * Host embed yang diketahui memblokir penyematan (diuji: desustream mengirim
 * CSP `frame-ancestors 'self' https://otakudesu.blog ...` sehingga iframe dari
 * aplikasi ini selalu "refused to connect", sedangkan host lain seperti
 * blogger.com/video.g tidak mengirim pembatasan dan bisa disematkan).
 */
const EMBED_BLOCKED_RE =
  /(^|\.)(desustream\.net|desustream\.com|desustream\.me|desustream\.info)$/i;

export function isEmbedFrameable(url) {
  try {
    return !EMBED_BLOCKED_RE.test(new URL(url).hostname);
  } catch {
    return true;
  }
}

/** Format waktu relatif untuk riwayat ("Baru saja", "3 jam lalu"). */
export function formatRelativeTime(timestamp) {
  const time = Number(timestamp);
  if (!Number.isFinite(time) || time <= 0) return "";
  const diff = Date.now() - time;
  if (diff < 60 * 1000) return "Baru saja";
  const minutes = Math.floor(diff / (60 * 1000));
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(months / 12)} tahun lalu`;
}

/** Tanggal lengkap ringkas: "21 Sep 2026 19.20". */
export function formatDateTime(timestamp) {
  const time = Number(timestamp);
  if (!Number.isFinite(time) || time <= 0) return "";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(time));
  } catch {
    return "";
  }
}

/** Inisial judul untuk poster fallback. */
export function initials(title) {
  const text = cleanText(title);
  if (!text) return "?";
  return text
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
