import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

/**
 * Confirmation dialog (delete / destructive actions).
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  danger = true,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            danger ? 'bg-red-500/15 text-red-400' : 'bg-accent-500/15 text-accent-400'
          }`}
        >
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm leading-relaxed text-zinc-300">{message}</p>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
