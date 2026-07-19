import Modal from './Modal'
import LoadingButton from './LoadingButton'

/**
 * In-app confirm dialog — replaces window.confirm (which shows "localhost").
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  danger = true,
}) {
  return (
    <Modal open={open} onClose={() => !loading && onClose()} title={title} size="sm">
      <div className="space-y-5">
        <p className="text-sm text-slate-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn-ghost"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <LoadingButton
            loading={loading}
            onClick={onConfirm}
            className={
              danger
                ? 'btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                : 'btn-primary'
            }
          >
            {confirmLabel}
          </LoadingButton>
        </div>
      </div>
    </Modal>
  )
}
