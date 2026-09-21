/**
 * Stream resolver & relay (Node core, tanpa dependensi) - port 4000.
 *
 * Latar belakang: server video Otakudesu (desustream) mengirim CSP
 * `frame-ancestors` sehingga halaman embed-nya tidak boleh disematkan di
 * aplikasi. Pengujian menunjukkan halaman embed itu hanya berisi satu tag
 * `<source src="...googlevideo.com/videoplayback?...">` (file MP4 langsung).
 *
 * Endpoint:
 *   GET /resolve?url=<halaman-embed-desustream>
 *     -> ambil halaman, ekstrak URL video langsung, kembalikan JSON.
 *        Hasil di-cache ~60 menit (URL googlevideo punya masa berlaku).
 *   GET /vstream?url=<URL googlevideo>
 *     -> relay byte video (mendukung Range/seek) ke <video> aplikasi.
 *        Diperlukan karena URL googlevideo terikat IP pengambil halaman.
 *   GET /health
 */

const http = require("http");

const PORT = Number(process.env.RESOLVER_PORT || 4000);
const DESUSTREAM_RE = /^([a-z0-9-]+\.)?desustream\.(me|net|com|info|org)$/i;
const GOOGLEVIDEO_RE = /(^|\.)googlevideo\.com$/i;
const ODCLOUD_RE = /(^|\.)odcloud\.net$/i;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const REFERER = "https://otakudesu.blog/";
const RESOLVE_TTL = 60 * 60 * 1000; // 1 jam

/** @type {Map<string, {direct:string,size:number|null,expires:number}>} */
const cache = new Map();

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function hostOf(raw) {
  try {
    return new URL(raw).host.toLowerCase();
  } catch {
    return "";
  }
}

async function handleResolve(res, embedUrl) {
  const host = hostOf(embedUrl);
  if (!DESUSTREAM_RE.test(host)) {
    return sendJson(res, 400, { ok: false, error: "Host embed tidak didukung." });
  }

  const cached = cache.get(embedUrl);
  if (cached && cached.expires > Date.now()) {
    return sendJson(res, 200, { ok: true, direct: cached.direct, size: cached.size, cached: true });
  }

  const page = await fetch(embedUrl, {
    headers: { "User-Agent": UA, Referer: REFERER },
    redirect: "follow",
  });
  if (!page.ok) {
    return sendJson(res, 502, { ok: false, error: `Halaman embed HTTP ${page.status}.` });
  }
  const html = await page.text();

  // Halaman embed "Lazy Load Video Player" menyimpan URL di variabel JS:
  //   const videoURL = "https://cdn.odcloud.net/anime/....mp4"
  // Pola cadangan: tag <source src="..."> atau URL mp4/m3u8 pertama di HTML.
  const patterns = [
    /videoURL\s*=\s*["']([^"']+)["']/i,
    /<source\s+src=["']([^"']+)["']/i,
    /https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i,
    /https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*/i,
  ];
  let direct = "";
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      direct = m[1].replace(/&amp;/g, "&");
      break;
    }
  }
  if (!direct) {
    return sendJson(res, 404, { ok: false, error: "URL video tidak ditemukan di halaman embed." });
  }

  let size = null;
  try {
    const head = await fetch(direct, { method: "HEAD", headers: { "User-Agent": UA } });
    if (head.ok) {
      const len = Number(head.headers.get("content-length"));
      if (Number.isFinite(len) && len > 0) size = len;
    }
  } catch {
    /* ukuran opsional */
  }

  cache.set(embedUrl, { direct, size, expires: Date.now() + RESOLVE_TTL });
  return sendJson(res, 200, { ok: true, direct, size, cached: false });
}

function handleRelay(clientRes, videoUrl, rangeHeader) {
  const host = hostOf(videoUrl);
  if (!GOOGLEVIDEO_RE.test(host) && !DESUSTREAM_RE.test(host) && !ODCLOUD_RE.test(host)) {
    return sendJson(clientRes, 400, { ok: false, error: "Host video tidak diizinkan." });
  }

  const headers = { "User-Agent": UA, Referer: REFERER };
  if (rangeHeader) headers.Range = rangeHeader;

  fetch(videoUrl, { headers, redirect: "follow" })
    .then((upstream) => {
      const pass = {};
      for (const key of ["content-type", "content-length", "content-range", "accept-ranges"]) {
        const value = upstream.headers.get(key);
        if (value) pass[key] = value;
      }
      pass["Access-Control-Allow-Origin"] = "*";
      clientRes.writeHead(upstream.status, pass);

      if (!upstream.body) return clientRes.end();
      const { Readable } = require("stream");
      const stream = Readable.fromWeb(upstream.body);
      stream.pipe(clientRes);
      stream.on("error", () => clientRes.destroy());
      clientRes.on("close", () => stream.destroy());
    })
    .catch(() => {
      if (!clientRes.headersSent) {
        sendJson(clientRes, 502, { ok: false, error: "Gagal mengambil video." });
      } else {
        clientRes.destroy();
      }
    });
}

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://localhost:${PORT}`);
  const target = parsed.searchParams.get("url") || "";

  if (parsed.pathname === "/health") {
    return sendJson(res, 200, { ok: true, uptime: process.uptime() });
  }
  if (parsed.pathname === "/resolve") {
    handleResolve(res, target).catch((error) =>
      sendJson(res, 500, { ok: false, error: String(error && error.message || error) })
    );
    return;
  }
  if (parsed.pathname === "/vstream") {
    handleRelay(res, target, req.headers.range);
    return;
  }
  sendJson(res, 404, { ok: false, error: "Endpoint tidak dikenal." });
});

server.listen(PORT, () => {
  console.log(`[resolver] siap di http://localhost:${PORT}`);
});
