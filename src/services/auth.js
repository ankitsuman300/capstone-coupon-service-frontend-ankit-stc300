import { api } from './api';

export const loginUser = async ({ identifier, password }) => {
  const { data } = await api.post('/users/login', { identifier, password });
  return data.data; // { accessToken, refreshToken, user }
};

export const logoutUser = async () => {
  const { data } = await api.delete('/users/logout');
  return data.data;
};
