import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import EpisodeList from "../components/EpisodeList";
import ErrorState from "../components/ErrorState";
import FavoriteButton from "../components/FavoriteButton";
import Header from "../components/Header";
import Icon from "../components/Icons";
import Poster from "../components/Poster";
import SectionHeader from "../components/SectionHeader";
import { DetailSkeleton } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import { useUserData } from "../context/UserDataContext";
import { useApiQuery } from "../hooks/useApiQuery";
import { getAnimeDetail } from "../services/api";
import { statusTone, watchPath } from "../utils/helpers";

const SYNOPSIS_LIMIT = 320;

/**
 * Halaman detail anime (PRD 10).
 * Poster, judul, judul Jepang, skor, sinopsis, genre, status, dan episode list.
 */
export default function AnimeDetail() {
  const { slug } = useParams();
  const { showToast } = useToast();
  const { findHistoryByAnime } = useUserData();
  const [synopsisOpen, setSynopsisOpen] = useState(false);

  const { data, error, isLoading, retry } = useApiQuery(`anime:${slug}`, ({ force }) =>
    getAnimeDetail(slug, { force })
  );

  const lastWatched = findHistoryByAnime(slug);

  const { episodes, resumeEpisode, firstEpisode, newestEpisode } = useMemo(() => {
    const list = data?.episodes ?? [];
    return {
      episodes: list,
      // Daftar dari API: index 0 = episode terbaru, index terakhir = episode 1.
      firstEpisode: list.length > 0 ? list[list.length - 1] : null,
      newestEpisode: list.length > 0 ? list[0] : null,
      resumeEpisode: lastWatched
        ? list.find((episode) => episode.slug === lastWatched.endpoint) ?? null
        : null,
    };
  }, [data, lastWatched]);

  const primaryEpisode = resumeEpisode || firstEpisode;
  const primaryLabel = resumeEpisode
    ? `Lanjut ${resumeEpisode.label}`
    : "Mulai Nonton";

  const watchState = {
    animeSlug: slug,
    animeTitle: data?.title || "",
    poster: data?.poster || "",
  };

  async function handleShare() {
    const url = window.location.href;
    const payload = {
      title: data?.title ? `${data.title} — AniKita` : "AniKita",
      text: data?.title ? `Lihat ${data.title} di AniKita` : "AniKita",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("Tautan disalin");
    } catch {
      /* pengguna membatalkan dialog share */
    }
  }

  const synopsis = data?.synopsis || "";
  const synopsisTooLong = synopsis.length > SYNOPSIS_LIMIT;
  const synopsisText =
    synopsisTooLong && !synopsisOpen
      ? `${synopsis.slice(0, SYNOPSIS_LIMIT).trimEnd()}…`
      : synopsis;

  const infoRows = data
    ? [
        { label: "Judul Jepang", value: data.japaneseTitle },
        { label: "Tipe", value: data.type },
        { label: "Status", value: data.status },
        { label: "Studio", value: data.studio },
        { label: "Produser", value: data.producer },
        { label: "Total Episode", value: data.totalEpisode },
        { label: "Durasi", value: data.duration },
        { label: "Tanggal Rilis", value: data.releaseDate },
      ].filter((row) => row.value)
    : [];

  return (
    <>
      <Header
        variant="back"
        title={data?.title || "Detail Anime"}
        actions={
          <>
            <button
              type="button"
              className="icon-btn"
              onClick={handleShare}
              aria-label="Bagikan anime ini"
            >
              <Icon name="share" />
            </button>
            {data ? (
              <FavoriteButton
                variant="icon"
                anime={{ slug, title: data.title, poster: data.poster }}
              />
            ) : null}
          </>
        }
      />

      <main className="page page--detail">
        {isLoading ? <DetailSkeleton /> : null}

        {!isLoading && error && !data ? (
          <ErrorState title={error.message} onRetry={retry} />
        ) : null}

        {data ? (
          <>
            <section className="detail__hero">
              {data.poster ? (
                <span
                  className="detail__backdrop"
                  style={{ backgroundImage: `url("${data.poster}")` }}
                  aria-hidden="true"
                />
              ) : null}

              <div className="detail__hero-inner">
                <Poster
                  src={data.poster}
                  title={data.title}
                  className="detail__poster"
                  rounded="lg"
                  eager
                />

                <div className="detail__titles">
                  <h1 className="detail__title">{data.title}</h1>
                  {data.japaneseTitle ? (
                    <p className="detail__subtitle">{data.japaneseTitle}</p>
                  ) : null}
                  {data.alternativeTitle &&
                  data.alternativeTitle.toLowerCase() !== data.title.toLowerCase() ? (
                    <p className="detail__subtitle">
                      Judul lain: {data.alternativeTitle}
                    </p>
                  ) : null}

                  <div className="detail__badges">
                    {data.score ? (
                      <span className="badge badge--score">
                        <Icon name="star" size={13} /> {data.score}
                      </span>
                    ) : null}
                    {data.status ? (
                      <span className={`badge badge--${statusTone(data.statusRaw)}`}>
                        {data.status}
                      </span>
                    ) : null}
                    {data.type ? <span className="badge">{data.type}</span> : null}
                    {data.duration ? (
                      <span className="badge">{data.duration}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="detail__actions">
              {primaryEpisode ? (
                <Link
                  className="btn btn--primary btn--block"
                  to={watchPath(primaryEpisode.slug, slug)}
                  state={watchState}
                >
                  <Icon name="play" size={18} />
                  <span>{primaryLabel}</span>
                </Link>
              ) : null}

              {newestEpisode && newestEpisode.slug !== primaryEpisode?.slug ? (
                <Link
                  className="btn btn--outline btn--block"
                  to={watchPath(newestEpisode.slug, slug)}
                  state={watchState}
                >
                  <Icon name="film" size={18} />
                  <span>
                    Episode Terbaru ({newestEpisode.number || newestEpisode.label})
                  </span>
                </Link>
              ) : null}

              <FavoriteButton
                className="btn--block"
                anime={{ slug, title: data.title, poster: data.poster }}
              />

              {lastWatched ? (
                <p className="detail__resume-info">
                  Terakhir kamu tonton{" "}
                  <strong>{lastWatched.episodeLabel || lastWatched.episode}</strong>.
                </p>
              ) : null}
            </section>

            {data.genres.length > 0 ? (
              <section className="page__section">
                <div className="chip-row">
                  {data.genres.map((genre) => (
                    <span className="chip chip--ghost" key={genre}>
                      {genre}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {synopsis ? (
              <section className="page__section">
                <SectionHeader title="Sinopsis" />
                <p className="detail__synopsis">{synopsisText}</p>
                {synopsisTooLong ? (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setSynopsisOpen((value) => !value)}
                    aria-expanded={synopsisOpen}
                  >
                    <span>
                      {synopsisOpen ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
                    </span>
                    <Icon
                      name="chevronDown"
                      size={16}
                      className={synopsisOpen ? "is-flipped" : undefined}
                    />
                  </button>
                ) : null}
              </section>
            ) : null}

            {infoRows.length > 0 ? (
              <section className="page__section">
                <SectionHeader title="Informasi" />
                <dl className="info-list">
                  {infoRows.map((row) => (
                    <div className="info-list__row" key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <section className="page__section">
              <SectionHeader
                title="Episode"
                count={episodes.length}
                subtitle={
                  episodes.length > 0 ? "Episode terbaru di posisi pertama" : undefined
                }
              />

              {episodes.length > 0 ? (
                <EpisodeList
                  episodes={episodes}
                  animeSlug={slug}
                  variant="chips"
                  activeSlug={lastWatched?.endpoint}
                />
              ) : (
                <EmptyState
                  icon="film"
                  title="Episode belum tersedia"
                  description="Sumber data belum menyediakan daftar episode untuk anime ini."
                  compact
                />
              )}
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}

