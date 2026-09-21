import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ProfileSheet from "../components/ProfileSheet";

const UiContext = createContext(null);

/**
 * State UI global: panel profil/pengaturan (tombol 👤 di header).
 * Provider ini juga merender ProfileSheet supaya bisa dibuka dari halaman mana pun.
 */
export function UiProvider({ children }) {
  const [profileOpen, setProfileOpen] = useState(false);

  const openProfile = useCallback(() => setProfileOpen(true), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);

  const value = useMemo(
    () => ({ profileOpen, openProfile, closeProfile }),
    [profileOpen, openProfile, closeProfile]
  );

  return (
    <UiContext.Provider value={value}>
      {children}
      <ProfileSheet open={profileOpen} onClose={closeProfile} />
    </UiContext.Provider>
  );
}

export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error("useUi harus dipakai di dalam UiProvider");
  }
  return context;
}

export default UiContext;
