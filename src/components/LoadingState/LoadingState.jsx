export const LoadingState = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-3 py-16 text-[var(--color-text-muted)]">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
    <span>{label}</span>
  </div>
);
