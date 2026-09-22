import axios from 'axios';

// The one place that knows the wire: base URL, credentials, headers.
// Every other service file imports THIS instance rather than importing
// axios directly, so a change here (e.g. adding a default header) applies
// everywhere at once.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Lets the browser send the httpOnly access/refresh cookies the backend
  // sets on login across this cross-origin request. Without this, the
  // refresh-token flow silently breaks — mirrors the backend's own
  // `credentials: true` CORS config (config/cors.js).
  withCredentials: true,
});

// The backend also accepts the access token as an Authorization header
// (middlewares/auth.js checks the header first, then falls back to the
// cookie) — this interceptor attaches it from memory (see AuthContext) so
// requests work even in a tab where the cookie hasn't been set yet (e.g.
// right after a fresh login response, before the cookie round-trips).
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

// One 401 (expired access token) triggers exactly one silent refresh
// attempt, then retries the original request. `_retry` stops an infinite
// loop if the refresh itself also comes back 401 (refresh token expired /
// invalid — that's a real "please log in again", not something to retry).
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
