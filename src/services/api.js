import axios from 'axios';

/**
 * Axios instance configured to proxy through CRA dev server to backend.
 *
 * CRA "proxy" in package.json routes  /api/*  →  http://localhost:5000/api/*
 * So baseURL '/api' is correct — do NOT use http://localhost:5000/api here,
 * as that would bypass the proxy and cause CORS errors in development.
 */
const api = axios.create({
  baseURL: 'https://healthcare-backend-njau.onrender.com/api',
  timeout: 15000, // 15s — avoids silent hangs if backend is down
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('telemedicine_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please check if the backend server is running.';
    }
    if (error.response?.status === 401) {
      // Only auto-redirect if it's not a login/register attempt
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('telemedicine_token');
        localStorage.removeItem('telemedicine_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
