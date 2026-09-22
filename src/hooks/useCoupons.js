import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCoupons,
  fetchCouponById,
  createCoupon,
  updateCoupon,
  pauseCoupon,
  bulkImportCoupons,
  fetchBulkImportJobStatus
} from '@/services/coupons';

// queryKey includes the filter params so the cache splits correctly per
// the API doc's rule: "same key, same cached result... when any filter or
// param changes, add it to the key".
export const useCouponsQuery = (params) =>
  useQuery({
    queryKey: ['coupons', params],
    queryFn: () => fetchCoupons(params),
  });

export const useCouponQuery = (id) =>
  useQuery({
    queryKey: ['coupons', id],
    queryFn: () => fetchCouponById(id),
    enabled: !!id,
  });

export const useCreateCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
};

export const useUpdateCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
};

export const usePauseCouponMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pauseCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
};

export const useBulkImportCouponsMutation = () =>
  useMutation({
    mutationFn: bulkImportCoupons,
  });

export const useBulkImportJobStatusQuery = (jobId) =>
  useQuery({
    queryKey: ['couponImportJob', jobId],
    queryFn: () => fetchBulkImportJobStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'processing' ? 800 : false;
    },
  });