import { useState } from 'react';
import { useMyRedemptionsQuery } from '@/hooks/useRedemptions';
import { LoadingState, ErrorState, EmptyState, Pagination } from '@/components';

const statusBadgeClass = (status) =>
  status === 'APPLIED'
    ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
    : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]';

// This page hits GET /redemptions/my, which never accepts a userId from
// anywhere on the frontend — the backend derives it entirely from the
// caller's own token (see services/redemptions.js + the backend's
// getMyRedemptionsService). There is no prop or param on this page that
// could be changed to show someone else's history.
export const RedemptionHistoryPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = useMyRedemptionsQuery({ page, limit });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">My redemptions</h1>

      {isLoading && <LoadingState label="Loading your redemptions…" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {!isLoading && !isError && (!data?.redemptions || data.redemptions.length === 0) && (
        <EmptyState
          title="No redemptions yet"
          description="Redeem a coupon and it will show up here."
        />
      )}

      {!isLoading && !isError && data?.redemptions?.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-2 font-medium">Coupon</th>
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Discount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Redeemed</th>
              </tr>
            </thead>
            <tbody>
              {data.redemptions.map((redemption) => (
                <tr key={redemption._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-2 font-mono">{redemption.couponId?.code || '—'}</td>
                  <td className="px-4 py-2">{redemption.orderId}</td>
                  <td className="px-4 py-2">₹{redemption.discountAmount}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(redemption.status)}`}>
                      {redemption.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[var(--color-text-muted)]">
                    {new Date(redemption.createdAt).toLocaleDateString()}
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
    </div>
  );
};
