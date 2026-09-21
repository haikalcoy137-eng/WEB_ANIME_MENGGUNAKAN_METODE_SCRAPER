import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Frontend hanya berbicara dengan API backend (otakudesu-api), tidak pernah
 * melakukan scraping langsung dari browser (PRD bagian 17).
 *
 * Default: request ke "/api/*" diproxy oleh dev server ke backend Express
 * (http://localhost:3000) sehingga bebas masalah CORS saat development.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_DEV_API_TARGET || "http://localhost:3000";
  const resolverTarget = env.VITE_DEV_RESOLVER_TARGET || "http://localhost:4000";
  const proxy = {
    "/api": {
      target,
      changeOrigin: true,
      secure: false,
    },
    // Resolver & relay video (server.cjs port 4000): /resolve mencari URL
    // video langsung dari halaman embed desustream, /vstream me-relay byte
    // video (mendukung Range/seek) ke <video> aplikasi.
    "/resolve": {
      target: resolverTarget,
      changeOrigin: true,
      secure: false,
    },
    "/vstream": {
      target: resolverTarget,
      changeOrigin: true,
      secure: false,
    },
  };

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      // Izinkan akses dari perangkat lain lewat tunnel (ngrok / cloudflared).
      // Tanpa ini Vite memblokir request dengan Host header yang tidak dikenal.
      allowedHosts: [".trycloudflare.com", ".ngrok-free.app", ".ngrok.io"],
      proxy,
    },
    preview: {
      port: 4173,
      host: true,
      proxy,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 900,
    },
  };
});
