import { useCallback, useEffect, useRef, useState } from "react";

function readValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

/**
 * State React yang otomatis tersimpan di localStorage (PRD 13 & 14).
 * - Mendukung update fungsional seperti useState.
 * - Tetap sinkron antar tab lewat event "storage".
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue));
  const keyRef = useRef(key);
  const initialRef = useRef(initialValue);
  initialRef.current = initialValue;

  useEffect(() => {
    keyRef.current = key;
    setValue(readValue(key, initialRef.current));
  }, [key]);

  const update = useCallback((next) => {
    setValue((previous) => {
      const resolved = typeof next === "function" ? next(previous) : next;
      try {
        window.localStorage.setItem(keyRef.current, JSON.stringify(resolved));
      } catch {
        /* storage penuh atau diblokir: state tetap berjalan */
      }
      return resolved;
    });
  }, []);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== keyRef.current) return;
      setValue(readValue(keyRef.current, initialRef.current));
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return [value, update];
}

export default useLocalStorage;
