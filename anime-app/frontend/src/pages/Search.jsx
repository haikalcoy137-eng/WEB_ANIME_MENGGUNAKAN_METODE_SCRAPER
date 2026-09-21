import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AnimeListItem from "../components/AnimeListItem";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Header from "../components/Header";
import Icon from "../components/Icons";
import SearchBar from "../components/SearchBar";
import { AnimeListSkeleton } from "../components/Skeleton";
import { useDebouncedValue } from "../hooks/useDebounce";
import { useApiQuery } from "../hooks/useApiQuery";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { searchAnime } from "../services/api";
import {
  LIMITS,
  MESSAGES,
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_LENGTH,
  STORAGE_KEYS,
} from "../utils/constants";

const SUGGESTIONS = [
  "One Piece",
  "Naruto",
  "Jujutsu Kaisen",
  "Solo Leveling",
  "Spy x Family",
];

/**
 * Halaman pencarian (PRD 9).
 * Debounce, loading state, empty state, error state, dan hasil pencarian.
 */
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = useState(() => searchParams.get("q") || "");
  const [recent, setRecent] = useLocalStorage(STORAGE_KEYS.recentSearches, []);
  const lastStoredRef = useRef("");

  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
  const activeTerm = debouncedTerm.trim();
  const canSearch = activeTerm.length >= SEARCH_MIN_LENGTH;

  const { data, error, isLoading, retry } = useApiQuery(
    canSearch ? `search:${activeTerm.toLowerCase()}` : null,
    ({ force }) => searchAnime(activeTerm, { force }),
    { enabled: canSearch, keepPreviousData: false }
  );

  // URL tetap sinkron dengan kata kunci supaya bisa di-refresh / dibagikan.
  useEffect(() => {
    const next = new URLSearchParams();
    const trimmed = term.trim();
    if (trimmed) next.set("q", trimmed);
    setSearchParams(next, { replace: true });
  }, [term, setSearchParams]);

  // Simpan kata kunci yang berhasil menghasilkan hasil ke "Pencarian Terakhir".
  useEffect(() => {
    if (!canSearch || !Array.isArray(data) || data.length === 0) return;
    const key = activeTerm.toLowerCase();
    if (lastStoredRef.current === key) return;
    lastStoredRef.current = key;
    setRecent((previous) =>
      [activeTerm, ...previous.filter((item) => item.toLowerCase() !== key)].slice(
        0,
        LIMITS.recentSearches
      )
    );
  }, [activeTerm, canSearch, data, setRecent]);

  const showIdle = term.trim().length === 0;
  const showTooShort = !showIdle && !canSearch;
  const results = Array.isArray(data) ? data : [];

  return (
    <>
      <Header
        variant="back"
        title="Cari Anime"
        subtitle="Temukan anime berdasarkan judul"
      />

      <main className="page page--search">
        <SearchBar
          value={term}
          onChange={setTerm}
          loading={isLoading && canSearch}
          placeholder="Cari anime..."
        />

        {showIdle ? (
          <section className="page__section">
            {recent.length > 0 ? (
              <>
                <div className="search-block__header">
                  <h2 className="search-block__title">Pencarian Terakhir</h2>
                  <button type="button" className="link-more" onClick={() => setRecent([])}>
                    <Icon name="trash" size={14} />
                    <span>Hapus</span>
                  </button>
                </div>
                <div className="chip-row">
                  {recent.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="chip"
                      onClick={() => setTerm(item)}
                    >
                      <Icon name="clock" size={14} />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            <div className="search-block__header">
              <h2 className="search-block__title">Rekomendasi Pencarian</h2>
            </div>
            <div className="chip-row">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="chip"
                  onClick={() => setTerm(item)}
                >
                  <Icon name="sparkle" size={14} />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {showTooShort ? (
          <EmptyState
            icon="search"
            title="Ketik minimal 2 karakter"
            description="Masukkan judul anime yang ingin kamu cari."
            compact
          />
        ) : null}

        {canSearch ? (
          <section className="page__section">
            {isLoading ? <AnimeListSkeleton count={5} /> : null}

            {!isLoading && error ? <ErrorState onRetry={retry} compact /> : null}

            {!isLoading && !error && results.length === 0 ? (
              <EmptyState
                icon="search"
                title={MESSAGES.emptySearch}
                description={MESSAGES.emptySearchHint}
                compact
              />
            ) : null}

            {!isLoading && !error && results.length > 0 ? (
              <>
                <p className="search-result__info">
                  {results.length} hasil untuk “{activeTerm}”
                </p>
                <ul className="anime-list">
                  {results.map((item) => (
                    <AnimeListItem key={item.slug} anime={item} />
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        ) : null}

        {showIdle ? (
          <p className="page__disclaimer">
            Hasil pencarian diambil dari API tidak resmi berbasis scraping.
          </p>
        ) : null}
      </main>
    </>
  );
}
