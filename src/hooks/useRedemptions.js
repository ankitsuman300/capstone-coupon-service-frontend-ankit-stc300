import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  redeemCoupon,
  fetchMyRedemptions,
  fetchRedemptionById,
  revertRedemption,
} from '@/services/redemptions';

export const useMyRedemptionsQuery = (params) =>
  useQuery({
    queryKey: ['myRedemptions', params],
    queryFn: () => fetchMyRedemptions(params),
  });

export const useRedemptionQuery = (id) =>
  useQuery({
    queryKey: ['redemptions', id],
    queryFn: () => fetchRedemptionById(id),
    enabled: !!id,
  });

export const useRedeemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: redeemCoupon,
    onSuccess: () => {
      // A successful redemption changes the customer's own history AND
      // (indirectly, via usedCount) every coupon list an admin might be
      // looking at, so both caches are invalidated.
      queryClient.invalidateQueries({ queryKey: ['myRedemptions'] });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export const useRevertRedemptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revertRedemption,
    onSuccess: (_data, redemptionId) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions', redemptionId] });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['myRedemptions'] });
    },
  });
};
