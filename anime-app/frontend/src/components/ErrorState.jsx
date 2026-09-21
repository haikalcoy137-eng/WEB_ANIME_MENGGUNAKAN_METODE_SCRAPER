import { MESSAGES } from "../utils/constants";
import { cn } from "../utils/helpers";
import Icon from "./Icons";

/**
 * Error state dengan tombol "Coba Lagi" (PRD 16).
 * Pesan yang ditampilkan selalu ramah pengguna, bukan error mentah backend.
 */
export default function ErrorState({
  title = MESSAGES.genericError,
  description = MESSAGES.genericErrorHint,
  onRetry,
  retryLabel = "Coba Lagi",
  compact = false,
  className,
}) {
  return (
    <div className={cn("state", compact && "state--compact", className)} role="alert">
      <span className="state__icon state__icon--error">
        <Icon name="alert" size={26} />
      </span>

      <h2 className="state__title">{title}</h2>
      {description ? <p className="state__text">{description}</p> : null}

      {onRetry ? (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          <Icon name="refresh" size={18} />
          <span>{retryLabel}</span>
        </button>
      ) : null}
    </div>
  );
}
