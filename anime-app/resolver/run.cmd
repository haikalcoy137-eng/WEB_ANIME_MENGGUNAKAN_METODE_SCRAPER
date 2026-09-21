@echo off
REM Stream resolver & relay untuk video Desustream (port 4000)
setlocal
cd /d "%~dp0.."
node resolver\server.cjs
