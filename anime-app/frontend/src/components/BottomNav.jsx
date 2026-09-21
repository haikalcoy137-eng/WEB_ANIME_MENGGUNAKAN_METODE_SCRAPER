import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../utils/constants";
import { cn } from "../utils/helpers";
import Icon from "./Icons";

function iconFor(item, isActive) {
  if (item.icon === "heart") return isActive ? "heartFilled" : "heart";
  return item.icon;
}

/**
 * Bottom navigation mobile (PRD 6).
 * Selalu di bawah, mudah dijangkau satu tangan, dengan safe-area iOS.
 */
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn("bottom-nav__item", isActive && "is-active")
          }
        >
          {({ isActive }) => (
            <>
              <span className="bottom-nav__icon">
                <Icon name={iconFor(item, isActive)} size={22} />
              </span>
              <span className="bottom-nav__label">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

/** Versi sidebar untuk desktop (PRD 23). */
export function SideNav() {
  return (
    <aside className="side-nav" aria-label="Navigasi utama">
      <div className="side-nav__brand">
        <span className="app-header__logo" aria-hidden="true">
          <Icon name="play" size={16} />
        </span>
        <span className="app-header__name">AniKita</span>
      </div>

      <nav className="side-nav__menu">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn("side-nav__item", isActive && "is-active")
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={iconFor(item, isActive)} size={21} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <p className="side-nav__footer">
        Data anime berasal dari API tidak resmi berbasis scraping. Gunakan
        secara wajar untuk keperluan edukasi.
      </p>
    </aside>
  );
}
