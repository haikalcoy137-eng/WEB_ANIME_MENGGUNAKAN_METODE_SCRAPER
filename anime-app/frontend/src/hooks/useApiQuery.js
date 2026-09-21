import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook pengambil data dari API service.
 *
 * - `key`     : identitas request (mis. "home" atau `anime:${slug}`).
 *               Ganti key = request baru; key yang sama tidak memicu request
 *               ulang selama data masih ada (cache service API, PRD 19).
 * - `fetcher` : fungsi tanpa argumen yang memanggil service API,
 *               menerima `{ force }` untuk melewati cache (tombol Coba Lagi).
 * - `enabled` : nonaktifkan sementara (mis. query pencarian terlalu pendek).
 */
export function useApiQuery(key, fetcher, options = {}) {
  const { enabled = true, keepPreviousData = true } = options;
  const active = Boolean(enabled) && Boolean(key);

  const [state, setState] = useState({
    data: null,
    error: null,
    loading: active,
    refreshing: false,
  });
  const [attempt, setAttempt] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const forceRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setState((previous) =>
        previous.loading || previous.refreshing
          ? { ...previous, loading: false, refreshing: false }
          : previous
      );
      return undefined;
    }

    let mounted = true;
    const force = forceRef.current;
    forceRef.current = false;

    // keepPreviousData = false dipakai halaman pencarian agar hasil lama
    // tidak tertukar dengan kata kunci baru.
    setState((previous) => ({
      data: keepPreviousData ? previous.data : null,
      error: null,
      loading: keepPreviousData ? !previous.data : true,
      refreshing: keepPreviousData ? Boolean(previous.data) : false,
    }));

    fetcherRef
      .current({ force })
      .then((data) => {
        if (!mounted) return;
        setState({ data, error: null, loading: false, refreshing: false });
      })
      .catch((error) => {
        if (!mounted) return;
        setState((previous) => ({
          data: keepPreviousData ? previous.data : null,
          error,
          loading: false,
          refreshing: false,
        }));
      });

    return () => {
      mounted = false;
    };
  }, [key, active, attempt, keepPreviousData]);

  /** Ulangi request dan paksa ambil data terbaru dari backend. */
  const retry = useCallback(() => {
    forceRef.current = true;
    setAttempt((value) => value + 1);
  }, []);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.loading,
    isRefreshing: state.refreshing,
    retry,
    refresh: retry,
  };
}

export default useApiQuery;
