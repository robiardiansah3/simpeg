/**
 * @file PegawaiDashboard.jsx
 * @description Komponen halaman dashboard utama bagi Pegawai/Guru.
 * Menyediakan ringkasan profil, status absensi harian, pengajuan aktif, mini calendar absensi/cuti, dan papan informasi.
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CalendarDays, Mail, Phone,
  ChevronRight, ChevronLeft, Eye, Loader2, Award, Compass, Clock
} from 'lucide-react';
import api from '../../lib/api';

// ── Calendar Helper Functions ─────────────────────────────
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS_ID   = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

/**
 * Membangun array representasi tanggal dalam suatu bulan untuk tampilan kalender grid.
 *
 * @param {number} year
 * @param {number} month
 * @returns {Array<number|null>} Array nomor hari atau null.
 */
function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = (startDow === 0 ? 6 : startDow - 1); // convert to Mon-first

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/**
 * MiniCalendar Component
 * Menampilkan kalender ringkas berdasakan riwayat absensi dan cuti.
 *
 * @param {object} props
 * @param {array} props.cutiDates
 * @param {array} props.absensiDates
 * @returns {JSX.Element}
 */
function MiniCalendar({ cutiDates = [], absensiDates = [] }) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  /**
   * Menggeser tampilan kalender ke bulan sebelumnya.
   */
  const goPrev = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  /**
   * Menggeser tampilan kalender ke bulan berikutnya.
   */
  const goNext = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells = useMemo(() => buildCalendar(viewYear, viewMonth), [viewYear, viewMonth]);

  /**
   * Memeriksa apakah nomor tanggal tertentu cocok dengan tanggal hari ini.
   *
   * @param {number|null} d Nomor hari.
   * @returns {boolean} True jika hari ini, False jika tidak.
   */
  const isToday = (d) => d && d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  /**
   * Memeriksa apakah pegawai memiliki jadwal cuti pada tanggal tertentu.
   *
   * @param {number|null} d Nomor hari.
   * @returns {boolean} True jika cuti, False jika tidak.
   */
  const isCutiDay = (d) => {
    if (!d) return false;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return cutiDates.some(({ mulai, selesai }) => dateStr >= mulai && dateStr <= selesai);
  };

  /**
   * Memeriksa apakah pegawai telah melakukan absensi masuk pada tanggal tertentu.
   *
   * @param {number|null} d Nomor hari.
   * @returns {boolean} True jika sudah absen, False jika tidak.
   */
  const isAbsenDay = (d) => {
    if (!d) return false;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return absensiDates.includes(dateStr);
  };

  return (
    <div className="w-full">
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goPrev} className="p-1.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-slate-800">
          {MONTHS_ID[viewMonth]} {viewYear}
        </span>
        <button onClick={goNext} className="p-1.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS_ID.map(d => (
          <div key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((d, i) => {
          const cutiDay  = isCutiDay(d);
          const absenDay = isAbsenDay(d);
          const todayDay = isToday(d);

          let cellClass = 'w-7 h-7 mx-auto flex items-center justify-center rounded-full text-xs font-semibold transition-all ';
          if (!d) {
            cellClass += 'text-transparent';
          } else if (todayDay) {
            cellClass += 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold scale-105';
          } else if (cutiDay) {
            cellClass += 'bg-amber-100 text-amber-700 font-bold border border-amber-200';
          } else if (absenDay) {
            cellClass += 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-200';
          } else {
            cellClass += 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
          }

          return (
            <div key={i} className="flex items-center justify-center h-8">
              <span className={cellClass}>{d || ''}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 pt-4 border-t border-slate-100 justify-center">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-sm"></span> Hari Ini
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm"></span> Hadir
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm"></span> Cuti
        </span>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────
/**
 * PegawaiDashboard Component
 * Render ringkasan interaktif data pribadi pegawai, performa presensi, pengajuan cuti & UKP.
 *
 * @returns {JSX.Element} Halaman dashboard guru/pegawai.
 */
export default function PegawaiDashboard() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const role = user?.role?.role_name || 'pegawai';

  const [pegawai,   setPegawai]   = useState(null);
  const [cuti,      setCuti]      = useState([]);
  const [ukp,       setUkp]       = useState([]);
  const [absensi,   setAbsensi]   = useState([]);
  const [informasi, setInformasi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => {
        const summary = res.data?.data || {};
        setPegawai(summary.profile?.pegawai || null);
        setCuti(summary.cutis || []);
        setUkp(summary.ukps || []);
        setAbsensi(summary.absensis || []);
        setInformasi(summary.informasi || []);
      })
      .catch(err => {
        console.error('Error loading dashboard summary:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const todayStr   = new Date().toISOString().split('T')[0];
  const todayAbsen = absensi.find(a => a.tanggal === todayStr);

  const currentYear = new Date().getFullYear();
  const totalCutiDiambil = useMemo(() => {
    return cuti
      .filter(c => {
        if (c.status !== 'disetujui') return false;
        const year = c.tanggal_mulai ? new Date(c.tanggal_mulai).getFullYear() : new Date().getFullYear();
        return year === currentYear;
      })
      .reduce((acc, c) => acc + (Number(c.jumlah_hari) || 0), 0);
  }, [cuti, currentYear]);

  const activeCuti = cuti.filter(c => ['diajukan', 'ditinjau_admin', 'revisi', 'diteruskan'].includes(c.status));
  const activeUkp  = ukp.filter(u => ['diajukan', 'ditinjau_admin', 'revisi', 'diteruskan'].includes(u.status));
  const totalAktif = activeCuti.length + activeUkp.length;

  const cutiDates = useMemo(() => {
    return cuti
      .filter(c => c.status === 'disetujui' && c.tanggal_mulai && c.tanggal_selesai)
      .map(c => ({
        mulai:   c.tanggal_mulai.substring(0, 10),
        selesai: c.tanggal_selesai.substring(0, 10),
      }));
  }, [cuti]);

  const absensiDates = useMemo(() => {
    return absensi
      .filter(a => a.status_kehadiran === 'hadir')
      .map(a => a.tanggal?.substring(0, 10))
      .filter(Boolean);
  }, [absensi]);

  const semuaPengajuan = [
    ...cuti.map(c => ({ id: `cuti-${c.id}`, type: 'Usulan Cuti Tahunan', date: c.created_at || c.tanggal_mulai, status: c.status })),
    ...ukp.map(u => ({ id: `ukp-${u.id}`, type: 'Usulan Kenaikan Pangkat', date: u.tanggal_diajukan || u.created_at, status: u.status }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 2);

  /**
   * Mengambil dua huruf pertama dari nama untuk dijadikan inisial avatar.
   *
   * @param {string} name Nama lengkap pegawai.
   * @returns {string} Dua huruf inisial berhuruf kapital.
   */
  const getInitials = (name) => name?.substring(0, 2).toUpperCase() || 'US';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── TOP SECTION ── */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Profil Card */}
        <div className="flex-[1.5] bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-105 transition-transform duration-300" />
          <div className="flex gap-5 items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden shadow-md">
              {pegawai?.foto
                ? <img src={pegawai.foto} alt="Profile" className="w-full h-full object-cover"/>
                : getInitials(pegawai?.nama_lengkap || user?.name)
              }
            </div>
            <div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                Pegawai Aktif
              </span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1.5 mb-0.5">
                {pegawai?.nama_lengkap || user?.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {pegawai?.jabatan || (role === 'kepala_sekolah' ? 'Kepala Sekolah' : 'Guru / Pegawai')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 p-4 bg-slate-50/80 rounded-xl text-xs font-semibold text-slate-600 border border-slate-100">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400"/>
              <span>{user?.email || 'email@sekolah.sch.id'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400"/>
              <span>{pegawai?.nomor_telepon || 'Belum diatur'}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex-1 flex flex-col sm:flex-row gap-6">
          {/* Total Cuti Diambil */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 bg-blue-50 group-hover:scale-105 transition-transform duration-200">
                <CalendarDays size={20}/>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">Tahun {currentYear}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cuti Diambil</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-800">{totalCutiDiambil}</span>
                <span className="text-xs font-bold text-slate-500">Hari Kerja</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Usulan yang telah disetujui Kepala Sekolah</p>
            </div>
          </div>

          {/* Pengajuan Aktif */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-600 bg-purple-50 group-hover:scale-105 transition-transform duration-200">
                <FileText size={20}/>
              </div>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md">Pending</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pengajuan Aktif</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-800">{totalAktif}</span>
                <span className="text-xs font-bold text-slate-500">Berkas</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Menunggu verifikasi administrasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Absensi Hari Ini */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-emerald-500" />
                <h3 className="font-bold text-slate-800 text-sm">Absensi Hari Ini</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-semibold text-slate-600">Status Kehadiran</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${todayAbsen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                  {todayAbsen ? 'Hadir' : 'Belum Absen'}
                </span>
              </div>
              <div className="flex justify-between items-center px-3">
                <span className="text-xs font-semibold text-slate-500">Jam Masuk</span>
                <span className="text-sm font-bold text-slate-800">
                  {todayAbsen?.waktu_masuk ? `${todayAbsen.waktu_masuk} WIB` : '-- : --'}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/absensi')}
            className="mt-6 text-xs font-bold text-blue-600 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer w-full"
          >
            <span>Buka Menu Absensi</span>
            <ChevronRight size={14}/>
          </button>
        </div>

        {/* Pengajuan Terbaru */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <Compass size={16} className="text-purple-500" />
                <h3 className="font-bold text-slate-800 text-sm">Pengajuan Terbaru</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Status Berkas</span>
            </div>

            <div className="space-y-4">
              {semuaPengajuan.length > 0 ? semuaPengajuan.map((item, idx) => {
                const statusColors = {
                  diajukan: 'bg-amber-50 text-amber-700 border-amber-100',
                  ditinjau_admin: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                  revisi: 'bg-rose-50 text-rose-700 border-rose-100',
                  diteruskan: 'bg-blue-50 text-blue-700 border-blue-100',
                  disetujui: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  ditolak: 'bg-slate-100 text-slate-600 border-slate-200',
                };
                const STATUS_LABEL = { 
                  diajukan: 'Menunggu', 
                  ditinjau_admin: 'Ditinjau', 
                  revisi: 'Revisi', 
                  diteruskan: 'Diteruskan', 
                  disetujui: 'Disetujui', 
                  ditolak: 'Ditolak' 
                };
                const colorClass = statusColors[item.status] || 'bg-slate-50 text-slate-500 border-slate-100';
                return (
                  <div key={idx} className="flex justify-between items-center p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FileText size={15} className="text-slate-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">{item.type}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${colorClass}`}>
                      {STATUS_LABEL[item.status] || item.status}
                    </span>
                  </div>
                );
              }) : (
                <p className="text-xs text-slate-400 text-center py-6">Belum ada pengajuan cuti/pangkat.</p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => navigate('/riwayat-pengajuan')}
            className="mt-6 text-xs font-bold text-blue-600 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer w-full"
          >
            <span>Riwayat Pengajuan</span>
            <ChevronRight size={14}/>
          </button>
        </div>

        {/* Kalender Kehadiran */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-300 md:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-5">
            <CalendarDays size={16} className="text-blue-500" />
            <h3 className="font-bold text-slate-800 text-sm">Kalender Kehadiran</h3>
          </div>
          <MiniCalendar cutiDates={cutiDates} absensiDates={absensiDates} />
        </div>
      </div>

      {/* ── BOTTOM SECTION: Informasi Persyaratan ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <Award size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm md:text-base">Informasi Persyaratan</h3>
          </div>
          <button
            onClick={() => navigate('/informasi-persyaratan')}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            <span>Semua Informasi</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {informasi.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={40} className="text-slate-200 mb-3" />
            <p className="text-sm text-slate-400 font-medium">Belum ada informasi persyaratan tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 border-t border-slate-100">
            {informasi.slice(0, 6).map((info) => (
              <div
                key={info.id}
                className="group flex flex-col justify-between p-6 hover:bg-slate-50/50 transition-colors border-r border-b border-slate-100 last:border-r-0"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors duration-200">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-snug mb-2 group-hover:text-blue-700 transition-colors">{info.judul}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {info.deskripsi?.split('\n')[0] || ''}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/informasi-persyaratan/${info.id}`)}
                  className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group-hover:translate-x-0.5 duration-200"
                >
                  <Eye size={14} /> 
                  <span>Lihat Selengkapnya</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
