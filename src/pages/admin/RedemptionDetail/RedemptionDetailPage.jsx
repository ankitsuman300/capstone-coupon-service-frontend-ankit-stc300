import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useRedemptionQuery, useRevertRedemptionMutation } from '@/hooks/useRedemptions';
import { LoadingState, ErrorState, ConfirmDialog } from '@/components';
import { extractApiErrorMessage } from '@/utils/apiError';

const statusBadgeClass = (status) =>
  status === 'APPLIED'
    ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
    : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]';

export const RedemptionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: redemption, isLoading, isError, error, refetch } = useRedemptionQuery(id);
  const revertMutation = useRevertRedemptionMutation();

  if (isLoading) return <LoadingState label="Loading redemption…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const handleRevertConfirm = () => {
    revertMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Redemption reverted — the coupon slot has been freed up');
        setConfirmOpen(false);
      },
      onError: (err) => {
        toast.error(extractApiErrorMessage(err));
        setConfirmOpen(false);
      },
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-[var(--color-text-muted)] hover:underline"
      >
        ← Back
      </button>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold font-mono">{redemption?.couponId?.code || '—'}</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(redemption?.status)}`}>
            {redemption?.status}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-[var(--color-text-muted)]">Order id</dt>
          <dd className="text-right">{redemption?.orderId}</dd>

          <dt className="text-[var(--color-text-muted)]">Order amount</dt>
          <dd className="text-right">₹{redemption?.orderAmount}</dd>

          <dt className="text-[var(--color-text-muted)]">Discount</dt>
          <dd className="text-right">−₹{redemption?.discountAmount}</dd>

          <dt className="font-medium">Final amount</dt>
          <dd className="text-right font-medium">₹{redemption?.finalAmount}</dd>

          <dt className="text-[var(--color-text-muted)]">Redeemed by</dt>
          <dd className="text-right">
            {redemption?.userId?.name || redemption?.userId?.email || redemption?.userId || '—'}
          </dd>

          <dt className="text-[var(--color-text-muted)]">Redeemed on</dt>
          <dd className="text-right">
            {redemption?.createdAt ? new Date(redemption.createdAt).toLocaleString() : '—'}
          </dd>
        </dl>

        {redemption?.status === 'APPLIED' && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-6 w-full rounded-md border border-[var(--color-danger)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
          >
            Revert this redemption
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Revert this redemption?"
        description="This frees up the coupon slot (usedCount decreases by 1) and marks this redemption as REVERTED. This cannot be undone from here."
        confirmLabel="Revert"
        danger
        onConfirm={handleRevertConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
