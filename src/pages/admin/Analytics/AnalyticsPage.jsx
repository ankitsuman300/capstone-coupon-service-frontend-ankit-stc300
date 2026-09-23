import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCouponAnalyticsQuery } from '@/hooks/useAnalytics';
import { LoadingState, ErrorState, EmptyState } from '@/components';

export const AnalyticsPage = () => {
  const { data, isLoading, isError, error, refetch } = useCouponAnalyticsQuery({ limit: 10 });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Analytics</h1>

      {isLoading && <LoadingState label="Loading analytics…" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {!isLoading && !isError && data?.summary && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Total redemptions
            </p>
            <p className="mt-1 text-2xl font-semibold">{data.summary.totalRedemptions ?? 0}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Total discount given
            </p>
            <p className="mt-1 text-2xl font-semibold">₹{data.summary.totalDiscountValue ?? 0}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Active coupons redeemed
            </p>
            <p className="mt-1 text-2xl font-semibold">{data.summary.distinctCouponsUsed ?? data.topCoupons?.length ?? 0}</p>
          </div>
        </div>
      )}

      {!isLoading && !isError && (!data?.topCoupons || data.topCoupons.length === 0) && (
        <EmptyState
          title="No redemptions yet"
          description="Once customers start redeeming coupons, the top performers show up here."
        />
      )}

      {!isLoading && !isError && data?.topCoupons?.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">
            Top coupons by redemption count
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.topCoupons}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="code" stroke="var(--color-text-muted)" fontSize={12} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
              <Bar dataKey="redemptionCount" name="Redemptions" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
