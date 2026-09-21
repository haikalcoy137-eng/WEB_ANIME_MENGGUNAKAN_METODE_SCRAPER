import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import BottomNav, { SideNav } from "./components/BottomNav";
import { ToastProvider } from "./context/ToastContext";
import { UiProvider } from "./context/UiContext";
import { UserDataProvider } from "./context/UserDataContext";
import AnimeDetail from "./pages/AnimeDetail";
import History from "./pages/History";
import Home from "./pages/Home";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import Watch from "./pages/Watch";

/** Kembalikan posisi scroll ke atas setiap pindah halaman. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

/**
 * Layout aplikasi (PRD 5, 6, 23):
 * - mobile & tablet: bottom navigation
 * - desktop        : sidebar kiri
 */
function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <SideNav />

      <div className="app-main">
        {/* key = pathname -> transisi halaman ringan (PRD 25) */}
        <div className="page-transition" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/anime/:slug" element={<AnimeDetail />} />
            <Route path="/watch/:episodeSlug" element={<Watch />} />
            <Route path="/library" element={<Library />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserDataProvider>
        <ToastProvider>
          <UiProvider>
            <ScrollToTop />
            <AppLayout />
          </UiProvider>
        </ToastProvider>
      </UserDataProvider>
    </BrowserRouter>
  );
}
