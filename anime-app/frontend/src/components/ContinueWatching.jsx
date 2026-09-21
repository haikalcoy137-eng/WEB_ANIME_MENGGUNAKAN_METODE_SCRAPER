import { Link } from "react-router-dom";
import { cn, formatRelativeTime, watchPath } from "../utils/helpers";
import Icon from "./Icons";
import Poster from "./Poster";

/**
 * Continue Watching / riwayat tontonan (PRD 13).
 * variant "row"  -> carousel horizontal (dipakai di Home)
 * variant "list" -> daftar vertikal dengan tombol hapus (Library & History)
 */
export default function ContinueWatching({
  items = [],
  limit,
  variant = "row",
  onRemove,
  className,
}) {
  const list = limit ? items.slice(0, limit) : items;
  if (list.length === 0) return null;

  return (
    <div className={cn(variant === "row" ? "continue-row" : "continue-list", className)}>
      {list.map((item) => {
        const episodeLabel = item.episodeLabel || (item.episode ? `Episode ${item.episode}` : "Episode");
        const target = watchPath(item.endpoint, item.animeEndpoint);
        const state = {
          animeSlug: item.animeEndpoint,
          animeTitle: item.anime,
          poster: item.poster,
        };

        return (
          <article className={cn("continue-item", variant === "row" && "continue-item--card")} key={item.endpoint}>
            <Link className="continue-item__link" to={target} state={state}>
              <Poster
                src={item.poster}
                title={item.anime}
                className="continue-item__thumb"
                rounded="md"
              />

              <span className="continue-item__body">
                <span className="continue-item__title">{item.anime}</span>
                <span className="continue-item__episode">{episodeLabel}</span>
                {item.timestamp ? (
                  <span className="continue-item__time">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                ) : null}
                <span className="continue-item__cta">
                  Continue
                  <Icon name="chevronRight" size={14} />
                </span>
              </span>
            </Link>

            {onRemove ? (
              <button
                type="button"
                className="icon-btn continue-item__remove"
                onClick={() => onRemove(item.endpoint)}
                aria-label={`Hapus riwayat ${item.anime}`}
              >
                <Icon name="trash" size={18} />
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
