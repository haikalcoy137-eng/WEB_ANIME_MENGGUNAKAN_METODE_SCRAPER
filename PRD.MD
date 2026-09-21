PRD — Aplikasi Anime Mobile

1. Gambaran Proyek

Membuat aplikasi web anime dengan tampilan dan pengalaman seperti aplikasi mobile.

Aplikasi digunakan untuk:

- Menjelajahi anime terbaru
- Melihat anime ongoing
- Melihat anime yang sudah tamat
- Mencari anime
- Melihat informasi detail anime
- Melihat daftar episode
- Membuka halaman menonton episode
- Memilih server yang tersedia
- Menyimpan anime ke daftar favorit
- Melanjutkan anime yang terakhir ditonton

Sumber data utama menggunakan:

yurtzy/otakudesu-api

Repository:
https://github.com/yurtzy/otakudesu-api

API tersebut menyediakan endpoint:

- "/api/home"
- "/api/search/:query"
- "/api/anime/:endpoint"
- "/api/episode/:endpoint"

API menggunakan scraping terhadap Otakudesu dan bersifat tidak resmi. Gunakan secara wajar dan jangan membebani sumber dengan request berlebihan.

---

2. Tujuan

Membuat aplikasi anime yang:

1. Nyaman digunakan melalui HP.
2. Memiliki UI modern seperti aplikasi streaming.
3. Navigasinya sederhana.
4. Memiliki pencarian anime yang cepat.
5. Memiliki halaman detail anime yang jelas.
6. Memudahkan pengguna berpindah episode.
7. Memiliki riwayat tontonan.
8. Memiliki daftar favorit.
9. Tetap nyaman ketika dibuka melalui desktop.

---

3. Target Platform

Prioritas utama:

- Android melalui browser
- Mobile Web
- Tablet

Platform tambahan:

- Desktop browser

Desain harus menggunakan pendekatan mobile-first.

---

4. Konsep UI

Aplikasi tidak dibuat seperti website anime tradisional.

Gunakan gaya:

Mobile Streaming App

Referensi pengalaman pengguna:

- Netflix
- Crunchyroll
- aplikasi streaming modern
- aplikasi katalog anime

Namun jangan menyalin desain atau branding aplikasi lain secara langsung.

---

5. Layout Utama

Ukuran desain utama:

Mobile
390 × 844

Layout harus responsive.

Pada mobile:

┌──────────────────────────┐
│ Logo          🔍  👤     │
├──────────────────────────┤
│                          │
│      Featured Anime      │
│                          │
│      [Poster/Banner]     │
│                          │
├──────────────────────────┤
│ Ongoing                  │
│                          │
│ [ ] [ ] [ ] [ ]          │
│ [ ] [ ] [ ] [ ]          │
│                          │
├──────────────────────────┤
│ Latest Episode           │
│                          │
│ [poster] Anime           │
│          Episode 12      │
│                          │
├──────────────────────────┤
│ Home Search Library      │
└──────────────────────────┘

---

6. Navigasi Mobile

Gunakan bottom navigation.

Menu:

Home
Search
Library
History

Contoh:

┌──────────────────────────┐
│                          │
│       CONTENT            │
│                          │
│                          │
├──────────────────────────┤
│  🏠      🔍      ❤️      🕘 │
│ Home    Search  Library History
└──────────────────────────┘

Bottom navigation harus selalu mudah dijangkau menggunakan satu tangan.

---

7. Halaman Home

Home menjadi halaman pertama ketika aplikasi dibuka.

Bagian

Header

Berisi:

- Logo aplikasi
- Search button
- Profile/settings button

Featured Anime

Menampilkan anime pilihan dari data yang tersedia.

Card dapat berisi:

- Poster
- Judul
- Status
- Episode terbaru

Ongoing Anime

Mengambil data:

GET /api/home

Kemudian menggunakan:

ongoing_anime

Data card:

Poster
Judul
Episode terbaru
Hari update

Completed Anime

Menggunakan:

complete_anime

Data card:

Poster
Judul
Score

---

8. Anime Card

Setiap anime ditampilkan dalam bentuk card.

Contoh:

┌──────────────┐
│              │
│    POSTER    │
│              │
├──────────────┤
│ One Piece    │
│ Ep 1142      │
│ Ongoing      │
└──────────────┘

Pada mobile gunakan grid:

2 kolom

Pada layar yang lebih besar:

3–6 kolom

Card harus memiliki:

- rounded corners
- image ratio konsisten
- judul maksimal beberapa baris
- hover effect pada desktop
- tap animation pada mobile

---

9. Search

Pengguna dapat mencari anime berdasarkan judul.

API:

GET /api/search/:query

Contoh:

/api/search/naruto

Search page:

┌──────────────────────────┐
│ ← Search anime...        │
├──────────────────────────┤
│                          │
│ Naruto                   │
│                          │
│ [poster] Naruto          │
│          Action          │
│          Ongoing         │
│                          │
│ [poster] Naruto Shippuden│
│          Action          │
│          Complete        │
└──────────────────────────┘

Search harus memiliki:

- loading state
- empty state
- error state
- hasil pencarian
- debounce agar tidak melakukan request setiap karakter

---

10. Anime Detail

Ketika pengguna memilih anime:

GET /api/anime/:endpoint

Halaman detail menampilkan:

- Poster
- Judul
- Judul Jepang
- Score
- Sinopsis
- Genre
- Status
- Episode list

Contoh:

┌──────────────────────────┐
│ ←                       ⋮│
│                          │
│        POSTER            │
│                          │
├──────────────────────────┤
│ One Piece                │
│ ⭐ 8.7                   │
│                          │
│ Ongoing                  │
│ Action • Adventure       │
│                          │
│ [▶ Mulai Nonton]         │
│ [♡ Favorit]              │
│                          │
│ Sinopsis                 │
│ Lorem ipsum...           │
│                          │
│ Episode                  │
│                          │
│ [1142] [1141] [1140]     │
└──────────────────────────┘

---

11. Episode List

Episode diambil dari:

anime_detail.episode_list

Setiap episode memiliki:

- Judul
- Endpoint
- Tanggal

Episode terbaru berada di posisi yang mudah ditemukan.

Tambahkan:

- tombol episode berikutnya
- tombol episode sebelumnya
- pencarian episode jika jumlah episode banyak

---

12. Halaman Watch

Ketika pengguna memilih episode:

GET /api/episode/:endpoint

Halaman watch memiliki:

┌──────────────────────────┐
│ ← One Piece              │
├──────────────────────────┤
│                          │
│        VIDEO PLAYER      │
│                          │
│          ▶               │
│                          │
├──────────────────────────┤
│ Episode 1142             │
│                          │
│ Server                   │
│ [Server 1] [Server 2]    │
│                          │
│ [← Previous] [Next →]    │
├──────────────────────────┤
│ Episode List             │
│                          │
│ 1142                     │
│ 1141                     │
│ 1140                     │
└──────────────────────────┘

Jika sumber menyediakan beberapa server, tampilkan sebagai tombol pilihan.

Jangan mengasumsikan semua "stream_link" pasti kompatibel dengan HTML5 video.

Frontend harus mampu menangani:

video URL
iframe/embed
external player
server tidak tersedia

Jika sebuah server tidak dapat diputar langsung, tampilkan opsi membuka sumber tersebut sesuai data API.

---

13. Riwayat

Simpan anime/episode yang terakhir ditonton.

Untuk versi awal gunakan:

localStorage

Data:

{
  "anime": "One Piece",
  "episode": "1142",
  "endpoint": "...",
  "timestamp": 123456789
}

History menampilkan:

Continue Watching

Contoh:

┌──────────────────────────┐
│ Continue Watching        │
│                          │
│ [poster] One Piece       │
│          Episode 1142    │
│          Continue →      │
└──────────────────────────┘

---

14. Favorite / Library

Pengguna dapat menambahkan anime ke favorit.

Versi awal tidak membutuhkan akun.

Gunakan:

localStorage

Data favorit:

anime endpoint
judul
poster
timestamp

Library memiliki:

Favorite
History

---

15. Loading State

Jangan menampilkan halaman kosong ketika API sedang mengambil data.

Gunakan skeleton:

┌──────────────┐
│ ████████████ │
│ ████████████ │
│ ████████████ │
└──────────────┘

Skeleton digunakan pada:

- Home
- Search
- Detail
- Episode

---

16. Error Handling

Jika API gagal:

Tidak dapat mengambil data anime.

Coba lagi.

Tombol:

[ Coba Lagi ]

Jika anime tidak ditemukan:

Anime tidak ditemukan.

Jika episode gagal:

Episode tidak dapat dimuat.

Jangan menampilkan error mentah dari backend kepada pengguna.

---

17. Backend / API

Gunakan repository:

https://github.com/yurtzy/otakudesu-api

Backend tersebut dijalankan sebagai service terpisah.

Struktur:

anime-app/
│
├── frontend/
│
└── api/
    └── otakudesu-api/

Frontend berkomunikasi dengan backend:

Frontend
   ↓
API Backend
   ↓
Otakudesu API/Scraper
   ↓
Otakudesu

Jangan melakukan scraping langsung dari browser.

---

18. Endpoint Backend

Gunakan endpoint dari repository:

Home

GET /api/home

Search

GET /api/search/:query

Anime Detail

GET /api/anime/:endpoint

Episode

GET /api/episode/:endpoint

Endpoint tersebut memang merupakan fitur yang didokumentasikan repository.

---

19. Caching

Karena backend melakukan scraping, frontend tidak boleh melakukan request berlebihan.

Implementasikan caching sederhana.

Contoh:

Home cache: 5–15 menit
Search cache: 5 menit
Anime detail: 15–30 menit
Episode detail: beberapa menit

Tujuannya:

- mempercepat aplikasi
- mengurangi request
- mengurangi beban sumber
- mengurangi kemungkinan rate limit

---

20. Teknologi

Frontend

Rekomendasi:

React
Vite
CSS / Tailwind CSS

Alternatif:

Next.js

Untuk proyek sederhana gunakan:

React + Vite

Backend

Gunakan repository:

Node.js
Express
Axios
Cheerio

Sesuai stack repository sumber.

Storage

Versi pertama:

localStorage

Belum membutuhkan database.

---

21. Struktur Folder Frontend

Target:

frontend/
│
├── src/
│   ├── components/
│   │   ├── AnimeCard.jsx
│   │   ├── AnimeGrid.jsx
│   │   ├── BottomNav.jsx
│   │   ├── Header.jsx
│   │   ├── EpisodeList.jsx
│   │   ├── SearchBar.jsx
│   │   └── Skeleton.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Search.jsx
│   │   ├── AnimeDetail.jsx
│   │   ├── Watch.jsx
│   │   ├── Library.jsx
│   │   └── History.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── hooks/
│   │   └── useLocalStorage.js
│   │
│   ├── utils/
│   │   └── helpers.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json

---

22. API Service

Semua komunikasi API harus dipusatkan pada:

src/services/api.js

Contoh fungsi:

getHome()
searchAnime(query)
getAnimeDetail(endpoint)
getEpisode(endpoint)

Komponen UI tidak boleh melakukan request API secara langsung.

---

23. Responsive Design

Mobile

≤ 640px

- 2 kolom anime
- bottom navigation
- header sederhana
- player full width
- tombol besar
- touch-friendly

Tablet

641px – 1024px

- 3–4 kolom
- bottom navigation tetap tersedia

Desktop

> 1024px

- 5–6 kolom
- maksimal width content
- navigation dapat berubah menjadi sidebar/top navigation
- player lebih besar

---

24. Tema Visual

Gunakan dark theme sebagai default.

Karakter desain:

- dark background
- card sedikit lebih terang
- rounded corners
- typography sederhana
- poster menjadi elemen visual utama
- accent color digunakan untuk tombol/action penting

Hindari:

- terlalu banyak gradient
- terlalu banyak warna
- card dengan border berlebihan
- animasi yang mengganggu

---

25. Animasi

Gunakan animasi ringan:

- card hover
- button press
- page transition
- skeleton shimmer
- bottom navigation transition

Durasi:

150–300ms

Jangan menggunakan animasi berat pada setiap elemen.

---

26. Performance

Target:

- gambar menggunakan lazy loading
- API request tidak berulang
- debounce search
- caching response
- komponen tidak melakukan unnecessary re-render
- gunakan pagination/limit jika sumber menyediakan data besar

---

27. PWA

Jika memungkinkan, aplikasi dibuat sebagai PWA.

Fitur:

- install ke home screen
- icon aplikasi
- splash/loading
- responsive mobile
- standalone display

Tujuannya agar ketika dibuka dari HP terasa lebih seperti aplikasi daripada website.

---

28. Fitur yang Tidak Dibuat pada Versi Pertama

Jangan langsung membuat:

- sistem login
- database user
- komentar
- rating user
- social features
- notification server
- subscription
- pembayaran

Fokus MVP pada:

Home
Search
Detail
Episode
Watch
Favorite
History

---

29. MVP Flow

Flow utama:

OPEN APP
   ↓
HOME
   ↓
Pilih Anime
   ↓
ANIME DETAIL
   ↓
Pilih Episode
   ↓
WATCH
   ↓
Pilih Server
   ↓
Tonton

Flow pencarian:

HOME
 ↓
SEARCH
 ↓
Masukkan judul
 ↓
SEARCH RESULT
 ↓
ANIME DETAIL

---

30. Acceptance Criteria

Project dianggap berhasil apabila:

- [ ] Home dapat mengambil data dari API.
- [ ] Ongoing anime tampil.
- [ ] Completed anime tampil.
- [ ] Search berfungsi.
- [ ] Anime detail berfungsi.
- [ ] Episode list tampil.
- [ ] Episode detail dapat diambil.
- [ ] Server yang tersedia dapat ditampilkan.
- [ ] User dapat membuka sumber video yang tersedia.
- [ ] Favorite berfungsi.
- [ ] History berfungsi.
- [ ] Continue Watching berfungsi.
- [ ] Loading state tersedia.
- [ ] Error state tersedia.
- [ ] UI responsive.
- [ ] Tampilan mobile menjadi prioritas.
- [ ] Bottom navigation berfungsi.
- [ ] Tidak ada request API yang dilakukan berulang-ulang tanpa alasan.

---

31. Tahapan Pengerjaan

Milestone 1 — Setup

- Setup React + Vite
- Setup repository
- Setup routing
- Hubungkan API
- Pastikan "/api/home" berhasil

Milestone 2 — Home

- Header
- Featured
- Ongoing
- Completed
- Anime card
- Skeleton

Milestone 3 — Search

- Search UI
- Debounce
- Search API
- Result card
- Empty state

Milestone 4 — Detail

- Detail page
- Poster
- Synopsis
- Genre
- Score
- Episode list

Milestone 5 — Watch

- Episode page
- Player
- Server selector
- Previous/Next episode

Milestone 6 — User Features

- Favorite
- History
- Continue Watching
- localStorage

Milestone 7 — Mobile UI

- Bottom navigation
- Touch interaction
- Responsive layout
- PWA

Milestone 8 — Optimization

- Caching
- Lazy loading
- Error handling
- Performance optimization
- Final responsive testing

---

32. Prinsip Pengembangan

Prioritas pengembangan:

FUNCTIONAL
    ↓
RESPONSIVE
    ↓
UI/UX
    ↓
PERFORMANCE
    ↓
POLISH

Jangan menghabiskan waktu mempercantik UI sebelum fungsi API utama berjalan.

Setiap fitur harus dibuat dan dites sebelum lanjut ke fitur berikutnya.

---

33. Catatan Legal & Teknis

Repository "yurtzy/otakudesu-api" menyatakan bahwa proyek tersebut merupakan API tidak resmi yang melakukan scraping terhadap Otakudesu dan dibuat untuk tujuan edukasi. Repository juga menyarankan penggunaan secara bijak dan tidak membanjiri server sumber.

Aplikasi harus menghormati:

- Terms of Service sumber data
- hak cipta anime
- robots/rules situs yang berlaku
- batas request
- hak pemilik konten

Aplikasi tidak boleh mengklaim memiliki hak atas konten anime yang ditampilkan.

---

34. Definition of Done

Project MVP selesai jika pengguna HP dapat:

Buka aplikasi
    ↓
Melihat anime
    ↓
Mencari anime
    ↓
Membuka detail
    ↓
Memilih episode
    ↓
Membuka player/server
    ↓
Melanjutkan episode
    ↓
Menyimpan anime favorit

dan seluruh pengalaman tersebut terasa seperti aplikasi mobile anime, bukan sekadar halaman website yang diperkecil.