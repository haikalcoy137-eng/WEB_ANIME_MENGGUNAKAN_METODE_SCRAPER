import { cn } from "../utils/helpers";

/** Blok dasar skeleton dengan animasi shimmer (PRD 15 & 25). */
export function Skeleton({ className, style, rounded = "md" }) {
  return (
    <span
      className={cn("skeleton", `skeleton--${rounded}`, className)}
      style={style}
      aria-hidden="true"
    />
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="anime-card anime-card--skeleton">
      <Skeleton className="skeleton--poster" rounded="lg" />
      <Skeleton className="skeleton--line" style={{ width: "82%" }} />
      <Skeleton className="skeleton--line skeleton--line-sm" style={{ width: "52%" }} />
    </div>
  );
}

/** Grid skeleton untuk Home, Search, dan Library. */
export function AnimeGridSkeleton({ count = 6 }) {
  return (
    <div className="anime-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <AnimeCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** Skeleton baris (hasil pencarian / daftar episode terbaru). */
export function AnimeListSkeleton({ count = 5 }) {
  return (
    <ul className="anime-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <li className="anime-list__item anime-list__item--skeleton" key={index}>
          <Skeleton className="skeleton--thumb" rounded="md" />
          <div className="anime-list__body">
            <Skeleton className="skeleton--line" style={{ width: "75%" }} />
            <Skeleton className="skeleton--line skeleton--line-sm" style={{ width: "45%" }} />
            <Skeleton className="skeleton--line skeleton--line-sm" style={{ width: "60%" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Skeleton hero/featured di halaman Home. */
export function HeroSkeleton() {
  return (
    <div className="hero hero--skeleton" aria-hidden="true">
      <Skeleton className="skeleton--hero" rounded="lg" />
      <div className="hero__overlay">
        <Skeleton className="skeleton--line" style={{ width: "60%" }} />
        <Skeleton className="skeleton--line skeleton--line-sm" style={{ width: "38%" }} />
      </div>
    </div>
  );
}

/** Skeleton daftar episode di halaman detail & watch. */
export function EpisodeListSkeleton({ count = 12 }) {
  return (
    <div className="episode-list" aria-hidden="true">
      <div className="episode-list__grid">
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className="skeleton--chip" rounded="md" />
        ))}
      </div>
    </div>
  );
}

/** Skeleton halaman detail anime. */
export function DetailSkeleton() {
  return (
    <div className="detail detail--skeleton" aria-hidden="true">
      <div className="detail__hero">
        <Skeleton className="skeleton--poster detail__poster-skeleton" rounded="lg" />
        <div className="detail__hero-body">
          <Skeleton className="skeleton--line" style={{ width: "70%", height: 20 }} />
          <Skeleton className="skeleton--line skeleton--line-sm" style={{ width: "45%" }} />
          <Skeleton className="skeleton--line skeleton--line-sm" style={{ width: "30%" }} />
        </div>
      </div>
      <Skeleton className="skeleton--line" style={{ width: "35%" }} />
      <Skeleton className="skeleton--block" rounded="lg" />
      <Skeleton className="skeleton--line" style={{ width: "28%" }} />
      <EpisodeListSkeleton count={16} />
    </div>
  );
}

/** Skeleton halaman watch (player + info episode). */
export function WatchSkeleton() {
  return (
    <div className="watch watch--skeleton" aria-hidden="true">
      <Skeleton className="skeleton--player" rounded="lg" />
      <Skeleton className="skeleton--line" style={{ width: "55%", height: 18 }} />
      <Skeleton className="skeleton--line skeleton--line-sm" style={{ width: "35%" }} />
      <div className="watch__servers">
        <Skeleton className="skeleton--chip" rounded="pill" />
        <Skeleton className="skeleton--chip" rounded="pill" />
        <Skeleton className="skeleton--chip" rounded="pill" />
      </div>
    </div>
  );
}

export default Skeleton;
