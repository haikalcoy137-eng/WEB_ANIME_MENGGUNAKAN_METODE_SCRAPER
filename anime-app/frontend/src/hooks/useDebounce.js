import { useEffect, useState } from "react";

/**
 * Menunda perubahan nilai (dipakai untuk debounce pencarian, PRD 9 & 26)
 * supaya request tidak dikirim pada setiap karakter.
 */
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
