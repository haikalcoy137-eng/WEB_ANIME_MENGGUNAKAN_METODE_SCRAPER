/** Judul bagian (Ongoing, Episode Terbaru, Selesai, dst). */
export default function SectionHeader({ title, subtitle, count, action, className }) {
  return (
    <div className={`section-header ${className || ""}`}>
      <div className="section-header__main">
        <h2 className="section-header__title">
          {title}
          {typeof count === "number" && count > 0 ? (
            <span className="section-header__count">{count}</span>
          ) : null}
        </h2>
        {subtitle ? <p className="section-header__subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="section-header__action">{action}</div> : null}
    </div>
  );
}
