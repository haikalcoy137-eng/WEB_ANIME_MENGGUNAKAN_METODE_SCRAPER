@echo off
title AniKita - API (otakudesu-api)
cd /d "%~dp0api\otakudesu-api"

if not exist node_modules (
  echo [AniKita] Menginstal dependensi backend...
  call npm install --no-audit --no-fund || goto :error
)

echo [AniKita] Menjalankan backend di http://localhost:3000
call npm run dev
goto :eof

:error
echo [AniKita] Gagal menginstal dependensi backend.
pause
