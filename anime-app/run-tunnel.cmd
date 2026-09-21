@echo off
REM Tunnel publik (internet) -> http://localhost:5173
REM URL publik muncul di log setelah tunnel siap (lihat tunnel.log).
setlocal
cd /d "%~dp0"
tools\cloudflared.exe tunnel --url http://localhost:5173 --no-autoupdate 1>nul 2>tunnel.log
