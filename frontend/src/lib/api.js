/**
 * @file api.js
 * @description Modul klien HTTP Axios yang dikonfigurasi khusus dengan URL dasar API,
 * header tipe konten, serta interceptor request/response untuk otentikasi Bearer Token
 * dan penanganan kedaluwarsa sesi (session timeout) otomatis.
 */

import axios from 'axios';

const SESSION_LIFETIME = 60 * 60 * 1000; // 60 menit dalam milidetik (sama dengan SESSION_LIFETIME admin)

/**
 * Memeriksa aktivitas terakhir pengguna untuk mendeteksi session timeout.
 * Jika waktu tenggang habis, token dihapus dan pengguna dialihkan ke login.
 *
 * @returns {boolean} True jika sesi masih valid atau belum memiliki token, False jika kedaluwarsa.
 */
const checkAndUpdateActivity = () => {
  const token = localStorage.getItem('simpeg_token');
  const lastActivity = localStorage.getItem('simpeg_last_activity');
  
  if (token && lastActivity) {
    if (Date.now() - Number(lastActivity) > SESSION_LIFETIME) {
      localStorage.removeItem('simpeg_token');
      localStorage.removeItem('simpeg_user');
      localStorage.removeItem('simpeg_last_activity');
      window.location.href = '/login';
      return false;
    }
  }
  
  if (token) {
    localStorage.setItem('simpeg_last_activity', Date.now().toString());
  }
  return true;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Interceptor for requests
api.interceptors.request.use(
  (config) => {
    const isValid = checkAndUpdateActivity();
    if (!isValid) {
      return Promise.reject(new Error('Session expired'));
    }
    
    const token = localStorage.getItem('simpeg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses
api.interceptors.response.use(
  (response) => {
    if (localStorage.getItem('simpeg_token')) {
      localStorage.setItem('simpeg_last_activity', Date.now().toString());
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, clear token and redirect to login
      localStorage.removeItem('simpeg_token');
      localStorage.removeItem('simpeg_user');
      localStorage.removeItem('simpeg_last_activity');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
