/**
 * @file DashboardPage.jsx
 * @description Halaman gerbang utama Dashboard. Berfungsi untuk merutekan tampilan dashboard 
 * berdasarkan peran (role) pengguna yang sedang aktif (Kepala Sekolah atau Pegawai).
 */

import { useAuthStore } from '../stores/authStore';
import PegawaiDashboard from './pegawai/PegawaiDashboard';
import KepsekDashboard from './kepsek/KepsekDashboard';

/**
 * Komponen halaman Dashboard utama.
 * Memeriksa peran pengguna aktif dan merender dashboard yang sesuai.
 * 
 * @returns {React.ReactElement} Tampilan dashboard untuk peran yang bersangkutan.
 */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role?.role_name || 'pegawai';

  if (role === 'kepala_sekolah') {
    return <KepsekDashboard />;
  }

  return <PegawaiDashboard />;
}
