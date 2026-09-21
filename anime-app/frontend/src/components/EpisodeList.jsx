import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LIMITS } from "../utils/constants";
import { cn, watchPath } from "../utils/helpers";
import Icon from "./Icons";

/**
 * Daftar episode (PRD 11).
 * - Urutan default mengikuti API: episode terbaru di atas.
 * - Pencarian episode muncul otomatis bila jumlah episode banyak.
 * - Bisa diurutkan terbaru <-> terlama dan dimuat bertahap.
 *
 * variant "chips" -> kotak nomor episode (halaman detail)
 * variant "list"  -> baris lengkap dengan judul episode (halaman watch)
 */
export default function EpisodeList({
  episodes = [],
  animeSlug,
  activeSlug,
  variant = "chips",
  showFilter,
  showSort = true,
  initialVisible = LIMITS.initialEpisodes,
  pageSize = LIMITS.episodePageSize,
  className,
}) {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("desc");
  const [visible, setVisible] = useState(initialVisible);
  const activeRef = useRef(null);

  const needsFilter = showFilter ?? episodes.length > 12;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const base = term
      ? episodes.filter(
          (episode) =>
            episode.title.toLowerCase().includes(term) ||
            (episode.number && episode.number.includes(term))
        )
      : episodes;

    return order === "asc" ? [...base].reverse() : base;
  }, [episodes, order, query]);

  useEffect(() => {
    setVisible(initialVisible);
  }, [query, order, initialVisible]);

  useEffect(() => {
    if (variant !== "list" || !activeSlug || !activeRef.current) return;
    activeRef.current.scrollIntoView({ block: "nearest" });
  }, [activeSlug, variant, filtered.length]);

  if (episodes.length === 0) {
    return (
      <p className={cn("text-muted", className)}>
        Daftar episode belum tersedia untuk anime ini.
      </p>
    );
  }

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  return (
    <div className={cn("episode-list", className)}>
      {(needsFilter || showSort) && (
        <div className="episode-list__tools">
          {needsFilter ? (
            <label className="episode-list__filter">
              <Icon name="search" size={16} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari episode..."
                aria-label="Cari episode"
                inputMode="search"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Hapus pencarian episode"
                >
                  <Icon name="close" size={14} />
                </button>
              ) : null}
            </label>
          ) : (
            <span className="episode-list__count">{episodes.length} episode</span>
          )}

          {showSort ? (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setOrder((value) => (value === "desc" ? "asc" : "desc"))}
            >
              <Icon name="list" size={16} />
              <span>{order === "desc" ? "Terbaru" : "Terlama"}</span>
            </button>
          ) : null}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-muted">Episode dengan kata kunci itu tidak ditemukan.</p>
      ) : variant === "list" ? (
        <ul className="episode-list__rows">
          {shown.map((episode) => {
            const isActive = episode.slug === activeSlug;
            return (
              <li key={episode.slug}>
                <Link
                  ref={isActive ? activeRef : null}
                  to={watchPath(episode.slug, animeSlug)}
                  className={cn("episode-row", isActive && "is-active")}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="episode-row__number">{episode.number || "•"}</span>
                  <span className="episode-row__body">
                    <span className="episode-row__title">
                      {episode.title || episode.label}
                    </span>
                  </span>
                  {isActive ? (
                    <span className="episode-row__badge">Sedang ditonton</span>
                  ) : (
                    <Icon name="play" size={15} className="episode-row__play" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="episode-list__grid">
          {shown.map((episode) => {
            const isActive = episode.slug === activeSlug;
            return (
              <Link
                key={episode.slug}
                to={watchPath(episode.slug, animeSlug)}
                className={cn("episode-chip", isActive && "is-active")}
                title={episode.title}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="episode-chip__number">
                  {episode.number || episode.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {remaining > 0 ? (
        <>
          <button
            type="button"
            className="btn btn--outline btn--block"
            onClick={() => setVisible((value) => value + pageSize)}
          >
            Muat {Math.min(remaining, pageSize)} episode lagi
          </button>
          <p className="episode-list__info">
            Menampilkan {shown.length} dari {filtered.length} episode
          </p>
        </>
      ) : null}
    </div>
  );
}
