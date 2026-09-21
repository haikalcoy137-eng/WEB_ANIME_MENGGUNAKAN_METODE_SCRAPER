import { Link } from "react-router-dom";
import AnimeGrid from "../components/AnimeGrid";
import AnimeListItem from "../components/AnimeListItem";
import ContinueWatching from "../components/ContinueWatching";
import ErrorState from "../components/ErrorState";
import FeaturedHero from "../components/FeaturedHero";
import Header from "../components/Header";
import Icon from "../components/Icons";
import InstallBanner from "../components/InstallBanner";
import SectionHeader from "../components/SectionHeader";
import {
  AnimeGridSkeleton,
  AnimeListSkeleton,
  HeroSkeleton,
} from "../components/Skeleton";
import { useUserData } from "../context/UserDataContext";
import { useApiQuery } from "../hooks/useApiQuery";
import { getHome } from "../services/api";
import { LIMITS } from "../utils/constants";

/**
 * Halaman Home (PRD 7): Header, Featured, Ongoing, Episode Terbaru, Completed.
 * Ditambah Continue Watching dari riwayat lokal.
 */
export default function Home() {
  const { data, error, isLoading, retry } = useApiQuery("home", ({ force }) =>
    getHome({ force })
  );
  const { history } = useUserData();

  const continueWatching = history.slice(0, LIMITS.continueWatching);
  const latestEpisodes = data
    ? data.ongoing.slice(LIMITS.featured, LIMITS.featured + LIMITS.latestEpisodes)
    : [];

  return (
    <>
      <Header />

      <main className="page">
        <InstallBanner />

        {continueWatching.length > 0 ? (
          <section className="page__section" aria-label="Lanjut nonton">
            <SectionHeader
              title="Lanjut Nonton"
              subtitle="Episode yang terakhir kamu buka"
              action={
                <Link className="link-more" to="/history">
                  <span>Riwayat</span>
                  <Icon name="chevronRight" size={15} />
                </Link>
              }
            />
            <ContinueWatching items={continueWatching} variant="row" />
          </section>
        ) : null}

        {isLoading ? (
          <>
            <HeroSkeleton />
            <section className="page__section">
              <AnimeGridSkeleton count={6} />
            </section>
            <section className="page__section">
              <AnimeListSkeleton count={4} />
            </section>
          </>
        ) : null}

        {!isLoading && error && !data ? (
          <ErrorState onRetry={retry} />
        ) : null}

        {data ? (
          <>
            <FeaturedHero anime={data.featured} />

            <section className="page__section">
              <SectionHeader
                title="Ongoing"
                subtitle="Anime yang sedang tayang"
                count={data.ongoing.length}
              />
              <AnimeGrid
                anime={data.ongoing}
                skeletonCount={6}
                empty={
                  <p className="text-muted">
                    Belum ada anime ongoing yang bisa ditampilkan.
                  </p>
                }
              />
            </section>

            {latestEpisodes.length > 0 ? (
              <section className="page__section">
                <SectionHeader
                  title="Episode Terbaru"
                  subtitle="Update paling baru dari sumber data"
                />
                <ul className="anime-list">
                  {latestEpisodes.map((item) => (
                    <AnimeListItem key={item.slug} anime={item} />
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="page__section">
              <SectionHeader
                title="Selesai / Tamat"
                subtitle="Anime yang sudah tamat"
                count={data.complete.length}
              />
              <AnimeGrid
                anime={data.complete}
                skeletonCount={4}
                empty={
                  <p className="text-muted">
                    Belum ada anime tamat yang bisa ditampilkan.
                  </p>
                }
              />
            </section>

            {error ? (
              <p className="page__notice">
                Sebagian data mungkin belum terbaru karena koneksi ke server
                gagal saat memperbarui.
              </p>
            ) : null}

            <p className="page__disclaimer">
              Data anime ditampilkan dari API tidak resmi berbasis scraping.
              Seluruh hak cipta dan merek dagang anime dimiliki oleh pemiliknya
              masing-masing.
            </p>
          </>
        ) : null}
      </main>
    </>
  );
}
