import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useBulkImportCouponsMutation, useBulkImportJobStatusQuery } from '@/hooks/useCoupons';
import { extractApiErrorMessage } from '@/utils/apiError';
import { SitemapRoute } from '@/utils/routes';

export const CouponBulkImportPage = () => {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const queryClient = useQueryClient();

  const startMutation = useBulkImportCouponsMutation();
  const { data: job } = useBulkImportJobStatusQuery(jobId);

  useEffect(() => {
    if (job?.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    }
  }, [job?.status, queryClient]);

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setJobId(null);
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Choose a CSV file first');
      return;
    }
    startMutation.mutate(file, {
      onSuccess: ({ jobId: newJobId }) => {
        setJobId(newJobId);
        toast.success('Import started');
      },
      onError: (err) => toast.error(extractApiErrorMessage(err)),
    });
  };

  const isProcessing = job?.status === 'processing';
  const isCompleted = job?.status === 'completed';
  const percent = job && job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bulk import coupons</h1>
        <Link to={SitemapRoute.ADMIN_COUPONS} className="text-sm text-[var(--color-text-muted)] hover:underline">
          Back to coupons
        </Link>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="mb-3 text-sm text-[var(--color-text-muted)]">
          CSV columns: <code>code,discountType,discountValue,maxUses,perUserLimit,expiresAt</code>
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="mb-4 block w-full text-sm disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || startMutation.isPending || isProcessing}
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {startMutation.isPending ? 'Starting…' : isProcessing ? 'Importing…' : 'Import'}
        </button>
      </div>

      {job && (
        <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>Job <code>{job.jobId}</code></span>
            <span className="capitalize">{job.status}</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-sm">
            {job.processed} / {job.total} rows processed
            {isCompleted && ` — ${job.successCount} succeeded, ${job.failCount} failed`}
          </p>

          {isCompleted && job.errors?.length > 0 && (
            <table className="mt-3 w-full text-left text-xs">
              <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="py-1 pr-2">Row</th>
                  <th className="py-1 pr-2">Code</th>
                  <th className="py-1">Error</th>
                </tr>
              </thead>
              <tbody>
                {job.errors.map((e, idx) => (
                  <tr key={idx} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-1 pr-2">{e.row ?? '—'}</td>
                    <td className="py-1 pr-2 font-mono">{e.code ?? '—'}</td>
                    <td className="py-1 text-[var(--color-danger)]">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};