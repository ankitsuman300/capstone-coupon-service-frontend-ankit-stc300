import { useEffect, useRef } from "react";

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  danger,
}) => {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    // if (!open) return null;
    confirmButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? 'confirm-dialog-description' : undefined}
    >
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl">
        <h3 id="confirm-dialog-title" className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
        {description && (
          <p id="confirm-dialog-description" className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium">
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${danger ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-primary)]'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};