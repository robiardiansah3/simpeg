/**
 * @file MainLayout.jsx
 * @description Komponen layout utama (shell) aplikasi SIMPEG. Menyediakan tata letak
 * sidebar navigasi responsif (mobile/desktop) yang disesuaikan dengan hak akses (role) user,
 * serta bar navigasi atas (topbar) dengan dropdown menu profil.
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, Calendar, MapPin,
  Menu, LogOut, X, ClipboardList, CheckSquare, User, Users, ChevronDown
} from 'lucide-react';
import api from '../../lib/api';

// =====================================================================
// MENU NAVIGASI PER ROLE
// =====================================================================
const menuItems = [
  // Menu Pegawai 
  { name: 'Dashboard',               path: '/dashboard',             icon: LayoutDashboard, roles: ['pegawai', 'kepala_sekolah'] },
  { name: 'Profil Saya',             path: '/profile',               icon: User,            roles: ['pegawai', 'kepala_sekolah'] },
  { name: 'Absensi',                 path: '/absensi',               icon: MapPin,          roles: ['pegawai'] },
  { name: 'Usulan Cuti',             path: '/cuti',                  icon: Calendar,        roles: ['pegawai'] },
  { name: 'Usulan Kenaikan Pangkat', path: '/ukp',                   icon: FileText,        roles: ['pegawai'] },
  { name: 'Riwayat Pengajuan',       path: '/riwayat-pengajuan',     icon: ClipboardList,   roles: ['pegawai'] },
  // Menu Kepala Sekolah
  { name: 'Absensi',                 path: '/absensi',               icon: MapPin,          roles: ['kepala_sekolah'] },
  { name: 'Verifikasi UKP',          path: '/verifikasi-ukp',        icon: CheckSquare,     roles: ['kepala_sekolah'] },
  { name: 'Verifikasi Cuti',         path: '/verifikasi-cuti',       icon: Calendar,        roles: ['kepala_sekolah'] },
  { name: 'Daftar Pegawai',          path: '/daftar-pegawai',        icon: Users,           roles: ['kepala_sekolah'] },
  { name: 'Daftar Absen',            path: '/daftar-absen',          icon: ClipboardList,   roles: ['kepala_sekolah'] },
];

/**
 * Menghasilkan inisial nama singkat (maksimal 2 huruf) untuk avatar profil.
 *
 * @param {string} name Nama lengkap.
 * @returns {string} Inisial huruf kapital.
 */
function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/**
 * MainLayout Component
 * Render cangkang (layout) navigasi utama dengan slot `<Outlet />` untuk konten halaman.
 *
 * @returns {JSX.Element}
 */
export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [jabatan, setJabatan] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  let role = user?.role?.role_name || 'pegawai';
  if (['guru', 'tata_usaha'].includes(role)) {
    role = 'pegawai';
  }
  const allowedMenus = menuItems.filter(m => m.roles.includes(role));
  const activeMenu = allowedMenus.find(m =>
    m.path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(m.path)
  );
  const pageTitle = activeMenu?.name ?? 'Dashboard';

  // Ambil jabatan dari API
  useEffect(() => {
    api.get('/profile')
      .then(res => {
        const peg = res.data?.data?.pegawai;
        setJabatan(peg?.jabatan || '');
      })
      .catch(() => setJabatan(''));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setShowProfileDropdown(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 font-sans text-slate-700">

      {/* Overlay Mobile (Slide-over background blur) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* ══════════════════════════ SIDEBAR ══════════════════════════ */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--sidebar-bg)] text-slate-205 flex flex-col shrink-0 overflow-hidden shadow-[4px_0_10px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        <div className="h-[72px] shrink-0 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/logo.png"
              alt="Logo SMA Muhammadiyah 2 Metro"
              className="w-[38px] h-[38px] object-contain flex-shrink-0"
            />
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[13px] font-bold text-white tracking-[0.02em] leading-[1.2] uppercase truncate">
                SMA Muhammadiyah 2
              </span>
              <span className="text-[10px] font-medium text-white/60 tracking-[0.05em] uppercase leading-[1.5]">
                Metro
              </span>
            </div>
          </div>

          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1 scrollbar-thin">
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-[0.05em] text-white/45 uppercase pl-3 pr-0 mb-[10px]">
              {role === 'kepala_sekolah' ? 'MENU KEPALA SEKOLAH' : 'MENU PEGAWAI'}
            </div>

            {allowedMenus.map(item => {
              const Icon = item.icon;
              const isActive = item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    group flex items-center gap-3 px-[14px] py-[10px] rounded-[8px] text-[13px] font-medium transition-all duration-200 relative
                    ${isActive 
                      ? 'bg-[var(--sidebar-active-bg)] font-semibold shadow-md shadow-blue-500/5' 
                      : 'hover:bg-[var(--sidebar-hover-bg)]'}
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[18px] w-[4px] bg-[#60a5fa] rounded-r" />
                  )}
                  <Icon 
                    className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-[var(--sidebar-icon-active)]' : 'text-[var(--sidebar-icon)] group-hover:text-white'}`} 
                    size={18} 
                  />
                  <span className={isActive ? 'text-[var(--sidebar-active-text)]' : 'text-[var(--sidebar-text)] group-hover:text-white transition-colors duration-200'}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button 
            className="group flex items-center gap-3 w-full px-[14px] py-[10px] bg-transparent hover:bg-[rgba(239,68,68,0.15)] text-[var(--sidebar-text)] hover:text-[#fca5a5] rounded-[8px] text-[13px] font-medium transition-all duration-200 cursor-pointer"
            onClick={logout}
          >
            <LogOut size={20} className="shrink-0 text-[var(--sidebar-icon)] group-hover:text-[#fca5a5] transition-colors duration-200" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════ KONTEN UTAMA ══════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Topbar / Header */}
        <header className="h-[72px] shrink-0 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between z-30 gap-3">
          
          {/* Left Side: Burger Menu & Title */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 border border-slate-100 hover:text-slate-800 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka Sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">{pageTitle}</h1>
          </div>

          {/* Right Side: Actions & Profile */}
          <div className="flex items-center gap-4">

            {/* User Profile Card Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center gap-3 px-3 py-1.5 border border-slate-100 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileDropdown(!showProfileDropdown);
                }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'Pegawai'}</span>
                  <span className="text-xs text-slate-400 leading-none mt-0.5">
                    {jabatan || (role === 'kepala_sekolah' ? 'Kepala Sekolah' : 'Pegawai')}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <User size={15} />
                    <span>Profil Saya</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button 
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium cursor-pointer"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      logout();
                    }}
                  >
                    <LogOut size={15} />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content Area */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-8 bg-slate-50/50 scrollbar-thin">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
