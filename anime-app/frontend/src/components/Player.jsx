import { useEffect, useState } from "react";
import { cn, resolvePlayback } from "../utils/helpers";
import { resolveStream, relayUrl } from "../services/api";
import Icon from "./Icons";

/**
 * Video player (PRD 12).
 *
 * Menangani semua kemungkinan sumber dari API:
 * - file video langsung (mp4/webm/m3u8) -> <video>
 * - URL embed/iframe yang bisa disematkan -> <iframe> dengan opsi buka tab baru
 * - URL embed yang memblokir iframe (mis. desustream via CSP frame-ancestors)
 *   -> otomatis di-resolve lewat /resolve (server relay port 4000) lalu
 *      diputar sebagai video native via /vstream; bila resolve gagal, tampil
 *      panel "tonton di tab baru" sebagai cadangan.
 * - server tidak tersedia            -> panel informasi, tanpa error mentah
 */

const RELAY_IDLE = "idle";
const RELAY_LOADING = "loading";
const RELAY_READY = "ready";
const RELAY_FAILED = "failed";

export default function Player({ url, title = "Video player", poster, className }) {
  const playback = resolvePlayback(url);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [showFrame, setShowFrame] = useState(false);
  const [forceFrame, setForceFrame] = useState(false);
  const [relay, setRelay] = useState(RELAY_IDLE);
  const [relayDirect, setRelayDirect] = useState("");
  const [attempt, setAttempt] = useState(0);

  const embedBlocked = !playback.frameable && playback.mode === "embed";

  // Saat embed diblokir host, coba ekstrak video langsung via resolver.
  useEffect(() => {
    setFrameLoaded(false);
    setShowFrame(false);
    setForceFrame(false);
    setRelayDirect("");

    if (!embedBlocked || !playback.url) {
      setRelay(RELAY_IDLE);
      return undefined;
    }

    let cancelled = false;
    setRelay(RELAY_LOADING);
    resolveStream(playback.url)
      .then((data) => {
        if (cancelled) return;
        if (data && data.ok && data.direct) {
          setRelayDirect(data.direct);
          setRelay(RELAY_READY);
        } else {
          setRelay(RELAY_FAILED);
        }
      })
      .catch(() => {
        if (!cancelled) setRelay(RELAY_FAILED);
      });

    return () => {
      cancelled = true;
    };
  }, [embedBlocked, playback.url, attempt]);

  if (playback.mode === "none") {
    return (
      <div className={cn("player", "player--empty", className)}>
        <span className="player__placeholder">
          <Icon name="alert" size={28} />
          <strong>Server tidak tersedia</strong>
          <span className="player__placeholder-text">
            Sumber video untuk episode ini belum bisa dimuat. Coba episode lain
            atau muat ulang halaman.
          </span>
        </span>
      </div>
    );
  }

  if (playback.mode === "video") {
    return (
      <div className={cn("player", className)}>
        <video
          className="player__video"
          src={playback.url}
          poster={poster || undefined}
          controls
          playsInline
          preload="metadata"
        />
      </div>
    );
  }

  // Embed yang tadinya diblokir, kini direlay dan diputar sebagai video native.
  if (embedBlocked && relay === RELAY_READY && !forceFrame) {
    return (
      <div className={cn("player", className)}>
        <video
          className="player__video"
          src={relayUrl(relayDirect)}
          poster={poster || undefined}
          controls
          playsInline
          preload="metadata"
        />
      </div>
    );
  }

  if (embedBlocked && (relay === RELAY_LOADING || relay === RELAY_IDLE) && !forceFrame) {
    return (
      <div className={cn("player", "player--empty", className)}>
        <span className="player__placeholder">
          <span className="spinner" />
          <strong>Menyiapkan video…</strong>
          <span className="player__placeholder-text">
            Mengambil sumber video dari server.
          </span>
        </span>
      </div>
    );
  }

  const showBlockedCover = embedBlocked && !showFrame;

  if (showBlockedCover) {
    return (
      <div className={cn("player", "player--empty", className)}>
        <span className="player__placeholder">
          <Icon name="alert" size={28} />
          <strong>Server ini memblokir pemutar semat</strong>
          <span className="player__placeholder-text">
            {relay === RELAY_FAILED
              ? "Sumber video tidak dapat diambil saat ini. Coba lagi atau buka di tab terpisah."
              : "Server video tidak mengizinkan pemutaran di situs lain, jadi video harus dibuka di tab terpisah."}
          </span>
          <div className="player__placeholder-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setAttempt((value) => value + 1)}
            >
              <Icon name="play" size={18} />
              <span>Coba lagi</span>
            </button>
            <a
              className="btn btn--outline"
              href={playback.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="external" size={16} />
              <span>Tonton di tab baru</span>
            </a>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setForceFrame(true);
              setShowFrame(true);
            }}
          >
            <Icon name="external" size={14} />
            <span>Coba sematkan di sini</span>
          </button>
        </span>
      </div>
    );
  }

  return (
    <div className="player-stack">
      <div className={cn("player", className)}>
        {showFrame ? (
          <>
            <iframe
              className="player__frame"
              src={playback.url}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer"
              onLoad={() => setFrameLoaded(true)}
            />
            {!frameLoaded ? (
              <span className="player__loading" aria-hidden="true">
                <span className="spinner" />
              </span>
            ) : null}
          </>
        ) : (
          <div className="player__cover">
            <span className="player__cover-inner">
              <strong className="player__cover-title">{title}</strong>
              <span className="player__placeholder-text">
                Video disediakan oleh server eksternal.
              </span>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setShowFrame(true)}
              >
                <Icon name="play" size={18} />
                <span>Putar di sini</span>
              </button>
              <a
                className="btn btn--ghost"
                href={playback.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="external" size={18} />
                <span>Buka di tab baru</span>
              </a>
            </span>
          </div>
        )}
      </div>

      {showFrame ? (
        <div className="player__bar">
          <span className="player__bar-text">Jika video tidak muncul,</span>
          <a
            className="player__bar-link"
            href={playback.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            buka di tab baru
            <Icon name="external" size={13} />
          </a>
        </div>
      ) : null}
    </div>
  );
}
