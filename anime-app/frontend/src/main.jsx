import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(<App />);

/**
 * Service worker PWA (PRD 27).
 * Hanya didaftarkan pada build produksi agar development tidak terpengaruh cache.
 */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* PWA bersifat opsional: kegagalan registrasi tidak boleh mengganggu aplikasi */
    });
  });
}
