import { api } from './api';

// Admin-only — matches routes/userRouter.js's CRUD routes at /api/users,
// gated by requireRole("admin") on the backend.
export const fetchUsers = async (params) => {
  const { data } = await api.get('/users', { params });
  return data.data; // { users, pagination }
};

export const createUser = async (payload) => {
  const { data } = await api.post('/users', payload);
  return data.data;
};

export const updateUser = async ({ id, payload }) => {
  const { data } = await api.put(`/users/${id}`, payload);
  return data.data;
};

export const deactivateUser = async (id) => {
  const { data } = await api.put(`/users/${id}`, { isActive: false });
  return data.data;
};
