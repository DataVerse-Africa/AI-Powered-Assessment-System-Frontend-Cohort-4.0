// src/api/axios.js
// ═══════════════════════════════════════════════════════════════════
//  Axios configuration — shared HTTP client for all API calls
//
//  What this does:
//    1. Sets the base URL so every call goes to http://127.0.0.1:8000
//    2. Injects the JWT token automatically on every request
//    3. Handles 401 responses globally (redirect to login)
//
//  Usage in any component:
//    import api from '../api/axios';
//    const res = await api.get('/api/user/profile');
//    const res = await api.post('/api/sessions/', { ... });
// ═══════════════════════════════════════════════════════════════════

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://patient-assessment-api.interviewprepai.org',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach JWT token ──────────────────────────
// Runs before every request is sent.
// Reads the token from sessionStorage (where AuthContext stores it)
// and adds it to the Authorization header.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle auth errors globally ─────────────
// Runs after every response is received.
// If we get a 401 (Unauthorized), clear stored auth and redirect to login.
// This catches expired tokens without having to check in every component.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid — clear everything and send to login
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      // Only redirect if not already on an auth page
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
