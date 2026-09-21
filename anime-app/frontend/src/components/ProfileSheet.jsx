import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { useUserData } from "../context/UserDataContext";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { clearApiCache, getApiCacheSize } from "../services/api";
import { API_BASE_URL, APP_NAME, APP_VERSION } from "../utils/constants";
import Icon from "./Icons";

/**
 * Panel profil / pengaturan (tombol 👤 di header).
 * Berisi status aplikasi, install PWA, pengelolaan data lokal,
 * dan catatan legal (PRD 27 & 33).
 */
export default function ProfileSheet({ open, onClose }) {
  const { favorites, history, clearFavorites, clearHistory } = useUserData();
  const { canInstall, promptInstall, isStandalone } = useInstallPrompt();
  const { showToast } = useToast();
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    if (open) setCacheSize(getApiCacheSize());
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, open]);

  if (!open) return null;

  async function handleInstall() {
    const result = await promptInstall();
    if (result?.outcome === "accepted") {
      showToast("Aplikasi dipasang ke layar utama");
    } else if (result?.outcome === "unavailable") {
      showToast("Gunakan menu browser > Tambahkan ke layar utama");
    }
  }

  function handleClearCache() {
    clearApiCache();
    setCacheSize(0);
    showToast("Cache API dibersihkan");
  }

  function handleClearHistory() {
    clearHistory();
    showToast("Riwayat tontonan dihapus");
  }

  function handleClearFavorites() {
    clearFavorites();
    showToast("Daftar favorit dihapus");
  }

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Profil dan pengaturan">
      <button
        type="button"
        className="sheet__backdrop"
        onClick={onClose}
        aria-label="Tutup panel"
      />

      <div className="sheet__panel">
        <div className="sheet__handle" aria-hidden="true" />

        <header className="sheet__header">
          <div>
            <h2 className="sheet__title">Profil &amp; Pengaturan</h2>
            <p className="sheet__subtitle">
              {APP_NAME} v{APP_VERSION} — data tersimpan di perangkat ini
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
            <Icon name="close" />
          </button>
        </header>

        <div className="sheet__body">
          <section className="sheet__section">
            <h3 className="sheet__section-title">Ringkasan</h3>
            <div className="stat-grid">
              <div className="stat">
                <span className="stat__value">{favorites.length}</span>
                <span className="stat__label">Favorit</span>
              </div>
              <div className="stat">
                <span className="stat__value">{history.length}</span>
                <span className="stat__label">Riwayat</span>
              </div>
              <div className="stat">
                <span className="stat__value">{cacheSize}</span>
                <span className="stat__label">Cache API</span>
              </div>
            </div>
          </section>

          <section className="sheet__section">
            <h3 className="sheet__section-title">Aplikasi</h3>
            {isStandalone ? (
              <p className="sheet__note">
                <Icon name="check" size={16} /> Aplikasi sudah berjalan sebagai
                PWA di layar utama.
              </p>
            ) : canInstall ? (
              <button type="button" className="btn btn--primary btn--block" onClick={handleInstall}>
                <Icon name="install" size={18} />
                <span>Pasang ke layar utama</span>
              </button>
            ) : (
              <p className="sheet__note">
                Buka menu browser lalu pilih “Tambahkan ke layar utama” untuk
                memasang aplikasi ini.
              </p>
            )}
          </section>

          <section className="sheet__section">
            <h3 className="sheet__section-title">Data</h3>
            <button type="button" className="btn btn--outline btn--block" onClick={handleClearCache}>
              <Icon name="refresh" size={18} />
              <span>Bersihkan cache API</span>
            </button>
            <button type="button" className="btn btn--outline btn--block" onClick={handleClearHistory}>
              <Icon name="trash" size={18} />
              <span>Hapus riwayat tontonan</span>
            </button>
            <button type="button" className="btn btn--outline btn--block" onClick={handleClearFavorites}>
              <Icon name="trash" size={18} />
              <span>Hapus semua favorit</span>
            </button>
          </section>

          <section className="sheet__section">
            <h3 className="sheet__section-title">Tentang</h3>
            <p className="sheet__note">
              Aplikasi ini hanya menampilkan data dari API tidak resmi berbasis
              scraping ({API_BASE_URL}). Seluruh hak cipta anime dimiliki oleh
              pemiliknya masing-masing. Gunakan secara wajar, tanpa membebani
              server sumber.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
