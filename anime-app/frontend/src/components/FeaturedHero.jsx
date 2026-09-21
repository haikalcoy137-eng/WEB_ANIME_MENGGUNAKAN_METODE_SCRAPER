import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animePath, cn } from "../utils/helpers";
import Icon from "./Icons";
import Poster from "./Poster";

const AUTOPLAY_MS = 6000;
const RESUME_AFTER_MS = 10000;

/**
 * Featured anime (PRD 7).
 * Carousel horizontal dengan scroll-snap: bisa digeser di mobile,
 * otomatis berganti tiap 6 detik, berhenti sebentar setelah disentuh.
 */
export default function FeaturedHero({ anime = [], className }) {
  const trackRef = useRef(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef(0);
  const [index, setIndex] = useState(0);

  const total = anime.length;

  const scrollToIndex = useCallback((next) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[next];
    if (!target || typeof target.offsetLeft !== "number") return;
    track.scrollTo({
      left: target.offsetLeft - (track.clientWidth - target.clientWidth) / 2,
      behavior: "smooth",
    });
  }, []);

  const goTo = useCallback(
    (next) => {
      if (total === 0) return;
      const value = ((next % total) + total) % total;
      indexRef.current = value;
      setIndex(value);
      scrollToIndex(value);
    },
    [scrollToIndex, total]
  );

  // Autoplay ringan, dijeda sementara ketika pengguna menyentuh carousel.
  useEffect(() => {
    if (total <= 1) return undefined;
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      goTo(indexRef.current + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [goTo, total]);

  useEffect(() => () => window.clearTimeout(resumeTimerRef.current), []);

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let smallest = Number.POSITIVE_INFINITY;

    Array.from(track.children).forEach((child, childIndex) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(childCenter - center);
      if (distance < smallest) {
        smallest = distance;
        nearest = childIndex;
      }
    });

    if (nearest !== indexRef.current) {
      indexRef.current = nearest;
      setIndex(nearest);
    }
  }

  function pauseTemporarily() {
    pausedRef.current = true;
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_AFTER_MS);
  }

  if (total === 0) return null;

  return (
    <section className={cn("hero", className)} aria-label="Anime pilihan">
      <div
        className="hero__track"
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={pauseTemporarily}
        onTouchStart={pauseTemporarily}
      >
        {anime.map((item, itemIndex) => (
          <article className="hero__slide" key={item.slug}>
            <Link
              to={animePath(item.slug)}
              className="hero__link"
              aria-label={`Buka detail ${item.title}`}
            >
              <Poster
                src={item.poster}
                title={item.title}
                className="hero__poster"
                rounded="lg"
                eager={itemIndex === 0}
              />
              <span className="hero__scrim" aria-hidden="true" />
              <span className="hero__content">
                {item.status ? (
                  <span className="badge badge--accent">{item.status}</span>
                ) : null}
                <strong className="hero__title">{item.title}</strong>
                <span className="hero__meta">
                  {[item.episode, item.day].filter(Boolean).join(" • ")}
                </span>
                <span className="btn btn--primary btn--sm hero__cta">
                  <Icon name="play" size={15} />
                  <span>Tonton Sekarang</span>
                </span>
              </span>
            </Link>
          </article>
        ))}
      </div>

      {total > 1 ? (
        <div className="hero__dots">
          {anime.map((item, dotIndex) => (
            <button
              key={item.slug}
              type="button"
              className={cn("hero__dot", dotIndex === index && "is-active")}
              onClick={() => {
                pauseTemporarily();
                goTo(dotIndex);
              }}
              aria-label={`Tampilkan anime pilihan ${dotIndex + 1}: ${item.title}`}
              aria-current={dotIndex === index ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
