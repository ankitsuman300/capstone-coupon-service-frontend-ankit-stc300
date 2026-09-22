export const EmptyState = ({ title = 'Nothing here yet', description, action }) => (
  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
    <p className="font-medium text-[var(--color-text)]">{title}</p>
    {description && <p className="text-sm text-[var(--color-text-muted)]">{description}</p>}
    {action}
  </div>
);
