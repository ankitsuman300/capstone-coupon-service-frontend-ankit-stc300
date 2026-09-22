import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCouponsQuery, usePauseCouponMutation } from '@/hooks/useCoupons';
import { LoadingState, ErrorState, EmptyState, Pagination, ConfirmDialog } from '@/components';
import { SitemapRoute, buildRoute } from '@/utils/routes';
import { extractApiErrorMessage } from '@/utils/apiError';

const statusBadgeClass = (status) =>
  status === 'ACTIVE'
    ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
    : 'bg-[var(--color-border)] text-[var(--color-text-muted)]';

export const CouponListPage = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pendingPauseId, setPendingPauseId] = useState(null);
  const limit = 10;

  const params = { page, limit, sort, ...(search && { search }), ...(status && { status }) };
  const { data, isLoading, isError, error, refetch } = useCouponsQuery(params);
  const pauseMutation = usePauseCouponMutation();

  const handlePauseConfirm = () => {
    pauseMutation.mutate(pendingPauseId, {
      onSuccess: () => {
        toast.success('Coupon paused');
        setPendingPauseId(null);
      },
      onError: (err) => {
        toast.error(extractApiErrorMessage(err));
        setPendingPauseId(null);
      },
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Coupons</h1>
        <Link
          to={SitemapRoute.ADMIN_COUPON_NEW}
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          New coupon
        </Link>

        <Link
  to={SitemapRoute.ADMIN_COUPON_BULK_IMPORT}
  className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium"
>
  Bulk import
</Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by code…"
          className="rounded-md border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
        >
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="-usedCount">Most redeemed</option>
          <option value="code">Code A–Z</option>
        </select>
      </div>

      {isLoading && <LoadingState label="Loading coupons…" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {!isLoading && !isError && (!data?.coupons || data.coupons.length === 0) && (
        <EmptyState
          title="No coupons match your filters"
          description={search || status ? 'Try clearing the search or status filter.' : 'Create your first coupon to get started.'}
        />
      )}

      {!isLoading && !isError && data?.coupons?.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-2 font-medium">Code</th>
                <th className="px-4 py-2 font-medium">Discount</th>
                <th className="px-4 py-2 font-medium">Used / Max</th>
                <th className="px-4 py-2 font-medium">Expires</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-2 font-mono">{coupon.code}</td>
                  <td className="px-4 py-2">
                    {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </td>
                  <td className="px-4 py-2">{coupon.usedCount} / {coupon.maxUses}</td>
                  <td className="px-4 py-2 text-[var(--color-text-muted)]">
                    {new Date(coupon.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(coupon.status)}`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-3">
                      <Link
                        to={buildRoute(SitemapRoute.ADMIN_COUPON_EDIT, { id: coupon._id })}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        Edit
                      </Link>
                      {coupon.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => setPendingPauseId(coupon._id)}
                          className="text-[var(--color-danger)] hover:underline"
                        >
                          Pause
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            limit={limit}
            totalCount={data.pagination?.totalCount || 0}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!pendingPauseId}
        title="Pause this coupon?"
        description="Customers won't be able to redeem it anymore. This doesn't affect past redemptions."
        confirmLabel="Pause"
        danger
        onConfirm={handlePauseConfirm}
        onCancel={() => setPendingPauseId(null)}
      />
    </div>
  );
};
