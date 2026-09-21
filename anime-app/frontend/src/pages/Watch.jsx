import { useEffect, useMemo } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import EpisodeList from "../components/EpisodeList";
import ErrorState from "../components/ErrorState";
import FavoriteButton from "../components/FavoriteButton";
import Header from "../components/Header";
import Icon from "../components/Icons";
import Player from "../components/Player";
import SectionHeader from "../components/SectionHeader";
import ServerSelector from "../components/ServerSelector";
import { WatchSkeleton } from "../components/Skeleton";
import { useUserData } from "../context/UserDataContext";
import { useApiQuery } from "../hooks/useApiQuery";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getAnimeDetail, getEpisode } from "../services/api";
import { animePath, slugFromEndpoint, watchPath } from "../utils/helpers";

/**
 * Halaman watch (PRD 12).
 * Player + pilihan server + episode sebelumnya/berikutnya + daftar episode,
 * sekaligus mencatat riwayat tontonan untuk Continue Watching (PRD 13).
 *
 * Konteks anime diambil berurutan dari: state navigasi -> query ?anime=
 * -> riwayat tontonan, agar halaman tetap berfungsi saat di-refresh.
 */
export default function Watch() {
  const { episodeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { addHistory, findHistoryByEpisode } = useUserData();

  const routeState = location.state || {};
  const historyForEpisode = findHistoryByEpisode(episodeSlug);

  const animeSlug =
    slugFromEndpoint(routeState.animeSlug) ||
    slugFromEndpoint(searchParams.get("anime")) ||
    historyForEpisode?.animeEndpoint ||
    "";

  const episodeQuery = useApiQuery(`episode:${episodeSlug}`, ({ force }) =>
    getEpisode(episodeSlug, { force })
  );

  const animeQuery = useApiQuery(
    animeSlug ? `anime:${animeSlug}` : null,
    ({ force }) => getAnimeDetail(animeSlug, { force }),
    { enabled: Boolean(animeSlug) }
  );

  const episode = episodeQuery.data;
  const anime = animeQuery.data;
  const episodes = useMemo(() => anime?.episodes ?? [], [anime]);

  const animeTitle =
    anime?.title ||
    routeState.animeTitle ||
    historyForEpisode?.anime ||
    episode?.animeTitle ||
    "";

  const poster = anime?.poster || routeState.poster || historyForEpisode?.poster || "";

  const currentIndex = useMemo(() => {
    if (!episode) return -1;
    let index = episodes.findIndex((item) => item.slug === episode.slug);
    if (index === -1 && episode.episodeNumber) {
      index = episodes.findIndex((item) => item.number === episode.episodeNumber);
    }
    return index;
  }, [episode, episodes]);

  // Daftar dari API berurutan terbaru -> terlama.
  const nextEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const previousEpisode =
    currentIndex >= 0 && currentIndex + 1 < episodes.length
      ? episodes[currentIndex + 1]
      : null;

  const navigationState = { animeSlug, animeTitle, poster };
  useDocumentTitle(
    animeTitle ? `${animeTitle} — ${episode?.label || "Episode"}` : episode?.title
  );

  useEffect(() => {
    if (!episode) return;
    addHistory({
      anime: animeTitle || episode.animeTitle || "Anime",
      episode: episode.episodeNumber || episode.label,
      endpoint: episode.slug,
      animeEndpoint: animeSlug,
      poster,
      episodeTitle: episode.title,
      episodeLabel: episode.label,
    });
  }, [addHistory, animeSlug, animeTitle, episode, poster]);

  return (
    <>
      <Header
        variant="back"
        title={animeTitle || "Tonton"}
        subtitle={episode?.label}
        actions={
          animeSlug ? (
            <FavoriteButton
              variant="icon"
              anime={{ slug: animeSlug, title: animeTitle, poster }}
            />
          ) : null
        }
      />

      <main className="page page--watch">
        {episodeQuery.isLoading ? <WatchSkeleton /> : null}

        {!episodeQuery.isLoading && episodeQuery.error ? (
          <ErrorState
            title={episodeQuery.error.message}
            description="Periksa koneksi kamu, lalu muat ulang episode ini."
            onRetry={episodeQuery.retry}
          />
        ) : null}

        {episode ? (
          <>
            <Player
              url={episode.streamUrl}
              title={episode.title || episode.label}
              poster={poster}
            />

            <section className="watch__head">
              <h1 className="watch__title">{episode.title || episode.label}</h1>
              {animeSlug && animeTitle ? (
                <Link className="watch__anime" to={animePath(animeSlug)}>
                  <Icon name="film" size={15} />
                  <span>{animeTitle}</span>
                </Link>
              ) : null}
            </section>

            <nav className="watch__nav" aria-label="Navigasi episode">
              {previousEpisode ? (
                <Link
                  className="btn btn--outline"
                  to={watchPath(previousEpisode.slug, animeSlug)}
                  state={navigationState}
                >
                  <Icon name="chevronLeft" size={18} />
                  <span>Sebelumnya</span>
                </Link>
              ) : (
                <span className="btn btn--ghost is-disabled" aria-disabled="true">
                  <Icon name="chevronLeft" size={18} />
                  <span>Sebelumnya</span>
                </span>
              )}

              {nextEpisode ? (
                <Link
                  className="btn btn--primary"
                  to={watchPath(nextEpisode.slug, animeSlug)}
                  state={navigationState}
                >
                  <span>Berikutnya</span>
                  <Icon name="chevronRight" size={18} />
                </Link>
              ) : (
                <span className="btn btn--ghost is-disabled" aria-disabled="true">
                  <span>Berikutnya</span>
                  <Icon name="chevronRight" size={18} />
                </span>
              )}
            </nav>

            {!animeSlug ? (
              <p className="watch__hint">
                Buka episode ini dari halaman detail anime agar navigasi episode
                lengkap tersedia.
              </p>
            ) : null}

            <ServerSelector
              streamUrl={episode.streamUrl}
              downloads={episode.downloads}
            />

            <section className="page__section">
              <SectionHeader
                title="Daftar Episode"
                count={episodes.length}
                subtitle={animeTitle || undefined}
              />

              {episodes.length > 0 ? (
                <EpisodeList
                  episodes={episodes}
                  animeSlug={animeSlug}
                  variant="list"
                  activeSlug={episode.slug}
                  initialVisible={12}
                />
              ) : (
                <p className="text-muted">
                  Daftar episode lengkap belum tersedia di halaman ini.
                </p>
              )}

              {animeSlug ? (
                <Link className="btn btn--ghost btn--block" to={animePath(animeSlug)}>
                  <Icon name="film" size={18} />
                  <span>Lihat detail anime</span>
                </Link>
              ) : null}
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}

