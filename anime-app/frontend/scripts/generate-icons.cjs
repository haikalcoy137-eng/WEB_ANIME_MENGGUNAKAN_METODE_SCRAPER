/**
 * Generator ikon PWA tanpa dependensi eksternal.
 *
 * Menghasilkan:
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/icon-maskable-512.png
 *
 * Jalankan dengan: npm run icons
 * (skrip ini juga memverifikasi ulang hasil PNG yang ditulis)
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT_DIR = path.join(__dirname, "..", "public", "icons");
const SS = 4; // supersampling untuk anti-aliasing sederhana

const BG_TOP = [23, 29, 43];
const BG_BOTTOM = [10, 12, 17];
const ACCENT = [255, 63, 108];
const FOREGROUND = [10, 12, 17];

/* ---------------- PNG encoding ---------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0; // filter type 0
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1
    );
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------------- Canvas & bentuk dasar ---------------- */

function makeCanvas(size) {
  return { size, data: new Uint8ClampedArray(size * size * 4) };
}

function setPixel(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.size || y >= canvas.size) return;
  const index = (y * canvas.size + x) * 4;
  canvas.data[index] = color[0];
  canvas.data[index + 1] = color[1];
  canvas.data[index + 2] = color[2];
  canvas.data[index + 3] = 255;
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function insideRoundedRect(px, py, size, radius) {
  const cx = Math.min(Math.max(px, radius), size - radius);
  const cy = Math.min(Math.max(py, radius), size - radius);
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function fillBackground(canvas, { rounded, radiusRatio }) {
  const { size } = canvas;
  const radius = rounded ? size * radiusRatio : 0;

  for (let y = 0; y < size; y += 1) {
    const t = size > 1 ? y / (size - 1) : 0;
    const color = [
      lerp(BG_TOP[0], BG_BOTTOM[0], t),
      lerp(BG_TOP[1], BG_BOTTOM[1], t),
      lerp(BG_TOP[2], BG_BOTTOM[2], t),
    ];
    for (let x = 0; x < size; x += 1) {
      if (!insideRoundedRect(x + 0.5, y + 0.5, size, radius)) continue;
      setPixel(canvas, x, y, color);
    }
  }
}

function fillCircle(canvas, centerRatio, radiusRatio, color) {
  const { size } = canvas;
  const cx = size * centerRatio;
  const cy = size * centerRatio;
  const radius = size * radiusRatio;
  const min = Math.max(0, Math.floor(cx - radius - 1));
  const max = Math.min(size - 1, Math.ceil(cx + radius + 1));

  for (let y = min; y <= max; y += 1) {
    for (let x = min; x <= max; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= radius * radius) setPixel(canvas, x, y, color);
    }
  }
}

function fillTriangle(canvas, points, color) {
  const { size } = canvas;
  const [a, b, c] = points.map(([x, y]) => [x * size, y * size]);
  const sign = (p, q, r) =>
    (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]);

  const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]) - 1));
  const maxX = Math.min(size - 1, Math.ceil(Math.max(a[0], b[0], c[0]) + 1));
  const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]) - 1));
  const maxY = Math.min(size - 1, Math.ceil(Math.max(a[1], b[1], c[1]) + 1));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const p = [x + 0.5, y + 0.5];
      const d1 = sign(p, a, b);
      const d2 = sign(p, b, c);
      const d3 = sign(p, c, a);
      const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(hasNegative && hasPositive)) setPixel(canvas, x, y, color);
    }
  }
}

/** Rata-rata blok SSxSS dengan pembobotan alpha (anti-aliasing). */
function downsample(canvas, factor) {
  const size = canvas.size / factor;
  const out = makeCanvas(size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let alphaSum = 0;

      for (let sy = 0; sy < factor; sy += 1) {
        for (let sx = 0; sx < factor; sx += 1) {
          const index = ((y * factor + sy) * canvas.size + (x * factor + sx)) * 4;
          const alpha = canvas.data[index + 3] / 255;
          r += canvas.data[index] * alpha;
          g += canvas.data[index + 1] * alpha;
          b += canvas.data[index + 2] * alpha;
          alphaSum += alpha;
        }
      }

      const index = (y * size + x) * 4;
      const coverage = alphaSum / (factor * factor);

      if (alphaSum === 0) {
        out.data[index] = 0;
        out.data[index + 1] = 0;
        out.data[index + 2] = 0;
        out.data[index + 3] = 0;
      } else {
        out.data[index] = Math.round(r / alphaSum);
        out.data[index + 1] = Math.round(g / alphaSum);
        out.data[index + 2] = Math.round(b / alphaSum);
        out.data[index + 3] = Math.round(coverage * 255);
      }
    }
  }

  return out;
}

/* ---------------- Komposisi ikon ---------------- */

const PLAY_TRIANGLE = [
  [0.43, 0.365],
  [0.43, 0.635],
  [0.665, 0.5],
];

function shiftToCenter(points, scale = 1, dx = -0.012) {
  return points.map(([x, y]) => [
    0.5 + (x - 0.5) * scale + dx,
    0.5 + (y - 0.5) * scale,
  ]);
}

function buildIcon(size, { maskable = false } = {}) {
  const canvas = makeCanvas(size * SS);
  const scale = maskable ? 0.78 : 1;

  fillBackground(canvas, { rounded: !maskable, radiusRatio: 0.22 });
  fillCircle(canvas, 0.5, maskable ? 0.21 : 0.27, ACCENT);
  fillTriangle(canvas, shiftToCenter(PLAY_TRIANGLE, scale), FOREGROUND);

  return downsample(canvas, SS);
}

/* ---------------- Verifikasi hasil ---------------- */

function verifyPng(buffer, expectedSize) {
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("Signature PNG tidak valid");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let sawIhdr = false;
  let sawIdat = false;

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    const written = buffer.readUInt32BE(offset + 8 + length);
    const computed = crc32(Buffer.concat([Buffer.from(type, "ascii"), data]));

    if (written !== computed) throw new Error(`CRC chunk ${type} tidak valid`);

    if (type === "IHDR") {
      sawIhdr = true;
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6) {
        throw new Error("Format PNG harus RGBA 8-bit");
      }
    }
    if (type === "IDAT") sawIdat = true;

    offset += 12 + length;
  }

  if (!sawIhdr || !sawIdat) throw new Error("Chunk IHDR/IDAT tidak ditemukan");
  if (width !== expectedSize || height !== expectedSize) {
    throw new Error(`Ukuran ${width}x${height} tidak sesuai (harus ${expectedSize})`);
  }

  return { width, height, bytes: buffer.length };
}

/* ---------------- Main ---------------- */

const TARGETS = [
  { name: "icon-192.png", size: 192, maskable: false },
  { name: "icon-512.png", size: 512, maskable: false },
  { name: "icon-maskable-512.png", size: 512, maskable: true },
];

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  TARGETS.forEach((target) => {
    const canvas = buildIcon(target.size, { maskable: target.maskable });
    const png = encodePng(target.size, canvas.data);
    const info = verifyPng(png, target.size);
    fs.writeFileSync(path.join(OUT_DIR, target.name), png);
    console.log(
      `OK ${target.name} ${info.width}x${info.height} (${(info.bytes / 1024).toFixed(1)} KB)`
    );
  });

  console.log(`Ikon PWA selesai dibuat di ${OUT_DIR}`);
}

main();
