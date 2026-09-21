import { useEffect, useState } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/constants";
import Icon from "./Icons";

/** Ajakan instal ke home screen (PRD 27) — bisa ditutup pengguna. */
export default function InstallBanner({ className }) {
  const { canInstall, promptInstall, isStandalone } = useInstallPrompt();
  const [dismissed, setDismissed] = useLocalStorage(STORAGE_KEYS.installBanner, false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!installing) return undefined;
    const timer = window.setTimeout(() => setInstalling(false), 4000);
    return () => window.clearTimeout(timer);
  }, [installing]);

  if (dismissed || isStandalone || !canInstall) return null;

  async function handleInstall() {
    setInstalling(true);
    await promptInstall();
  }

  return (
    <div className={`install-banner ${className || ""}`} role="region" aria-label="Pasang aplikasi">
      <span className="install-banner__icon" aria-hidden="true">
        <Icon name="install" size={20} />
      </span>

      <div className="install-banner__body">
        <strong className="install-banner__title">Pasang AniKita</strong>
        <span className="install-banner__text">
          Buka lebih cepat dan tampil seperti aplikasi di HP kamu.
        </span>
      </div>

      <button
        type="button"
        className="btn btn--primary btn--sm"
        onClick={handleInstall}
        disabled={installing}
      >
        {installing ? "Menyiapkan..." : "Pasang"}
      </button>

      <button
        type="button"
        className="icon-btn install-banner__close"
        onClick={() => setDismissed(true)}
        aria-label="Tutup ajakan pasang aplikasi"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
