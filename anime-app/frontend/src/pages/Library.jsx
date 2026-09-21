import { Link, useSearchParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard";
import ContinueWatching from "../components/ContinueWatching";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import Icon from "../components/Icons";
import SectionHeader from "../components/SectionHeader";
import { useToast } from "../context/ToastContext";
import { useUserData } from "../context/UserDataContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { cn, formatRelativeTime } from "../utils/helpers";

/**
 * Halaman Library (PRD 14).
 * Berisi dua bagian: Favorit dan Riwayat (Continue Watching).
 */
export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "riwayat" ? "riwayat" : "favorit";

  const {
    favorites,
    history,
    removeFavorite,
    removeHistory,
    clearFavorites,
    clearHistory,
  } = useUserData();
  const { showToast } = useToast();

  useDocumentTitle("Library");

  function selectTab(nextTab) {
    const next = new URLSearchParams(searchParams);
    if (nextTab === "riwayat") next.set("tab", "riwayat");
    else next.delete("tab");
    setSearchParams(next, { replace: true });
  }

  function handleRemoveFavorite(item) {
    removeFavorite(item.endpoint);
    showToast("Dihapus dari Favorit");
  }

  function handleRemoveHistory(endpoint) {
    removeHistory(endpoint);
    showToast("Riwayat dihapus");
  }

  return (
    <>
      <Header
        variant="back"
        title="Library"
        subtitle="Favorit & riwayat tontonanmu"
      />

      <main className="page page--library">
        <div className="segmented" role="tablist" aria-label="Bagian library">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "favorit"}
            className={cn("segmented__item", tab === "favorit" && "is-active")}
            onClick={() => selectTab("favorit")}
          >
            <Icon name={tab === "favorit" ? "heartFilled" : "heart"} size={16} />
            <span>Favorit</span>
            <span className="segmented__count">{favorites.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={tab === "riwayat"}
            className={cn("segmented__item", tab === "riwayat" && "is-active")}
            onClick={() => selectTab("riwayat")}
          >
            <Icon name="clock" size={16} />
            <span>Riwayat</span>
            <span className="segmented__count">{history.length}</span>
          </button>
        </div>

        {tab === "favorit" ? (
          <section className="page__section">
            <SectionHeader
              title="Favorit"
              count={favorites.length}
              subtitle="Anime yang kamu simpan"
            />

            {favorites.length === 0 ? (
              <EmptyState
                icon="heart"
                title="Belum ada anime favorit"
                description="Tambahkan anime dari halaman detail dengan tombol Favorit."
                action={
                  <Link className="btn btn--primary" to="/">
                    <Icon name="home" size={18} />
                    <span>Jelajahi anime</span>
                  </Link>
                }
              />
            ) : (
              <>
                <div className="anime-grid">
                  {favorites.map((item) => (
                    <div className="library-item" key={item.endpoint}>
                      <AnimeCard
                        anime={{
                          slug: item.endpoint,
                          title: item.title,
                          poster: item.poster,
                        }}
                        metaLimit={0}
                        showStatus={false}
                      />
                      <button
                        type="button"
                        className="icon-btn library-item__remove"
                        onClick={() => handleRemoveFavorite(item)}
                        aria-label={`Hapus ${item.title} dari favorit`}
                      >
                        <Icon name="trash" size={16} />
                      </button>
                      <span className="library-item__time">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn--ghost btn--block"
                  onClick={() => {
                    clearFavorites();
                    showToast("Daftar favorit dihapus");
                  }}
                >
                  <Icon name="trash" size={18} />
                  <span>Hapus semua favorit</span>
                </button>
              </>
            )}
          </section>
        ) : (
          <section className="page__section">
            <SectionHeader
              title="Riwayat"
              count={history.length}
              subtitle="Lanjutkan dari episode terakhir"
            />

            {history.length === 0 ? (
              <EmptyState
                icon="clock"
                title="Riwayat masih kosong"
                description="Episode yang kamu buka akan muncul di sini secara otomatis."
                action={
                  <Link className="btn btn--primary" to="/">
                    <Icon name="play" size={18} />
                    <span>Mulai nonton</span>
                  </Link>
                }
              />
            ) : (
              <>
                <ContinueWatching
                  items={history}
                  variant="list"
                  onRemove={handleRemoveHistory}
                />
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
          </section>
        )}
      </main>
    </>
  );
}
