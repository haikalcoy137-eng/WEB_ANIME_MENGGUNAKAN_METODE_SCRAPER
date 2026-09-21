import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import Icon from "../components/Icons";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

/** Halaman 404 — rute tidak dikenal. */
export default function NotFound() {
  useDocumentTitle("Halaman tidak ditemukan");

  return (
    <>
      <Header variant="back" title="Tidak Ditemukan" />

      <main className="page">
        <EmptyState
          icon="alert"
          title="Halaman tidak ditemukan"
          description="Tautan yang kamu buka tidak tersedia atau sudah berubah."
          action={
            <Link className="btn btn--primary" to="/">
              <Icon name="home" size={18} />
              <span>Kembali ke Home</span>
            </Link>
          }
        />
      </main>
    </>
  );
}
