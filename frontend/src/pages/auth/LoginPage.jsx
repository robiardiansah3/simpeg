/**
 * @file LoginPage.jsx
 * @description Komponen halaman login bagi pengguna SIMPEG. Menyediakan form input
 * untuk email/username, kata sandi, serta integrasi state autentikasi via Zustand.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(3, { message: 'Email atau username minimal 3 karakter' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  remember: z.boolean().optional(),
});

/**
 * LoginPage Component
 * Render form login dengan validasi sisi klien menggunakan react-hook-form dan Zod.
 *
 * @returns {JSX.Element} Halaman login interaktif.
 */
export default function LoginPage() {
  const { login, error } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    }
  });

  /**
   * Menangani pengiriman formulir login (submit) untuk memverifikasi pengguna.
   *
   * @param {object} data Data input formulir login.
   * @param {string} data.email Email pengguna.
   * @param {string} data.password Kata sandi pengguna.
   * @param {boolean} [data.remember] Opsi ingat saya.
   * @returns {Promise<void>}
   */
  const onSubmit = async (data) => {
    setIsLoading(true);
    await login(data.email, data.password, !!data.remember);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Panel Kiri — Branding (Hidden on mobile/tablet, flex on large screens) */}
      <div 
        className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 text-white" 
        style={{ background: 'linear-gradient(135deg, #1B2559 0%, #2E3182 50%, #3B4DB8 100%)' }}
      >
        <img
          src="/logo.png"
          alt="Logo SMA Muhammadiyah 2 Metro"
          className="w-28 h-28 object-contain"
          style={{ marginBottom: '1.5rem' }}
        />
        <h1 className="text-3xl font-bold text-center tracking-wide !text-white" style={{ marginBottom: '0.5rem' }}>
          SMA MUHAMMADIYAH 2 METRO
        </h1>
        <p className="text-sm !text-white/75 text-center font-light" style={{ marginBottom: '2.5rem' }}>
          Sistem Informasi Kepegawaian
        </p>

        {/* Fitur list to match admin login layout */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {[
            { icon: '📋', title: 'Kelola Absensi Harian' },
            { icon: '📅', title: 'Pengajuan Cuti Online' },
            { icon: '🏆', title: 'Usulan Kenaikan Pangkat' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3 bg-white/10 rounded-xl p-4 transition duration-200 hover:bg-white/15">
              <span className="text-2xl">{f.icon}</span>
              <span className="text-sm text-white/90 font-medium">{f.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel Kanan — Form Login */}
      <div className="flex-1 lg:w-[480px] lg:min-w-[440px] lg:flex-none bg-white flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          
          {/* Mobile Header (Shown on mobile, hidden on large screens) */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <img
              src="/logo.png"
              alt="Logo SMA Muhammadiyah 2 Metro"
              className="w-16 h-16 object-contain mb-3"
            />
            <h1 className="text-xl font-bold text-[#1E293B] text-center">
              SMA MUHAMMADIYAH 2 METRO
            </h1>
            <p className="text-xs text-[#64748B] text-center font-light">
              Sistem Informasi Kepegawaian
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block" style={{ marginBottom: '2rem' }}>
            <h2 className="text-2xl font-bold text-[#1E293B]" style={{ marginBottom: '0.5rem' }}>
              Selamat Datang 👋
            </h2>
            <p className="text-sm text-[#64748B]">
              Masuk ke akun SIMPEG Anda untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email / Username */}
            <div className="space-y-1.5">
              <label className="block text-sm font-normal text-slate-900">
                Email atau Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoComplete="email"
                {...register('email')}
                className={`w-full px-3 py-2 bg-white border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-[3px] focus:ring-red-500/15' : 'border-[#94a3b8] focus:border-[#2E3182] focus:ring-[3px] focus:ring-[#2E3182]/15'} rounded-md text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-sm`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 mt-1">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-normal text-slate-900">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`w-full pl-3 pr-10 py-2 bg-white border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-[3px] focus:ring-red-500/15' : 'border-[#94a3b8] focus:border-[#2E3182] focus:ring-[3px] focus:ring-[#2E3182]/15'} rounded-md text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 mt-1">
                  <AlertCircle size={12} /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="w-4 h-4 rounded text-[#2E3182] border-slate-300 focus:ring-[#2E3182] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-normal text-slate-600">Remember me</span>
              </label>
            </div>

            {/* Error API */}
            {error && (
              <div className="flex gap-3 items-start p-4 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-red-700 leading-normal">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#2E3182] hover:bg-[#1F2167] active:scale-[0.985] text-white rounded-md text-sm font-semibold shadow-[0_4px_6px_-1px_rgba(46,49,130,0.2),0_2px_4px_-1px_rgba(46,49,130,0.1)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="!mt-8 text-xs text-[#94A3B8] text-center">
            &copy; 2026 SIMPEG &mdash; SMA Muhammadiyah 2 Metro
          </div>
        </div>
      </div>
    </div>
  );
}
