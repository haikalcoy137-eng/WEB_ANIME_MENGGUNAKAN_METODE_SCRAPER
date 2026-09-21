import { useToast } from "../context/ToastContext";
import { useUserData } from "../context/UserDataContext";
import { cn } from "../utils/helpers";
import Icon from "./Icons";

/**
 * Tombol favorit (PRD 14).
 * variant "icon"    -> tombol ikon kecil (mis. pada header/card)
 * variant "primary" -> tombol penuh dengan label
 */
export default function FavoriteButton({
  anime,
  variant = "primary",
  size = 20,
  label,
  className,
}) {
  const { isFavorite, toggleFavorite } = useUserData();
  const { showToast } = useToast();

  const active = isFavorite(anime?.slug || anime?.endpoint);
  const ariaLabel = active ? "Hapus dari favorit" : "Tambah ke favorit";

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const added = toggleFavorite(anime);
    showToast(added ? "Ditambahkan ke Favorit" : "Dihapus dari Favorit");
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        className={cn("icon-btn", active && "is-active", className)}
        onClick={handleClick}
        aria-pressed={active}
        aria-label={ariaLabel}
      >
        <Icon name={active ? "heartFilled" : "heart"} size={size} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn("btn", active ? "btn--accent" : "btn--outline", className)}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={ariaLabel}
    >
      <Icon name={active ? "heartFilled" : "heart"} size={size} />
      <span>{label || (active ? "Tersimpan di Favorit" : "Favorit")}</span>
    </button>
  );
}
