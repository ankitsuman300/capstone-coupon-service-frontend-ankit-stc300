import { useQuery } from '@tanstack/react-query';
import { fetchCouponAnalytics } from '@/services/coupons';

export const useCouponAnalyticsQuery = (params) =>
  useQuery({
    queryKey: ['analytics', params],
    queryFn: () => fetchCouponAnalytics(params),
  });
