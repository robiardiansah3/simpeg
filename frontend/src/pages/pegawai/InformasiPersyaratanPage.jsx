/**
 * @file InformasiPersyaratanPage.jsx
 * @description Halaman Daftar Informasi Persyaratan. Menyajikan artikel instruksi
 * serta daftar lengkap berkas prasyarat untuk pengajuan cuti dan kenaikan pangkat (UKP).
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Loader2, FileText, AlertCircle, ChevronRight, BookOpen, Calendar, Search } from 'lucide-react';

/**
 * Komponen Halaman utama Informasi Persyaratan.
 * Mengambil artikel prasyarat dari server backend dan menyediakan kolom pencarian judul/deskripsi.
 * 
 * @returns {React.ReactElement} Komponen Halaman Daftar Informasi.
 */
export default function InformasiPersyaratanPage() {
  const navigate = useNavigate();
  const [informasi, setInformasi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Memuat data saat pertama kali komponen dirender
  useEffect(() => {
    fetchInformasi();
  }, []);

  /**
   * Mengambil daftar artikel prasyarat dari server backend.
   */
  const fetchInformasi = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/informasi-persyaratan');
      setInformasi(response.data.data || []);
    } catch {
      setError('Gagal memuat informasi persyaratan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = informasi.filter(item =>
    item.judul?.toLowerCase().includes(search.toLowerCase()) ||
    item.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-lg shadow-blue-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-tight">Informasi Persyaratan</h1>
              <p className="text-blue-200 text-sm mt-0.5">
                Daftar lengkap persyaratan untuk pengajuan cuti dan kenaikan pangkat
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300" />
            <input
              type="text"
              placeholder="Cari informasi persyaratan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 text-sm focus:outline-none focus:bg-white/25 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={36} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-12 text-center">
          <AlertCircle className="mb-4 text-red-400" size={48} />
          <h3 className="text-lg font-bold text-red-800 mb-2">Terjadi Kesalahan</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchInformasi}
            className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <FileText size={28} className="text-slate-300" />
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1">
            {search ? 'Tidak ditemukan' : 'Belum ada informasi'}
          </h3>
          <p className="text-sm text-slate-400">
            {search
              ? `Tidak ada hasil untuk "${search}". Coba kata kunci lain.`
              : 'Admin belum mempublikasikan informasi persyaratan apapun.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
            >
              Hapus pencarian
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-slate-700">{filtered.length}</span> informasi
              {search && <span> untuk "<span className="text-blue-600 font-bold">{search}</span>"</span>}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item, idx) => {
              const lines = item.deskripsi?.split('\n').filter(l => l.trim()) || [];
              const preview = lines.slice(0, 3);
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/informasi-persyaratan/${item.id}`)}
                >
                  {/* Card Header */}
                  <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                          {item.judul}
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar size={11} />
                          Diperbarui: {new Date(item.updated_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-5 py-4">
                    {preview.length > 0 ? (
                      <ul className="space-y-1.5">
                        {preview.map((line, i) => {
                          const cleanLine = line.replace(/^[-•*]\s*/, '');
                          return (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                              <span className="leading-relaxed line-clamp-1">{cleanLine}</span>
                            </li>
                          );
                        })}
                        {lines.length > 3 && (
                          <li className="text-xs text-blue-500 font-semibold pl-3.5">
                            +{lines.length - 3} poin lainnya...
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Tidak ada rincian tersedia.</p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      Informasi #{idx + 1}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-2 transition-all">
                      Lihat Detail <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
