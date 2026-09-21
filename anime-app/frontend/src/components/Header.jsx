import { useNavigate } from "react-router-dom";
import { useUi } from "../context/UiContext";
import { APP_NAME } from "../utils/constants";
import { cn } from "../utils/helpers";
import Icon from "./Icons";

/**
 * Header aplikasi (PRD 7).
 * - variant "home" : logo + tombol search + tombol profil
 * - variant "back" : tombol kembali + judul halaman + slot aksi
 */
export default function Header({
  variant = "home",
  title,
  subtitle,
  onBack,
  actions,
  className,
  bordered = true,
}) {
  const navigate = useNavigate();
  const { openProfile } = useUi();

  function handleBack() {
    if (typeof onBack === "function") {
      onBack();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  }

  return (
    <header
      className={cn(
        "app-header",
        bordered && "app-header--bordered",
        variant === "back" && "app-header--back",
        className
      )}
    >
      {variant === "home" ? (
        <>
          <div className="app-header__brand">
            <span className="app-header__logo" aria-hidden="true">
              <Icon name="play" size={16} />
            </span>
            <span className="app-header__name">{APP_NAME}</span>
          </div>
          <div className="app-header__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => navigate("/search")}
              aria-label="Cari anime"
            >
              <Icon name="search" />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={openProfile}
              aria-label="Profil dan pengaturan"
            >
              <Icon name="user" />
            </button>
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            className="icon-btn app-header__back"
            onClick={handleBack}
            aria-label="Kembali"
          >
            <Icon name="arrowLeft" />
          </button>
          <div className="app-header__titles">
            <h1 className="app-header__title" title={typeof title === "string" ? title : undefined}>
              {title}
            </h1>
            {subtitle ? <p className="app-header__subtitle">{subtitle}</p> : null}
          </div>
          <div className="app-header__actions">{actions}</div>
        </>
      )}
    </header>
  );
}
