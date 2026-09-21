# Otakudesu API (Unofficial)

API RESTful tidak resmi untuk website **Otakudesu**, dibuat menggunakan Node.js, Express, Axios, dan Cheerio. API ini menyediakan data anime ongoing, completed, hasil pencarian, detail anime, dan link streaming/download.

## 🚀 Fitur

- `GET /api/home` - Mendapatkan daftar anime Ongoing dan Complete dari halaman depan.
- `GET /api/search/:query` - Mencari anime berdasarkan judul.
- `GET /api/anime/:endpoint` - Mendapatkan informasi detail anime dan daftar episodenya.
- `GET /api/episode/:endpoint` - Mendapatkan detail episode lengkap dengan link streaming & link download berbagai resolusi.

## 🛠️ Instalasi & Menjalankan Lokal

Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/).

1. **Clone repository ini:**
   ```bash
   git clone <url-repository>
   cd otakudesu-api
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan server untuk mode development:**
   ```bash
   npm run dev
   ```
   Server akan berjalan di `http://localhost:3000`.

## 📚 Endpoints API

### 1. Home (Ongoing & Completed)
**Endpoint:** `GET /api/home`

**Response:**
```json
{
  "status": true,
  "message": "Berhasil mengambil data home",
  "ongoing_anime": [
    {
      "title": "One Piece",
      "endpoint": "one-piece-sub-indo/",
      "thumb": "https://otakudesu.best/wp-content/uploads/20...jpg",
      "episode": "Episode 1081",
      "upload_on": "Minggu",
      "day_updated": "Minggu"
    }
  ],
  "complete_anime": [
    // Struktur serupa dengan 'ongoing', menggunakan field 'score'
  ]
}
```

### 2. Search Anime
**Endpoint:** `GET /api/search/:query` \
**Contoh:** `GET /api/search/naruto`

**Response:**
```json
{
  "status": true,
  "message": "Berhasil mencari anime: naruto",
  "search_results": [
    {
      "title": "Boruto: Naruto Next Generations",
      "endpoint": "borot-sub-indo/",
      "thumb": "https://...jpg",
      "genres": ["Action", "Adventure"],
      "status": "Ongoing",
      "rating": "6.15"
    }
  ]
}
```

### 3. Anime Details
**Endpoint:** `GET /api/anime/:endpoint` \
**Contoh:** `GET /api/anime/borot-sub-indo/`

**Response:**
```json
{
  "status": true,
  "message": "Berhasil mengambil detail anime",
  "anime_detail": {
    "title": "Boruto: Naruto Next Generations",
    "thumb": "https://...jpg",
    "synopsis": "Naruto anak dari ...",
    "judul_jepang": "ＢＯＲＵＴＯ―ボルト―　―ＮＡＲＵＴＯ　ＮＥＸＴ　ＧＥＮＥＲＡＴＩＯＮＳ―",
    "skor": "6.15",
    "episode_list": [
      {
        "title": "Boruto Episode 293 Sub Indo",
        "endpoint": "btr-nng-episode-293-sub-indo/",
        "date": "26 Mar,2023"
      }
    ]
  }
}
```

### 4. Episode Details (Streaming & Download)
**Endpoint:** `GET /api/episode/:endpoint` \
**Contoh:** `GET /api/episode/btr-nng-episode-293-sub-indo/`

**Response:**
```json
{
  "status": true,
  "message": "Berhasil mengambil detail episode",
  "episode_detail": {
    "title": "Boruto: Naruto Next Generations Episode 293 Subtitle Indonesia",
    "stream_link": "https://str.desustream.com/dstream/updesu/v5/index.php?id=...",
    "downloads": [
      {
        "quality": "Mp4 360p",
        "size": "44.8 MB",
        "links": [
          {
            "server": "Zippy",
            "url": "https://desustream.com/safelink/linkuz/?id=..."
          },
          {
            "server": "Hxfile",
            "url": "https://desustream.com/safelink/linkuz/?id=..."
          }
        ]
      }
    ]
  }
}
```

## 🌐 Deployment
Aplikasi ini sudah dikonfigurasi menggunakan file `vercel.json` dan siap untuk dideploy ke [Vercel](https://vercel.com).
Cukup push file ini ke GitHub hubungkan repository ke Vercel, lalu Vercel akan otomatis menyajikan API Anda melalui serverless Node.js.

---
**Disclaimer**: API ini adalah proyek tidak resmi yang mengambil data (scraping) dari situs Otakudesu. Seluruh hak cipta dan merek dagang properti anime dimiliki oleh studio atau pencipta terkait. API ini diciptakan khusus untuk tujuan edukasi. Harap gunakan API ini dengan bijak dan pertimbangkan untuk meminta izin kepada admin atau pihak Otakudesu. Jangan membanjiri server mereka dengan *request* yang berlebihan.
