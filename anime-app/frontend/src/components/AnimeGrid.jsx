import { cn } from "../utils/helpers";
import AnimeCard from "./AnimeCard";
import { AnimeGridSkeleton } from "./Skeleton";

/**
 * Grid anime (PRD 8 & 23).
 * Jumlah kolom diatur lewat CSS: 2 kolom di mobile, 3-4 di tablet,
 * 5-6 di desktop.
 */
export default function AnimeGrid({
  anime = [],
  limit,
  className,
  loading = false,
  skeletonCount = 6,
  empty = null,
}) {
  if (loading) return <AnimeGridSkeleton count={skeletonCount} />;

  const items = limit ? anime.slice(0, limit) : anime;
  if (items.length === 0) {
    return empty ?? <p className="text-muted">Belum ada anime untuk ditampilkan.</p>;
  }

  return (
    <div className={cn("anime-grid", className)}>
      {items.map((item) => (
        <AnimeCard key={item.slug} anime={item} />
      ))}
    </div>
  );
}
