import axios from 'axios';

// base URL, credentials, headers.

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// The backend also accepts the access token as an Authorization header
// (middlewares/auth.js checks the header first, then falls back to the
// cookie) 

let inMemoryAccessToken = null;
export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

api.interceptors.request.use((config) => {
  if (inMemoryAccessToken) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute =
      originalRequest?.url?.includes('/users/login') ||
      originalRequest?.url?.includes('/users/update-refresh-access');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        refreshPromise =
          refreshPromise ||
          api.put('/users/update-refresh-access').finally(() => {
            refreshPromise = null;
          });
        const { data } = await refreshPromise;
        setAccessToken(data?.data?.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
