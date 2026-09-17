/**
 * @file AppRouter.jsx
 * @description Pengaturan routing aplikasi web SIMPEG menggunakan React Router.
 * Menyediakan pengamanan rute (protected routes) bagi pengguna terautentikasi dan pembagian kode (code splitting) via lazy loading.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import MainLayout from '../components/layouts/MainLayout';
import LoadingScreen from '../components/ui/LoadingScreen';

// Lazy loading halaman-halaman utama untuk mengoptimalkan kinerja loading awal aplikasi
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const InformasiPersyaratanPage = lazy(() => import('../pages/pegawai/InformasiPersyaratanPage'));
const InformasiPersyaratanDetailPage = lazy(() => import('../pages/pegawai/InformasiPersyaratanDetailPage'));
const RiwayatPengajuanPage = lazy(() => import('../pages/pegawai/RiwayatPengajuanPage'));
const VerifikasiUKPPage = lazy(() => import('../pages/kepsek/VerifikasiUKPPage'));
const UKPPage = lazy(() => import('../pages/pegawai/UKPPage'));
const VerifikasiCutiPage = lazy(() => import('../pages/kepsek/VerifikasiCutiPage'));
const AbsensiPage = lazy(() => import('../pages/pegawai/AbsensiPage'));
const CutiPage = lazy(() => import('../pages/pegawai/CutiPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const DaftarPegawaiPage = lazy(() => import('../pages/kepsek/DaftarPegawaiPage'));
const DaftarAbsenPage = lazy(() => import('../pages/kepsek/DaftarAbsenPage'));

/**
 * ProtectedRoute Component
 * Membatasi akses rute hanya untuk pengguna yang telah login.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * PublicRoute Component
 * Membatasi akses rute khusus untuk pengguna yang belum login (misal halaman login).
 * Jika sudah login, akan dialihkan ke dashboard.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

/**
 * AppRouter Component
 * Mengatur perutean utama aplikasi dan menyusun layout global (MainLayout).
 *
 * @returns {JSX.Element}
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="informasi-persyaratan" element={<InformasiPersyaratanPage />} />
            <Route path="informasi-persyaratan/:id" element={<InformasiPersyaratanDetailPage />} />
            <Route path="riwayat-pengajuan" element={<RiwayatPengajuanPage />} />
            <Route path="ukp" element={<UKPPage />} />
            <Route path="verifikasi-ukp" element={<VerifikasiUKPPage />} />
            <Route path="cuti" element={<CutiPage />} />
            <Route path="verifikasi-cuti" element={<VerifikasiCutiPage />} />
            <Route path="absensi" element={<AbsensiPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="daftar-pegawai" element={<DaftarPegawaiPage />} />
            <Route path="daftar-absen" element={<DaftarAbsenPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
