/**
 * @file KepsekDashboard.jsx
 * @description Komponen halaman dashboard untuk Kepala Sekolah. Menyajikan ringkasan 
 * statistik pegawai, absensi hari ini, serta usulan cuti dan UKP yang membutuhkan tindakan.
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CalendarDays, Users, CheckSquare, Loader2, UserX,
  ArrowUpRight, Clock, ShieldCheck, Compass, UsersRound
} from 'lucide-react';
import api from '../../lib/api';

/**
 * KepsekDashboard Component
 * Render ringkasan data operasional sekolah serta notifikasi persetujuan usulan baru.
 *
 * @returns {JSX.Element} Halaman dashboard Kepala Sekolah.
 */
export default function KepsekDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [pegawais, setPegawais] = useState([]);
  const [cutis, setCutis] = useState([]);
  const [ukps, setUkps] = useState([]);
  const [absensis, setAbsensis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => {
        const summary = res.data?.data || {};
        setPegawais(summary.pegawais || []);
        setCutis(summary.cutis || []);
        setUkps(summary.ukps || []);
        setAbsensis(summary.absensis || []);
      })
      .catch(err => {
        console.error('Error loading dashboard summary:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAbsensis = absensis.filter(a => a.tanggal === todayStr);
  const presentCount = todayAbsensis.filter(a => a.status_kehadiran === 'hadir').length;

  const pendingCuti = cutis.filter(c => c.status === 'diteruskan');
  const pendingUkp = ukps.filter(u => u.status === 'diteruskan');  

  const pendingTasks = [
    ...pendingCuti.map(c => ({ id: `cuti-${c.id}`, type: 'Usulan Cuti', name: c.pegawai?.nama_lengkap || 'Pegawai', detail: c.jenis_cuti, date: c.created_at || c.tanggal_mulai, route: '/verifikasi-cuti' })),
    ...pendingUkp.map(u => ({ id: `ukp-${u.id}`, type: 'Kenaikan Pangkat', name: u.pegawai?.nama_lengkap || 'Pegawai', detail: `Masa Kerja: ${u.masa_kerja_tahun} Thn`, date: u.tanggal_diajukan || u.created_at, route: '/verifikasi-ukp' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── HEADER HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2E3192] to-[#1F2167] rounded-2xl p-6 md:p-8 text-white shadow-md border border-blue-900/30">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-blue-200 text-[10px] rounded-full font-bold uppercase tracking-wider mb-4 border border-white/10">
            Halaman Kepala Sekolah
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 leading-tight !text-white">
            Selamat Datang, {user?.name || 'Kepala Sekolah'}
          </h2>
          <p className="text-sm md:text-base font-light leading-relaxed !text-white/90">
            Pantau kehadiran pegawai hari ini, kelola berkas usulan kenaikan pangkat, dan setujui permohonan cuti guru/staf secara real-time.
          </p>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Pegawai */}
        <div className="bg-gradient-to-br from-blue-50/45 via-white to-white rounded-2xl border border-slate-200/60 p-6 flex items-center gap-5 shadow-sm hover:shadow-md hover:shadow-blue-100/40 hover:border-blue-200 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 bg-blue-100/70 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <UsersRound size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Pegawai</p>
            <h4 className="text-2xl font-black text-slate-800 leading-tight">{pegawais.length}</h4>
            <p className="text-[10px] font-semibold text-slate-400">Terdaftar di sistem</p>
          </div>
        </div>

        {/* Kehadiran Hari Ini */}
        <div className="bg-gradient-to-br from-emerald-50/45 via-white to-white rounded-2xl border border-slate-200/60 p-6 flex items-center gap-5 shadow-sm hover:shadow-md hover:shadow-emerald-100/40 hover:border-emerald-250 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 bg-emerald-100/70 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <CheckSquare size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Hadir Hari Ini</p>
            <h4 className="text-2xl font-black text-slate-800 leading-tight">
              {presentCount}<span className="text-sm font-bold text-slate-400"> / {pegawais.length}</span>
            </h4>
            <p className="text-[10px] font-semibold text-emerald-600">Pegawai sudah check-in</p>
          </div>
        </div>

        {/* Cuti Pending */}
        <div 
          onClick={() => navigate('/verifikasi-cuti')}
          className="bg-gradient-to-br from-amber-50/45 via-white to-white rounded-2xl border border-slate-200/60 p-6 flex items-center gap-5 shadow-sm hover:shadow-md hover:shadow-amber-100/40 hover:border-amber-300 transition-all duration-300 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 bg-amber-100/70 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <CalendarDays size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Persetujuan Cuti</p>
            <h4 className="text-2xl font-black text-slate-800 leading-tight">{pendingCuti.length}</h4>
            <p className="text-[10px] font-semibold text-amber-600">Menunggu verifikasi</p>
          </div>
        </div>

        {/* UKP Pending */}
        <div 
          onClick={() => navigate('/verifikasi-ukp')}
          className="bg-gradient-to-br from-purple-50/45 via-white to-white rounded-2xl border border-slate-200/60 p-6 flex items-center gap-5 shadow-sm hover:shadow-md hover:shadow-purple-100/40 hover:border-purple-300 transition-all duration-300 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-purple-600 bg-purple-100/70 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Persetujuan UKP</p>
            <h4 className="text-2xl font-black text-slate-800 leading-tight">{pendingUkp.length}</h4>
            <p className="text-[10px] font-semibold text-purple-600">Menunggu verifikasi</p>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT CONTENT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Kolom Kiri: Verifikasi Pending List (3 bagian/cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Menunggu Persetujuan Anda</h3>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full border border-blue-100">
                {pendingTasks.length} Usulan Baru
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Kolom Cuti */}
              <div className="flex flex-col gap-4 pr-0 md:pr-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex justify-between items-center mb-1">
                  <span>Usulan Cuti</span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[9px] font-bold border border-amber-100">
                    {pendingCuti.length} Pending
                  </span>
                </h4>
                {pendingCuti.length > 0 ? (
                  pendingCuti.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 hover:border-slate-200 transition-all duration-200 group">
                      <div className="min-w-0 flex-1 pr-2">
                        <h5 className="text-xs font-bold text-slate-800 truncate">{c.pegawai?.nama_lengkap || 'Pegawai'}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{c.jenis_cuti} ({c.jumlah_hari} hari)</p>
                        <p className="text-[9px] text-slate-400 mt-1">Diajukan: {new Date(c.created_at || c.tanggal_mulai).toLocaleDateString('id-ID')}</p>
                      </div>
                      <button
                        onClick={() => navigate('/verifikasi-cuti')}
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors shrink-0 cursor-pointer"
                      >
                        <span>Tinjau</span>
                        <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <ShieldCheck size={28} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Selesai Semua</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada usulan cuti baru.</p>
                  </div>
                )}
              </div>

              {/* Kolom UKP */}
              <div className="flex flex-col gap-4 pt-4 md:pt-0 pl-0 md:pl-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex justify-between items-center mb-1">
                  <span>Kenaikan Pangkat</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[9px] font-bold border border-purple-100">
                    {pendingUkp.length} Pending
                  </span>
                </h4>
                {pendingUkp.length > 0 ? (
                  pendingUkp.slice(0, 3).map((u) => (
                    <div key={u.id} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 hover:border-slate-200 transition-all duration-200 group">
                      <div className="min-w-0 flex-1 pr-2">
                        <h5 className="text-xs font-bold text-slate-800 truncate">{u.pegawai?.nama_lengkap || 'Pegawai'}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">Masa Kerja: {u.masa_kerja_tahun} Thn {u.masa_kerja_bulan} Bln</p>
                        <p className="text-[9px] text-slate-400 mt-1">Diajukan: {new Date(u.tanggal_diajukan || u.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      <button
                        onClick={() => navigate('/verifikasi-ukp')}
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors shrink-0 cursor-pointer"
                      >
                        <span>Tinjau</span>
                        <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <ShieldCheck size={28} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Selesai Semua</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada usulan pangkat baru.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(pendingCuti.length > 3 || pendingUkp.length > 3) && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
              <p className="text-[11px] font-semibold text-slate-500">
                Selesaikan verifikasi selengkapnya pada halaman masing-masing.
              </p>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Monitoring Kehadiran Hari Ini (2 bagian/cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <CheckSquare size={16} className="text-emerald-500" />
                <h3 className="font-bold text-slate-800 text-sm">Kehadiran Hari Ini</h3>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-100">
                {presentCount} Hadir
              </span>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[360px] overflow-y-auto scrollbar-thin">
              {todayAbsensis.length > 0 ? (
                todayAbsensis.map((absen) => (
                  <div key={absen.id} className="flex justify-between items-center pb-3.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                        {absen.pegawai?.nama_lengkap?.substring(0, 2) || 'PG'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{absen.pegawai?.nama_lengkap || 'Pegawai'}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[150px]">{absen.lokasi_masuk || 'Koordinat GPS'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700">{absen.waktu_masuk?.substring(0, 5)} WIB</p>
                      <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded uppercase mt-0.5 ${absen.status_lokasi === 'valid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {absen.status_lokasi}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <UserX size={36} className="text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">Belum Ada Kehadiran</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Belum ada pegawai yang melakukan check-in hari ini.</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-[10px] font-semibold text-slate-500">
              Total Absensi Hari Ini
            </span>
            <span className="text-xs font-black text-slate-700">
              {todayAbsensis.length} Catatan
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
