import { api } from './api';

// Admin namespace (auth + admin role required) — matches
// routes/couponRouter.js mounted at /api/admin/coupons on the backend.
export const fetchCoupons = async (params) => {
  const { data } = await api.get('/admin/coupons', { params });
  return data.data; // { coupons, pagination }
};

export const fetchCouponById = async (id) => {
  const { data } = await api.get(`/admin/coupons/${id}`);
  return data.data;
};

export const createCoupon = async (payload) => {
  const { data } = await api.post('/admin/coupons', payload);
  return data.data;
};

export const updateCoupon = async ({ id, payload }) => {
  const { data } = await api.put(`/admin/coupons/${id}`, payload);
  return data.data;
};

export const pauseCoupon = async (id) => {
  const { data } = await api.delete(`/admin/coupons/${id}`);
  return data.data;
};

export const fetchCouponAnalytics = async (params) => {
  const { data } = await api.get('/admin/coupons/analytics', { params });
  return data.data; // { topCoupons, summary }
};


// Starts an import job — the backend returns immediately with a jobId
// rather than waiting for the whole CSV to finish (202 Accepted).
export const bulkImportCoupons = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/admin/coupons/bulk-import', formData);
  return data.data; // { jobId }
};

// Polled repeatedly while a job is processing.
export const fetchBulkImportJobStatus = async (jobId) => {
  const { data } = await api.get(`/admin/coupons/bulk-import/${jobId}/status`);
  return data.data; // { jobId, status, total, processed, successCount, failCount, errors }
};