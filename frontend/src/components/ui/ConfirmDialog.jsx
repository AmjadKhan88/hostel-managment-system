import Modal from './Modal.jsx';

/**
 * Confirmation dialog for destructive/irreversible-feeling actions.
 * Reused by later delete/status-change flows across the app.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  isLoading = false,
  danger = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-ink-muted">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-control border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`rounded-control px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
            danger ? 'bg-danger hover:bg-danger/90' : 'bg-brand-500 hover:bg-brand-600'
          }`}
        >
          {isLoading ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}