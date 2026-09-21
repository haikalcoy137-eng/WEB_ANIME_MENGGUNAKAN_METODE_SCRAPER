import { Link } from "react-router-dom";
import { animePath, cn, statusTone } from "../utils/helpers";
import Poster from "./Poster";

/**
 * Anime card (PRD 8).
 * Poster rasio konsisten 2:3, judul maksimal 2 baris, badge status,
 * meta episode/skor + hari update.
 */
export default function AnimeCard({ anime, className, showStatus = true, metaLimit = 2 }) {
  if (!anime) return null;

  const meta = [anime.episode, anime.score ? `★ ${anime.score}` : "", anime.score || anime.episode ? "" : anime.day]
    .filter(Boolean)
    .slice(0, metaLimit);
  const tone = statusTone(anime.statusRaw || anime.status);

  return (
    <Link
      to={animePath(anime.slug)}
      className={cn("anime-card", className)}
      aria-label={anime.title}
    >
      <Poster
        src={anime.poster}
        title={anime.title}
        className="anime-card__poster"
        rounded="lg"
      >
        {showStatus && anime.status ? (
          <span className={cn("badge badge--overlay", `badge--${tone}`)}>
            {anime.status}
          </span>
        ) : null}
      </Poster>

      <span className="anime-card__body">
        <span className="anime-card__title">{anime.title}</span>
        {metaLimit > 0 ? (
          <span className="anime-card__meta">
            {meta.length > 0 ? meta.join(" • ") : anime.day || "—"}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
