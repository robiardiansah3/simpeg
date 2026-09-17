/**
 * @file authStore.js
 * @description State management store menggunakan Zustand untuk kebutuhan autentikasi,
 * penyimpanan token, informasi akun user aktif, penanganan remember-me, dan sinkronisasi sesi.
 */

import { create } from 'zustand';
import api from '../lib/api';

const SESSION_LIFETIME = 60 * 60 * 1000; // 60 menit dalam milidetik (sama dengan SESSION_LIFETIME admin)

/**
 * Memverifikasi validitas sesi autentikasi berdasarkan data penyimpanan lokal (localStorage).
 * Melakukan auto-logout jika sesi pengguna telah kedaluwarsa.
 *
 * @returns {object} Status awal autentikasi (token, user, isAuthenticated).
 */
const checkSessionValidity = () => {
  const token = localStorage.getItem('simpeg_token');
  const lastActivity = localStorage.getItem('simpeg_last_activity');
  const remember = localStorage.getItem('simpeg_remember') === 'true';
  
  if (token && lastActivity) {
    if (!remember && (Date.now() - Number(lastActivity) > SESSION_LIFETIME)) {
      localStorage.removeItem('simpeg_token');
      localStorage.removeItem('simpeg_user');
      localStorage.removeItem('simpeg_last_activity');
      localStorage.removeItem('simpeg_remember');
      return { token: null, user: null, isAuthenticated: false };
    } else {
      localStorage.setItem('simpeg_last_activity', Date.now().toString());
    }
  } else if (token && !lastActivity) {
    localStorage.setItem('simpeg_last_activity', Date.now().toString());
  }
  
  try {
    const userStr = localStorage.getItem('simpeg_user');
    return {
      token: token || null,
      user: userStr ? JSON.parse(userStr) : null,
      isAuthenticated: !!token,
    };
  } catch (e) {
    return { token: null, user: null, isAuthenticated: false };
  }
};

const initialSession = checkSessionValidity();

/**
 * useAuthStore Store
 * Store global autentikasi pengguna SIMPEG.
 */
export const useAuthStore = create((set) => ({
  user: initialSession.user,
  token: initialSession.token,
  isAuthenticated: initialSession.isAuthenticated,
  isLoading: false,
  error: null,

  /**
   * Melakukan login ke sistem dengan memverifikasi kredensial ke API.
   * Menyimpan token dan data pengguna ke localStorage serta state store.
   *
   * @param {string} email Email pengguna.
   * @param {string} password Kata sandi pengguna.
   * @param {boolean} [remember=false] Opsi untuk mempertahankan sesi login lebih lama.
   * @returns {Promise<boolean>} True jika login berhasil, False jika gagal.
   */
  login: async (email, password, remember = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/login', { email, password });
      const { user, access_token } = response.data;

      localStorage.setItem('simpeg_token', access_token);
      localStorage.setItem('simpeg_user', JSON.stringify(user));
      localStorage.setItem('simpeg_last_activity', Date.now().toString());
      
      if (remember) {
        localStorage.setItem('simpeg_remember', 'true');
      } else {
        localStorage.removeItem('simpeg_remember');
      }

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Mengakhiri sesi login pengguna aktif dan membersihkan seluruh data autentikasi lokal.
   *
   * @returns {Promise<void>}
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error API:', error);
    } finally {
      localStorage.removeItem('simpeg_token');
      localStorage.removeItem('simpeg_user');
      localStorage.removeItem('simpeg_last_activity');
      localStorage.removeItem('simpeg_remember');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      window.location.href = '/login';
    }
  },

  /**
   * Mengambil data profil terbaru pengguna aktif dari API dan memperbarui state lokal.
   *
   * @returns {Promise<void>}
   */
  fetchProfile: async () => {
    try {
      const response = await api.get('/me');
      const user = response.data;
      localStorage.setItem('simpeg_user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  }
}));
