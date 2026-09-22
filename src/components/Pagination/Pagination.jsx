// Pure presentational component: takes plain props, renders, owns no
// state or fetching of its own (Component Conventions: "container owns
// data fetching, presentational hands plain props").
export const Pagination = ({ page, limit, totalCount, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3 text-sm">
      <span className="text-[var(--color-text-muted)]">
        Page {page} of {totalPages} · {totalCount} total
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-[var(--color-border)] px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-[var(--color-border)] px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};
