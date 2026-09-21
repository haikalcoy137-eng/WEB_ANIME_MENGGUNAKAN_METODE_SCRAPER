@echo off
title AniKita - Frontend (React + Vite)
cd /d "%~dp0frontend"

if not exist node_modules (
  echo [AniKita] Menginstal dependensi frontend...
  call npm install --no-audit --no-fund || goto :error
)

if not exist public\icons\icon-192.png (
  echo [AniKita] Membuat ikon PWA...
  call npm run icons
)

echo [AniKita] Menjalankan frontend di http://localhost:5173
echo [AniKita] Pastikan backend sudah jalan (run-api.cmd).
call npm run dev
goto :eof

:error
echo [AniKita] Gagal menginstal dependensi frontend.
pause
