import { api } from './api';

// Shared namespace — auth required, any role. Matches
// routes/redemptionRouter.js at /api/redemptions.
export const redeemCoupon = async (payload) => {
  const { data } = await api.post('/redemptions/redeem', payload);
  return data.data;
};

export const fetchMyRedemptions = async (params) => {
  const { data } = await api.get('/redemptions/my', { params });
  return data.data; // { redemptions, pagination }
};

// Admin namespace — matches routes/adminRedemptionRouter.js at
// /api/admin/redemptions.
export const fetchRedemptionById = async (id) => {
  const { data } = await api.get(`/admin/redemptions/${id}`);
  return data.data;
};

export const revertRedemption = async (id) => {
  const { data } = await api.patch(`/admin/redemptions/${id}/revert`);
  return data.data;
};
