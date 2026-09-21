import Icon from "./Icons";

/** Notifikasi ringan di bagian bawah layar. */
export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className={`toast toast--${toast.tone || "default"}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast__message">{toast.message}</span>
      <button
        type="button"
        className="toast__close"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
      >
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}
