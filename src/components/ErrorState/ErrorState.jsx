import { extractApiErrorMessage } from '@/utils/apiError';

export const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] py-12 text-center">
    <p className="font-medium text-[var(--color-danger)]">
      {extractApiErrorMessage(error)}
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-sm font-medium hover:bg-[var(--color-bg)]"
      >
        Try again
      </button>
    )}
  </div>
);
