/**
 * @file DaftarAbsenPage.jsx
 * @description Komponen halaman daftar kehadiran pegawai untuk peran Kepala Sekolah.
 * Menyediakan filter berdasarkan rentang tanggal, status kehadiran, dan nama pegawai.
 */

import { useState, useEffect, useMemo } from 'react';
import { getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Badge } from '../../components/ui/badge';
import PageHeader from '../../components/ui/page-header';
import PageTable from '../../components/ui/page-table';
import {
  ClipboardList, Calendar, CheckCircle2, User, Info, Smartphone, CheckCircle, AlertTriangle, AlertCircle
} from 'lucide-react';
import api from '../../lib/api';

/**
 * DaftarAbsenPage Component
 * Render tabel riwayat absensi guru/pegawai beserta panel filter interaktif.
 *
 * @returns {JSX.Element} Halaman daftar kehadiran pegawai.
 */
export default function DaftarAbsenPage() {
  const [absensis, setAbsensis] = useState([]);
  const [pegawais, setPegawais] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // Filter States
  const [dateFilter, setDateFilter] = useState('semua'); // harian, mingguan, bulanan, tahunan, semua
  const [statusFilter, setStatusFilter] = useState('semua'); // hadir, izin, sakit, tidak_hadir, semua
  const [pegawaiFilter, setPegawaiFilter] = useState('semua'); // pegawai_id, semua

  useEffect(() => {
    // Fetch pegawai list once on mount
    api.get('/pegawai').catch(() => ({ data: { data: [] } }))
      .then(res => setPegawais(res.data?.data || []));
  }, []);

  useEffect(() => {
    // Refetch absensis whenever pegawaiFilter changes — send filter to server
    setLoading(true);
    const params = {};
    if (pegawaiFilter !== 'semua') params.pegawai_id = pegawaiFilter;
    api.get('/absensi/riwayat', { params })
      .catch(() => ({ data: { data: [] } }))
      .then(res => setAbsensis(res.data?.data || []))
      .finally(() => setLoading(false));
  }, [pegawaiFilter]);

  // Filter Helpers
  /**
   * Memeriksa apakah tanggal yang diberikan cocok dengan tanggal hari ini.
   *
   * @param {string} dateStr String tanggal dari API.
   * @returns {boolean} True jika tanggal hari ini, False jika tidak.
   */
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const t = new Date();
    return d.getDate() === t.getDate() &&
           d.getMonth() === t.getMonth() &&
           d.getFullYear() === t.getFullYear();
  };

  /**
   * Memeriksa apakah tanggal berada dalam rentang jumlah hari ke belakang dari hari ini.
   *
   * @param {string} dateStr String tanggal dari API.
   * @param {number} days Jumlah hari ke belakang.
   * @returns {boolean} True jika masuk dalam rentang hari, False jika tidak.
   */
  const isWithinDays = (dateStr, days) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const t = new Date();
    t.setHours(0,0,0,0);
    t.setDate(t.getDate() - days);
    return d >= t;
  };

  // Client-side filter for date & status (pegawai already filtered server-side)
  const filteredAbsensis = useMemo(() => {
    return absensis.filter(item => {
      // 1. Date Filter
      let passDate = true;
      if (dateFilter === 'harian') passDate = isToday(item.tanggal);
      else if (dateFilter === 'mingguan') passDate = isWithinDays(item.tanggal, 7);
      else if (dateFilter === 'bulanan') passDate = isWithinDays(item.tanggal, 30);
      else if (dateFilter === 'tahunan') passDate = isWithinDays(item.tanggal, 365);

      // 2. Status Kehadiran Filter (client-side)
      let passStatus = true;
      if (statusFilter !== 'semua') {
        passStatus = item.status_kehadiran === statusFilter;
      }

      return passDate && passStatus;
    });
  }, [absensis, dateFilter, statusFilter]);

  const columns = useMemo(() => [
    {
      accessorKey: 'pegawai.nama_lengkap',
      header: 'Nama Pegawai',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase shrink-0">
            {row.original.pegawai?.nama_lengkap?.substring(0, 2) || 'PG'}
          </div>
          <span className="font-bold text-slate-800">
            {row.original.pegawai?.nama_lengkap || 'Pegawai'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
      meta: { className: 'hidden sm:table-cell' },
      cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'
    },
    {
      accessorKey: 'waktu_masuk',
      header: 'Jam Masuk',
      meta: { className: 'hidden sm:table-cell' },
      cell: ({ getValue }) => getValue() ? <span className="font-semibold text-slate-700">{getValue().substring(0, 5)} WIB</span> : '--:--'
    },
    {
      accessorKey: 'status_kehadiran',
      header: 'Kehadiran',
      cell: ({ getValue }) => {
        const val = getValue();
        let variant = 'info';
        let label = val;
        if (val === 'hadir') { variant = 'success'; label = 'Hadir'; }
        if (val === 'tugas_luar') { variant = 'info'; label = 'Tugas Luar'; }
        if (val === 'izin') { variant = 'warning'; label = 'Izin'; }
        if (val === 'sakit') { variant = 'info'; label = 'Sakit'; }
        if (val === 'tidak_hadir' || val === 'alpa' || val === 'alpha') { variant = 'danger'; label = 'Alpa'; }
        return <Badge variant={variant} className="uppercase font-bold text-[9px] tracking-wider">{label}</Badge>;
      }
    },
    {
      id: 'lokasi',
      header: 'Lokasi & Jarak',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ row }) => {
        const loc = row.original.lokasi;
        if (!loc) return <span className="text-xs font-semibold text-slate-400">—</span>;
        const isValid = loc.status === 'valid';
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 max-w-[200px] truncate" title={loc.nama_lokasi}>
              {loc.nama_lokasi || 'Koordinat GPS'}
            </span>
            <span className="text-[10px] text-slate-450 font-semibold mt-0.5">
              Jarak: {loc.jarak_meter}m • <span className={isValid ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'}>{isValid ? 'DALAM RADIUS' : 'LUAR RADIUS'}</span>
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'device_info',
      header: 'Perangkat',
      meta: { className: 'hidden lg:table-cell' },
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 max-w-[150px] truncate" title={getValue()}>
          <Smartphone size={12} className="text-slate-400 shrink-0" />
          {getValue() || '-'}
        </span>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredAbsensis,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <ClipboardList className="text-blue-600" size={24} />
            Daftar Kehadiran Pegawai
          </span>
        }
        subtitle="Pantau dan filter riwayat check-in absensi seluruh guru dan staf sekolah secara real-time."
      />

      {/* THREE SEPARATE FILTERS WORKING TOGETHER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col lg:flex-row gap-6">
        
        {/* Filter 1: Rentang Waktu */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest">
            Rentang Tanggal
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'semua', label: 'Semua' },
              { id: 'harian', label: 'Hari Ini' },
              { id: 'mingguan', label: '7 Hari Terakhir' },
              { id: 'bulanan', label: '30 Hari Terakhir' },
              { id: 'tahunan', label: '1 Tahun' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setDateFilter(btn.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  dateFilter === btn.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter 2: Status Kehadiran */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest">
            Status Kehadiran
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'semua', label: 'Semua' },
              { id: 'hadir', label: 'Hadir' },
              { id: 'tugas_luar', label: 'Tugas Luar' },
              { id: 'izin', label: 'Izin' },
              { id: 'sakit', label: 'Sakit' },
              { id: 'tidak_hadir', label: 'Alpa' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setStatusFilter(btn.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  statusFilter === btn.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter 3: Nama Pegawai */}
        <div className="w-full lg:w-[280px] flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest">
            Nama Pegawai
          </label>
          <select
            value={pegawaiFilter}
            onChange={(e) => setPegawaiFilter(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
          >
            <option value="semua">Semua Pegawai</option>
            {pegawais.map(p => (
              <option key={p.id} value={p.id}>
                {p.nama_lengkap}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* FILTER SUMMARY */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100 shadow-sm">
          Ditemukan {filteredAbsensis.length} data absensi yang cocok
        </span>
        {(dateFilter !== 'semua' || statusFilter !== 'semua' || pegawaiFilter !== 'semua') && (
          <button
            onClick={() => {
              setDateFilter('semua');
              setStatusFilter('semua');
              setPegawaiFilter('semua');
            }}
            className="text-xs font-extrabold text-blue-600 hover:underline hover:text-blue-750 cursor-pointer"
          >
            Reset Semua Filter
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <PageTable
          table={table}
          isLoading={isLoading}
          emptyIcon={<ClipboardList size={36} className="text-slate-350" />}
          emptyTitle="Tidak Ada Riwayat Absensi"
          emptyDesc="Silakan ubah kriteria filter Anda untuk mencari data lain."
        />
      </div>
    </div>
  );
}
