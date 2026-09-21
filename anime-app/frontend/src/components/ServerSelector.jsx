import { useMemo, useState } from "react";
import { cn, resolvePlayback } from "../utils/helpers";
import Icon from "./Icons";

/**
 * Pemilih server + daftar download (PRD 12).
 *
 * API menyediakan satu `stream_link` (embed) serta beberapa server download
 * per resolusi. Server download umumnya hanya berupa halaman perantara,
 * sehingga dibuka di tab baru sesuai data API — bukan dipaksa masuk iframe.
 */
export default function ServerSelector({ streamUrl, downloads = [] }) {
  const playback = resolvePlayback(streamUrl);
  const [activeQuality, setActiveQuality] = useState(0);

  const quality = useMemo(
    () => downloads[activeQuality] ?? downloads[0] ?? null,
    [activeQuality, downloads]
  );

  return (
    <section className="servers" aria-label="Pilihan server">
      <h2 className="servers__title">Server</h2>

      <div className="servers__row">
        {playback.mode === "none" ? (
          <span className="servers__note">
            <Icon name="alert" size={16} /> Server streaming tidak tersedia.
          </span>
        ) : (
          <span className="server-chip is-active">
            <Icon name="server" size={16} />
            <span>Server Utama</span>
            <span className="server-chip__type">
              {playback.mode === "video" ? "Video" : "Embed"}
            </span>
          </span>
        )}
      </div>

      {downloads.length > 0 ? (
        <>
          <h3 className="servers__subtitle">Download &amp; Server Alternatif</h3>

          <div className="servers__row servers__row--wrap">
            {downloads.map((group, index) => (
              <button
                key={`${group.quality}-${index}`}
                type="button"
                className={cn("chip", index === (quality ? activeQuality : -1) && "is-active")}
                onClick={() => setActiveQuality(index)}
                aria-pressed={index === activeQuality}
              >
                <span>{group.quality}</span>
                {group.size ? <span className="chip__size">{group.size}</span> : null}
              </button>
            ))}
          </div>

          {quality ? (
            <div className="servers__row servers__row--wrap">
              {quality.servers.map((server) => (
                <a
                  key={`${quality.quality}-${server.name}`}
                  className="btn btn--outline btn--sm"
                  href={server.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span>{server.name}</span>
                  <Icon name="external" size={14} />
                </a>
              ))}
            </div>
          ) : null}

          <p className="servers__hint">
            Tombol server di atas membuka halaman sumber di tab baru, sesuai data
            yang disediakan API. Tidak semua server dapat diputar langsung di
            dalam aplikasi.
          </p>
        </>
      ) : null}
    </section>
  );
}
