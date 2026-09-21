import { cn } from "../utils/helpers";
import Icon from "./Icons";

/** Empty state generik (pencarian kosong, favorit kosong, riwayat kosong). */
export default function EmptyState({
  icon = "search",
  title = "Belum ada data",
  description,
  action,
  compact = false,
  className,
}) {
  return (
    <div className={cn("state", compact && "state--compact", className)}>
      <span className="state__icon">
        <Icon name={icon} size={26} />
      </span>

      <h2 className="state__title">{title}</h2>
      {description ? <p className="state__text">{description}</p> : null}
      {action ? <div className="state__action">{action}</div> : null}
    </div>
  );
}
