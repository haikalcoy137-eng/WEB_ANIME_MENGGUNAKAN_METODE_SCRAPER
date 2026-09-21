import { Link } from "react-router-dom";
import { animePath, statusTone } from "../utils/helpers";
import Icon from "./Icons";
import Poster from "./Poster";

/**
 * Baris anime untuk hasil pencarian (PRD 9) dan daftar episode terbaru.
 * Menampilkan poster, judul, genre, status, dan rating.
 */
export default function AnimeListItem({ anime }) {
  if (!anime) return null;

  const genres = (anime.genres || []).slice(0, 3);
  const hasMeta = Boolean(anime.episode || anime.status || anime.rating || anime.day);

  return (
    <li className="anime-list__item">
      <Link
        to={animePath(anime.slug)}
        className="anime-list__link"
        aria-label={anime.title}
      >
        <Poster
          src={anime.poster}
          title={anime.title}
          className="anime-list__thumb"
          rounded="md"
        />

        <span className="anime-list__body">
          <span className="anime-list__title">{anime.title}</span>

          {hasMeta ? (
            <span className="anime-list__meta">
              {anime.episode ? (
                <span className="anime-list__episode">{anime.episode}</span>
              ) : anime.status ? (
                <span className={`badge badge--${statusTone(anime.statusRaw || anime.status)}`}>
                  {anime.status}
                </span>
              ) : null}

              {anime.rating ? (
                <span className="anime-list__rating">
                  <Icon name="star" size={13} /> {anime.rating}
                </span>
              ) : null}

              {anime.day ? <span className="anime-list__day">{anime.day}</span> : null}
            </span>
          ) : null}

          {genres.length > 0 ? (
            <span className="anime-list__genres">
              {genres.map((genre) => (
                <span className="chip chip--ghost" key={genre}>
                  {genre}
                </span>
              ))}
            </span>
          ) : null}
        </span>

        <Icon name="chevronRight" size={20} className="anime-list__chevron" />
      </Link>
    </li>
  );
}
