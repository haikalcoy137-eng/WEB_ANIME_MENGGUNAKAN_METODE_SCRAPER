import { Link } from "react-router-dom";
import ContinueWatching from "../components/ContinueWatching";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import Icon from "../components/Icons";
import SectionHeader from "../components/SectionHeader";
import { useToast } from "../context/ToastContext";
import { useUserData } from "../context/UserDataContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { LIMITS } from "../utils/constants";

/**
 * Halaman Riwayat (PRD 13).
 * Continue Watching: anime/episode terakhir yang dibuka, dari localStorage.
 */
export default function History() {
  const { history, removeHistory, clearHistory } = useUserData();
  const { showToast } = useToast();

  useDocumentTitle("Riwayat");

  const continueWatching = history.slice(0, LIMITS.continueWatching);

  return (
    <>
      <Header
        variant="back"
        title="Riwayat"
        subtitle="Lanjutkan tontonanmu"
        actions={
          history.length > 0 ? (
            <Link className="icon-btn" to="/library?tab=riwayat" aria-label="Buka library">
              <Icon name="heart" />
            </Link>
          ) : null
        }
      />

      <main className="page page--history">
        {history.length === 0 ? (
          <EmptyState
            icon="clock"
            title="Belum ada riwayat tontonan"
            description="Setiap episode yang kamu buka akan dicatat otomatis di perangkat ini."
            action={
              <Link className="btn btn--primary" to="/">
                <Icon name="play" size={18} />
                <span>Mulai nonton</span>
              </Link>
            }
          />
        ) : (
          <>
            {continueWatching.length > 0 ? (
              <section className="page__section">
                <SectionHeader
                  title="Continue Watching"
                  count={continueWatching.length}
                  subtitle="Lanjut dari episode terakhir"
                />
                <ContinueWatching
                  items={continueWatching}
                  variant="row"
                  onRemove={(endpoint) => {
                    removeHistory(endpoint);
                    showToast("Riwayat dihapus");
                  }}
                />
              </section>
            ) : null}

            <section className="page__section">
              <SectionHeader
                title="Semua Riwayat"
                count={history.length}
                subtitle="Klik untuk membuka kembali episode"
              />
              <ContinueWatching
                items={history}
                variant="list"
                onRemove={(endpoint) => {
                  removeHistory(endpoint);
                  showToast("Riwayat dihapus");
                }}
              />
            </section>

            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={() => {
                clearHistory();
                showToast("Riwayat tontonan dihapus");
              }}
            >
              <Icon name="trash" size={18} />
              <span>Hapus semua riwayat</span>
            </button>
          </>
        )}
      </main>
    </>
  );
}
