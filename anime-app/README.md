# AniKita — Aplikasi Anime Mobile (Web)

Implementasi dari `PRD — Aplikasi Anime Mobile` (lihat `../PRD.MD`).

Web app anime dengan pengalaman seperti aplikasi mobile: mobile-first, dark
theme, bottom navigation, katalog anime, pencarian, detail, watch episode,
favorit, dan riwayat tontonan.

Sumber data: API tidak resmi **yurtzy/otakudesu-api**
(`GET /api/home`, `/api/search/:query`, `/api/anime/:endpoint`, `/api/episode/:endpoint`).

> Frontend **tidak pernah** melakukan scraping langsung dari browser. Semua data
> melewati service backend Express (PRD bagian 17).

---

## 1. Struktur folder (PRD 17 & 21)

```
anime-app/
├── README.md                 # dokumen ini
├── run-api.cmd               # jalankan backend (Windows)
├── run-web.cmd               # jalankan frontend (Windows)
├── run-tunnel.cmd            # tunnel publik ke internet (cloudflared) → tunnel.log
├── tools/
│   └── cloudflared.exe       # binary tunnel (diunduh, di-gitignore)
├── api/
│   └── otakudesu-api/        # backend hasil clone (tidak diubah)
│       ├── index.js          # Express + Axios + Cheerio (port 3000)
│       └── package.json
│
└── frontend/                 # React + Vite
    ├── index.html            # meta mobile-web-app + splash screen
    ├── vite.config.js        # proxy /api -> backend saat development
    ├── .env.example
    ├── scripts/
    │   ├── generate-icons.cjs  # generator ikon PWA (tanpa dependensi)
    │   └── verify-api.mjs      # verifikasi integrasi 4 endpoint
    ├── public/
    │   ├── manifest.webmanifest
    │   ├── sw.js               # service worker (PWA)
    │   ├── favicon.svg
    │   └── icons/              # icon-192.png, icon-512.png, icon-maskable-512.png
    └── src/
        ├── components/  (AnimeCard, AnimeGrid, BottomNav+SideNav, Header,
        │                 EpisodeList, SearchBar, Skeleton, Poster, Player,
        │                 ServerSelector, ContinueWatching, FeaturedHero,
        │                 FavoriteButton, ErrorState, EmptyState, Toast,
        │                 SectionHeader, ProfileSheet, InstallBanner, Icons)
        ├── pages/       (Home, Search, AnimeDetail, Watch, Library, History, NotFound)
        ├── services/    api.js        # transport + cache + normalisasi data
        ├── hooks/       useLocalStorage, useDebounce, useApiQuery,
        │                useInstallPrompt, useDocumentTitle
        ├── context/     UserDataContext (favorit & riwayat), ToastContext, UiContext
        ├── utils/       helpers.js, constants.js
        ├── styles/      index.css (import tokens/base/components/pages)
        ├── App.jsx
        └── main.jsx
```

---

## 2. Cara menjalankan

Butuh **Node.js 20+** (diuji pada Node 24) dan koneksi internet (scraping).

### Backend (terminal 1)

```bat
cd api\otakudesu-api
npm install
npm run dev
```

Backend berjalan di `http://localhost:3000`.

Cek cepat: buka `http://localhost:3000/api/home` — harus mengembalikan JSON
`{ "status": true, "ongoing_anime": [...], "complete_anime": [...] }`.

### Frontend (terminal 2)

```bat
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`.

Request `/api/*` dari frontend diproxy Vite ke `http://localhost:3000`
(`vite.config.js`), sehingga development bebas masalah CORS.

### Cara cepat di Windows

Dari folder `anime-app`, jalankan `run-api.cmd` lalu `run-web.cmd` (masing-masing
membuka jendela terminal sendiri).

### Akses dari perangkat lain

**Satu Wi-Fi:** buka `http://<IP-komputer>:5173` (mis. `http://192.168.1.18:5173`).
Dev server sudah berjalan dengan `host: true` sehingga menerima koneksi LAN.

**Dari internet (tunnel publik, tanpa akun):**

```bat
run-tunnel.cmd
```

Script memakai `tools/cloudflared.exe` untuk membuat *quick tunnel* ke
`http://localhost:5173`. URL publik (misal
`https://xxx-yyy.trycloudflare.com`) muncul di `anime-app/tunnel.log` dan tetap
valid selama tunnel berjalan. Domain tunnel sudah diizinkan di
`vite.config.js` (`server.allowedHosts`), dan API tetap lewat proxy `/api`
sehingga tidak ada masalah CORS. URL tunnel berubah setiap kali dijalankan ulang.

### Build produksi

```bat
cd frontend
npm run build      # hasil di frontend/dist
npm run preview    # uji hasil build (tetap memakai proxy /api -> localhost:3000)
```

Untuk deployment, arahkan `VITE_API_BASE_URL` ke URL backend publik, misalnya:

```env
VITE_API_BASE_URL=https://otakudesu-api-jade.vercel.app/api
```

> Catatan: instance backend yang di-hosting di Vercel saat pengujian
> mengembalikan HTTP 500 (IP datacenter diblokir situs sumber). Untuk hasil
> paling stabil, jalankan backend sendiri (lokal/VPS).

---

## 3. Konfigurasi frontend

Salin `frontend/.env.example` menjadi `.env.local` bila perlu mengubah nilai:

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | Base URL API. `/api` = lewat proxy dev server. Isi absolut (mis. `https://host/api`) untuk produksi. |
| `VITE_DEV_API_TARGET` | `http://localhost:3000` | Target proxy dev/preview server ke backend Express. |

---

## 4. Arsitektur & alur data (PRD 17, 22)

```
Komponen UI  ->  hooks/useApiQuery  ->  services/api.js  ->  fetch /api/*  ->  Express (otakudesu-api)  ->  Otakudesu
                                         (cache + dedupe + normalisasi)
```

- Semua komunikasi API terpusat di `src/services/api.js`
  (`getHome`, `searchAnime`, `getAnimeDetail`, `getEpisode`, + `peekAnimeDetail`,
  `clearApiCache`, `getApiCacheSize`).
- Komponen tidak pernah memanggil `fetch` langsung.
- `services/api.js` juga menormalkan bentuk data mentah API menjadi bentuk yang
  siap dirender, sehingga komponen tidak perlu tahu format asli backend.

### Catatan teknis penting (temuan saat integrasi)

1. **Field `endpoint` bisa berupa URL penuh.** Karena domain sumber berubah
   (`otakudesu.best` -> `otakudesu.blog`), backend mengembalikan
   `endpoint: "https://otakudesu.blog/anime/one-piece-sub-indo/"` alih-alih slug.
   `helpers.slugFromEndpoint()` menormalkannya menjadi slug
   (`one-piece-sub-indo`) untuk dipakai di URL aplikasi dan pemanggilan API,
   karena backend menyusun request sebagai `${BASE_URL}/anime/${endpoint}`.
2. **Slug tanpa trailing slash paling aman.** Pengujian menunjukkan
   `/api/episode/<slug>/` dan `/api/episode/<slug>` berhasil, sedangkan bentuk
   ter-encode (`%2F`) mengembalikan data kosong. Karena itu URL aplikasi selalu
   memakai slug bersih, dan backend menangani redirect sendiri.
3. **Frontend memakai slug sebagai identitas** pada URL, favorit, dan riwayat —
   bukan URL penuh — agar navigasi, refresh, dan deep-link tetap stabil.
4. **`stream_link` adalah URL embed** (mis. `desustream`), bukan file video.
   `Player` memilih mode otomatis: `<video>` untuk file langsung
   (`.mp4/.m3u8/...`), `<iframe>` untuk embed, dan selalu menyediakan tombol
   "Buka di tab baru" bila embed tidak bisa dimuat.
5. **Server pilihan** diambil dari data API: satu server streaming utama
   (`stream_link`) plus server alternatif/download per resolusi
   (`downloads[].links[]`). Server download umumnya berupa halaman perantara,
   jadi dibuka di tab baru sesuai anjuran PRD 12.
6. **Poster tidak hotlink-protected** (diuji: HTTP 200 dengan/tanpa Referer),
   sehingga `<img>` langsung dipakai tanpa proxy gambar.
7. **Domain sumber berubah-ubah.** Bila `BASE_URL` di `api/otakudesu-api/index.js`
   sudah tidak relevan, perbarui konstanta tersebut di backend (frontend tidak
   perlu diubah).
8. **Sebagian server memblokir pemutar semat (iframe).** Diuji: `desustream`
   mengirim CSP `frame-ancestors 'self' https://otakudesu.blog ...` sehingga
   `<iframe>` dari aplikasi ini selalu ditolak browser (video "tidak bisa
   diputar"), sedangkan embed `blogger.com/video.g` bisa disematkan. Karena itu
   `resolvePlayback()` menandai host yang diketahui memblokir, dan `Player`
   menampilkan panel "Tonton di tab baru" (plus opsi "Coba sematkan di sini")
   alih-alih iframe kosong. Kalau Otakudesu menambah server embed lain yang
   juga memblokir, tambahkan hostnya ke `EMBED_BLOCKED_RE` di `helpers.js`.

### Caching (PRD 19)

Cache dua lapis di `services/api.js`: memori (per sesi) + `sessionStorage`
(bertahan saat refresh, hilang saat tab ditutup).

| Request | TTL |
| --- | --- |
| Home (`/api/home`) | 10 menit |
| Pencarian (`/api/search/:query`) | 5 menit |
| Detail anime (`/api/anime/:endpoint`) | 20 menit |
| Episode (`/api/episode/:endpoint`) | 5 menit |

Tambahan:
- **Dedupe request** — request dengan key sama yang sedang berjalan memakai
  promise yang sama (mencegah request ganda saat Strict Mode/navigasi cepat).
- Maksimum 80 entri cache; entri tertua dibuang lebih dulu.
- Tombol **Coba Lagi** memaksa ambil data terbaru (`force`), dan menu
  **Profil → Bersihkan cache API** mengosongkan seluruh cache.
- Service worker menyimpan respons `/api/*` maksimal 5 menit sebagai fallback
  offline (network-first).

---

## 5. Pemetaan PRD -> implementasi

| PRD | Implementasi |
| --- | --- |
| 5 Layout utama | `App.jsx` (app-shell) + `styles/components.css`, bottom nav tetap terlihat, konten max-width 1280px di desktop |
| 6 Navigasi | `components/BottomNav.jsx` (Home, Search, Library, History) + `SideNav` untuk desktop, safe-area iOS |
| 7 Halaman Home | `pages/Home.jsx`: Header, Lanjut Nonton, Featured, Ongoing, Episode Terbaru, Selesai/Tamat |
| 8 Anime card | `components/AnimeCard.jsx` + `AnimeGrid.jsx` (rasio poster 2:3, hover desktop, tap animation, 2/3-4/5-6 kolom) |
| 9 Search | `pages/Search.jsx`: debounce 450 ms, min 2 karakter, loading/empty/error state, pencarian terakhir, rekomendasi |
| 10 Anime detail | `pages/AnimeDetail.jsx`: poster + backdrop blur, judul & judul Jepang, skor, status, genre, sinopsis (expand), info lengkap, tombol Mulai Nonton / Lanjut Episode, favorit, bagikan |
| 11 Episode list | `components/EpisodeList.jsx`: urut terbaru, cari episode, toggle urutan, muat bertahap, chip nomor & baris daftar |
| 12 Halaman watch | `pages/Watch.jsx` + `Player.jsx` + `ServerSelector.jsx`: player adaptif, pilihan server, info episode, tombol sebelumnya/berikutnya, daftar episode |
| 13 Riwayat | `context/UserDataContext.jsx` + `pages/History.jsx` + `components/ContinueWatching.jsx` (localStorage) |
| 14 Favorite / Library | `FavoriteButton.jsx` + `pages/Library.jsx` (tab Favorit & Riwayat) |
| 15 Loading state | `components/Skeleton.jsx` (Home, Search, Detail, Watch/Episode) |
| 16 Error handling | `components/ErrorState.jsx` + pesan ramah di `utils/constants.js` (`Anime tidak ditemukan.`, `Episode tidak dapat dimuat.`, tombol **Coba Lagi**) |
| 17-18 Backend & endpoint | `api/otakudesu-api` (repo sumber), dipanggil lewat `services/api.js` |
| 19 Caching | Lihat bagian 4 |
| 20-21 Teknologi & struktur | React + Vite + CSS (design tokens), struktur mengikuti PRD dengan tambahan `context/`, `services/adapters` menyatu di `api.js` |
| 22 API service | `src/services/api.js` |
| 23 Responsive | Berjalan di `styles/components.css` & `styles/pages.css` (≤640, 641-1024, >1024, ≥1440) |
| 24 Tema visual | `styles/tokens.css` (dark default, satu accent `#ff3f6c`, poster jadi elemen utama) |
| 25 Animasi | 150-300 ms (`--dur-fast/--dur/--dur-slow`) + `prefers-reduced-motion` |
| 26 Performance | lazy loading gambar + `decoding=async`, debounce, cache, dedupe, memo/useCallback pada render mahal, episode dimuat bertahap |
| 27 PWA | `public/manifest.webmanifest`, `public/sw.js`, ikon PNG 192/512/maskable, splash screen di `index.html`, banner "Pasang" + menu profil |
| 28 Fitur tidak dibuat | Tidak ada login, database, komentar, rating user, social, notifikasi, langganan, pembayaran (lihat bagian 8) |

### Routing

| URL | Halaman |
| --- | --- |
| `/` | Home |
| `/search?q=` | Search |
| `/anime/:slug` | Detail anime (contoh: `/anime/borot-sub-indo`) |
| `/watch/:episodeSlug?anime=<slug anime>` | Watch episode |
| `/library?tab=favorit\|riwayat` | Library |
| `/history` | Riwayat |
| lainnya | 404 |

### Struktur data localStorage (PRD 13, 14)

```jsonc
// anikita:favorites
[{ "endpoint": "borot-sub-indo", "title": "Boruto: Naruto Next Generations",
   "poster": "https://.../Boruto-Sub-Indo.jpg", "timestamp": 1760000000000 }]

// anikita:history  (PRD 13 + field tambahan untuk UI)
[{ "anime": "Boruto: Naruto Next Generations", "episode": "293",
   "endpoint": "btr-ng-episode-293-sub-indo", "timestamp": 1760000000000,
   "animeEndpoint": "borot-sub-indo", "poster": "https://...jpg",
   "episodeTitle": "Boruto: ... Episode 293 Subtitle Indonesia",
   "episodeLabel": "Episode 293" }]

// anikita:recent-searches, anikita:install-banner-dismissed, anikita:api-cache
```

Batas penyimpanan: 200 favorit, 60 riwayat, 8 pencarian terakhir.

---

## 6. Skrip npm (frontend)

| Skrip | Fungsi |
| --- | --- |
| `npm run dev` | Development server + proxy `/api` |
| `npm run build` | Build produksi ke `dist/` |
| `npm run preview` | Uji hasil build |
| `npm run icons` | Generate ulang ikon PWA (tanpa dependensi) |
| `npm run verify:api` | Verifikasi integrasi 4 endpoint + cache/dedupe (backend harus jalan) |

---

## 7. Acceptance criteria (PRD 30)

Diuji dengan `npm run verify:api` (41 pemeriksaan) + build produksi + dev server.

- [x] Home dapat mengambil data dari API (`GET /api/home`)
- [x] Ongoing anime tampil
- [x] Completed anime tampil
- [x] Search berfungsi (debounce, hasil, empty state)
- [x] Anime detail berfungsi
- [x] Episode list tampil (cari/urutkan/muat bertahap)
- [x] Episode detail dapat diambil (`GET /api/episode/:endpoint`)
- [x] Server yang tersedia dapat ditampilkan (server utama + server download per resolusi)
- [x] User dapat membuka sumber video yang tersedia (iframe embed / tab baru adaptif)
- [x] Favorite berfungsi (localStorage)
- [x] History berfungsi (localStorage)
- [x] Continue Watching berfungsi
- [x] Loading state tersedia (skeleton di Home, Search, Detail, Watch)
- [x] Error state tersedia (pesan ramah + tombol **Coba Lagi**)
- [x] UI responsive (2 kolom mobile, 3 tablet, 5-6 desktop)
- [x] Tampilan mobile menjadi prioritas (bottom nav, tombol besar, safe-area)
- [x] Bottom navigation berfungsi (dan berganti menjadi sidebar di desktop)
- [x] Tidak ada request API berulang tanpa alasan (cache TTL + dedupe; verifikasi mencatat 7 request untuk seluruh skenario uji)

### Definition of Done (PRD 34)

Buka aplikasi → lihat anime → cari anime → buka detail → pilih episode →
putar/buka server → lanjutkan episode → simpan favorit: semuanya tersedia dan
terasa seperti aplikasi mobile, bukan halaman website yang diperkecil.

---

## 8. Sengaja belum dibuat (PRD 28)

Login, database user, komentar, rating user, fitur sosial, notifikasi server,
langganan, dan pembayaran. Versi ini fokus pada MVP (Home, Search, Detail,
Episode, Watch, Favorite, History) dengan penyimpanan lokal.

---

## 9. Catatan legal & etika (PRD 33)

- API `yurtzy/otakudesu-api` adalah proyek **tidak resmi** berbasis scraping
  untuk tujuan edukasi.
- Aplikasi ini **tidak memiliki klaim hak** atas konten anime yang ditampilkan;
  seluruh hak cipta milik pemiliknya masing-masing.
- Caching, dedupe request, dan pembatasan jumlah request diterapkan agar tidak
  membebani server sumber. Jangan menjalankan scraper secara agresif
  (bulk/looping) terhadap sumber data.
- Halaman/panel "Tentang" di dalam aplikasi juga menampilkan catatan ini.

