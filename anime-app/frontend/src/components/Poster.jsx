import { useEffect, useState } from "react";
import { cn, initials } from "../utils/helpers";

/**
 * Gambar poster dengan lazy loading (PRD 26) dan fallback rapi
 * bila gambar gagal dimuat.
 */
export default function Poster({
  src,
  alt = "",
  title = "",
  className,
  rounded = "md",
  eager = false,
  children,
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <span className={cn("poster", `poster--${rounded}`, className)}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
          className={cn("poster__img", loaded ? "is-loaded" : "is-loading")}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="poster__fallback" aria-hidden="true">
          {initials(title || alt)}
        </span>
      )}
      {children}
    </span>
  );
}
