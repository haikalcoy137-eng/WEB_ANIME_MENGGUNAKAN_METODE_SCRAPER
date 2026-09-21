import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

/** Notifikasi ringan (favorit ditambahkan, cache dibersihkan, dsb). */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(0);

  const showToast = useCallback((message, options = {}) => {
    if (!message) return;
    setToast({ id: Date.now(), message, tone: options.tone || "default" });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => setToast(null),
      options.duration || 2200
    );
  }, []);

  const dismissToast = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={toast} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus dipakai di dalam ToastProvider");
  }
  return context;
}

export default ToastContext;
