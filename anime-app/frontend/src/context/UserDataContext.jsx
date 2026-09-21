import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LIMITS, STORAGE_KEYS } from "../utils/constants";
import { animeDisplayTitle, cleanText, slugFromEndpoint } from "../utils/helpers";

const UserDataContext = createContext(null);

/**
 * Favorit & riwayat tontonan (PRD 13 & 14).
 * Versi pertama tanpa akun -> seluruh data di localStorage.
 *
 * Bentuk data favorit  : { endpoint, title, poster, timestamp }
 * Bentuk data riwayat  : { anime, episode, endpoint, timestamp, ...field UI }
 */
export function UserDataProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.favorites, []);
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.history, []);

  const favoriteSlugs = useMemo(
    () => new Set(favorites.map((item) => item.endpoint)),
    [favorites]
  );

  const isFavorite = useCallback(
    (endpoint) => favoriteSlugs.has(slugFromEndpoint(endpoint)),
    [favoriteSlugs]
  );

  const addFavorite = useCallback(
    (anime) => {
      const slug = slugFromEndpoint(anime?.slug || anime?.endpoint);
      if (!slug) return;

      const entry = {
        endpoint: slug,
        title: animeDisplayTitle(cleanText(anime?.title)) || slug,
        poster: anime?.poster || "",
        timestamp: Date.now(),
      };

      setFavorites((previous) =>
        [entry, ...previous.filter((item) => item.endpoint !== slug)].slice(
          0,
          LIMITS.favorites
        )
      );
    },
    [setFavorites]
  );

  const removeFavorite = useCallback(
    (endpoint) => {
      const slug = slugFromEndpoint(endpoint);
      if (!slug) return;
      setFavorites((previous) => previous.filter((item) => item.endpoint !== slug));
    },
    [setFavorites]
  );

  /** @returns {boolean} true bila anime sekarang tersimpan di favorit. */
  const toggleFavorite = useCallback(
    (anime) => {
      const slug = slugFromEndpoint(anime?.slug || anime?.endpoint);
      if (!slug) return false;

      if (favoriteSlugs.has(slug)) {
        removeFavorite(slug);
        return false;
      }
      addFavorite(anime);
      return true;
    },
    [addFavorite, favoriteSlugs, removeFavorite]
  );

  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);

  const addHistory = useCallback(
    (entry) => {
      const slug = slugFromEndpoint(entry?.endpoint);
      if (!slug) return;

      const record = {
        anime: cleanText(entry?.anime) || "Anime",
        episode: cleanText(entry?.episode),
        endpoint: slug,
        timestamp: Date.now(),
        animeEndpoint: slugFromEndpoint(entry?.animeEndpoint),
        poster: entry?.poster || "",
        episodeTitle: cleanText(entry?.episodeTitle),
        episodeLabel: cleanText(entry?.episodeLabel) || cleanText(entry?.episode),
      };

      setHistory((previous) =>
        [record, ...previous.filter((item) => item.endpoint !== slug)].slice(
          0,
          LIMITS.history
        )
      );
    },
    [setHistory]
  );

  const removeHistory = useCallback(
    (endpoint) => {
      const slug = slugFromEndpoint(endpoint);
      if (!slug) return;
      setHistory((previous) => previous.filter((item) => item.endpoint !== slug));
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  /** Episode terakhir yang ditonton untuk sebuah anime (PRD 13: Continue Watching). */
  const findHistoryByAnime = useCallback(
    (animeEndpoint) => {
      const slug = slugFromEndpoint(animeEndpoint);
      if (!slug) return null;
      return history.find((item) => item.animeEndpoint === slug) || null;
    },
    [history]
  );

  /** Cari riwayat berdasarkan endpoint episode (dipakai halaman Watch). */
  const findHistoryByEpisode = useCallback(
    (episodeEndpoint) => {
      const slug = slugFromEndpoint(episodeEndpoint);
      if (!slug) return null;
      return history.find((item) => item.endpoint === slug) || null;
    },
    [history]
  );

  const value = useMemo(
    () => ({
      favorites,
      history,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
      addHistory,
      removeHistory,
      clearHistory,
      findHistoryByAnime,
      findHistoryByEpisode,
    }),
    [
      favorites,
      history,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
      addHistory,
      removeHistory,
      clearHistory,
      findHistoryByAnime,
      findHistoryByEpisode,
    ]
  );

  return (
    <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData harus dipakai di dalam UserDataProvider");
  }
  return context;
}

export default UserDataContext;
