import { useEffect } from "react";
import { APP_NAME } from "../utils/constants";

/** Mengatur document.title per halaman (rasa aplikasi, bukan website). */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — ${APP_NAME}` : `${APP_NAME} — Anime Streaming`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

export default useDocumentTitle;
