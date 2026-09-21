import { useEffect, useRef } from "react";
import Icon from "./Icons";

/** Kotak pencarian dengan tombol hapus + indikator loading (PRD 9). */
export default function SearchBar({
  value = "",
  onChange,
  onSubmit,
  onBack,
  autoFocus = false,
  loading = false,
  placeholder = "Cari anime...",
  className,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(value);
    inputRef.current?.blur();
  }

  return (
    <form className={`search-bar ${className || ""}`} onSubmit={handleSubmit} role="search">
      {onBack ? (
        <button
          type="button"
          className="icon-btn"
          onClick={onBack}
          aria-label="Kembali"
        >
          <Icon name="arrowLeft" />
        </button>
      ) : null}

      <label className="search-bar__field">
        <Icon name="search" size={19} className="search-bar__icon" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          aria-label="Kata kunci pencarian"
        />
        {value ? (
          <button
            type="button"
            className="search-bar__clear"
            onClick={() => {
              onChange?.("");
              inputRef.current?.focus();
            }}
            aria-label="Hapus kata kunci"
          >
            <Icon name="close" size={16} />
          </button>
        ) : null}
        {loading ? <span className="spinner" aria-hidden="true" /> : null}
      </label>
    </form>
  );
}
