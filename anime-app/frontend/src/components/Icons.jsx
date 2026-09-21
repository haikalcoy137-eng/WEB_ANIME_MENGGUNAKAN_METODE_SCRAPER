import { cn } from "../utils/helpers";

/**
 * Ikon SVG inline (tanpa dependensi ikon eksternal).
 * Semua ikon memakai currentColor agar mengikuti warna teks induknya.
 */
const ICONS = {
  home: {
    d: "M4 10.6 12 4.2l8 6.4V19a1.2 1.2 0 0 1-1.2 1.2h-4.3v-5.6H9.5v5.6H5.2A1.2 1.2 0 0 1 4 19z",
  },
  search: {
    d: "M10.8 4a6.8 6.8 0 1 0 4 12.3l4.2 4.2 1.4-1.4-4.2-4.2A6.8 6.8 0 0 0 10.8 4m0 2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6",
  },
  heart: {
    d: "M12 19.6S4.8 15.2 4.8 10.4A4 4 0 0 1 12 8.1a4 4 0 0 1 7.2 2.3c0 4.8-7.2 9.2-7.2 9.2",
  },
  heartFilled: {
    d: "M12 19.9S4.4 15.3 4.4 10.4A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.6 2.4c0 4.9-7.6 9.5-7.6 9.5",
    filled: true,
  },
  clock: {
    d: "M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6m0 2a6.8 6.8 0 1 1 0 13.6 6.8 6.8 0 0 1 0-13.6M11 7.5v5.2l4.2 2.4.9-1.6-3.1-1.8V7.5z",
  },
  play: { d: "M8.5 5.4v13.2L19.2 12z", filled: true },
  arrowLeft: { d: "M19 12H5m0 0 6-6m-6 6 6 6" },
  chevronLeft: { d: "M14.5 6 8.5 12l6 6" },
  chevronRight: { d: "M9.5 6l6 6-6 6" },
  chevronDown: { d: "M6 9.5l6 6 6-6" },
  star: { d: "M12 3.6l2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.8-5 2.8 1-5.6-4.1-4 5.6-.8z", filled: true },
  dots: {
    d: "M12 4.4a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2m0 6a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2m0 6a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2",
    filled: true,
  },
  user: {
    d: "M12 12.2a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 1.8c-3.9 0-7 2.1-7 4.8V20h14v-1.2c0-2.7-3.1-4.8-7-4.8",
  },
  server: {
    d: "M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2m0 1.9c1.9 1.9 3 4.2 3 6.7s-1.1 4.8-3 6.7c-1.9-1.9-3-4.2-3-6.7s1.1-4.8 3-6.7M3.9 9.3h16.2M3.9 14.7h16.2",
  },
  external: {
    d: "M14 4h6v6m0-6-8.5 8.5M18.5 13.5V19a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5",
  },
  download: { d: "M12 4v10m0 0-3.8-3.8M12 14l3.8-3.8M5 17.5h14" },
  refresh: { d: "M20 12a8 8 0 1 1-2.4-5.7M20 4.5v5h-5" },
  trash: { d: "M4.5 7h15M9.5 7V4.8h5V7m-7 0 1 12.2h6.9L16.5 7" },
  share: { d: "M12 16V4.5m0 0-3.6 3.6M12 4.5l3.6 3.6M5 15v4.5h14V15" },
  install: { d: "M12 3v9.5m0 0-3.4-3.4M12 12.5l3.4-3.4M5 17.5h14V21H5z" },
  alert: { d: "M12 4.2 2.9 20h18.2zM12 10v4.2m0 2.8h.01" },
  film: {
    d: "M4.5 4.5h15v15h-15zM8.5 4.5v15M15.5 4.5v15M4.5 9.5h4M4.5 14.5h4M15.5 9.5h4M15.5 14.5h4",
  },
  list: { d: "M8.5 6h11.5M8.5 12h11.5M8.5 18h11.5M4.2 6h.01M4.2 12h.01M4.2 18h.01" },
  close: { d: "M6 6l12 12M18 6 6 18" },
  check: { d: "M5 12.8 9.3 17 19 7.4" },
  sparkle: {
    d: "M12 3.5l1.7 4.3L18 9.5l-4.3 1.7L12 15.5l-1.7-4.3L6 9.5l4.3-1.7zM18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z",
    filled: true,
  },
};

export default function Icon({
  name,
  size = 22,
  className,
  strokeWidth = 1.8,
  ...rest
}) {
  const icon = ICONS[name];
  if (!icon) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("icon", className)}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        d={icon.d}
        fill={icon.filled ? "currentColor" : "none"}
        stroke={icon.filled ? "none" : "currentColor"}
        strokeWidth={icon.filled ? 0 : strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
