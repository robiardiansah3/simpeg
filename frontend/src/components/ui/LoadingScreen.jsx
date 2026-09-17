/**
 * @file LoadingScreen.jsx
 * @description Komponen layar pemuatan (loading screen) global.
 * Ditampilkan saat proses inisialisasi aplikasi atau selama lazy loading halaman berlangsung.
 */

import { Loader2 } from 'lucide-react';

/**
 * LoadingScreen Component
 * Render animasi pemuatan dengan logo sekolah dan ikon pemutar.
 *
 * @returns {JSX.Element}
 */
export default function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans">
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <img
          src="/logo.png"
          alt="Logo SMA Muhammadiyah 2 Metro"
          className="w-16 h-16 object-contain mb-4 animate-pulse"
        />
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-[#2E3182]" />
          <span>Memuat halaman...</span>
        </div>
      </div>
    </div>
  );
}
