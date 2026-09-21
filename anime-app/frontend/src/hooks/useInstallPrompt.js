import { useCallback, useEffect, useState } from "react";

/**
 * PWA install prompt (PRD 27).
 * Event "beforeinstallprompt" hanya muncul sekali di awal, jadi event
 * disimpan di level modul agar tetap bisa dipakai dari komponen mana pun.
 */
let deferredPrompt = null;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const mediaMatch = window.matchMedia?.("(display-mode: standalone)")?.matches;
  return Boolean(mediaMatch || window.navigator.standalone === true);
}

export function useInstallPrompt() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((value) => value + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return { outcome: "unavailable" };
    const event = deferredPrompt;
    deferredPrompt = null;

    try {
      event.prompt();
      const choice = await event.userChoice;
      notify();
      return choice;
    } catch {
      notify();
      return { outcome: "dismissed" };
    }
  }, []);

  return {
    canInstall: Boolean(deferredPrompt),
    promptInstall,
    isStandalone: isStandaloneMode(),
  };
}

export default useInstallPrompt;
