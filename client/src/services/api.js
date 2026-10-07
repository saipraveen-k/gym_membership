import axios from 'axios';

/**
 * Axios instance for the Gym Membership API.
 * Uses Vite's dev proxy (/api -> http://localhost:5000) in development.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export const TOKEN_KEY = 'gym_token';
export const USER_KEY = 'gym_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const storeSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors and clear session on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'Request timed out. Is the backend running?'
        : error.message === 'Network Error'
          ? 'Cannot reach the server. Please make sure the backend is running.'
          : 'Something went wrong. Please try again.');

    const normalized = new Error(message);
    normalized.status = status;
    normalized.data = error.response?.data;

    if (status === 401) {
      clearSession();
      // Let AuthContext react via storage-like event
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(normalized);
  }
);

export default api;
