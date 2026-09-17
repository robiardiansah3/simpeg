/**
 * @file InformasiPersyaratanDetailPage.jsx
 * @description Halaman Detail Artikel Informasi Persyaratan. Menampilkan penjelasan terperinci,
 * daftar poin dokumen, serta tautan navigasi kembali ke daftar artikel atau artikel alternatif lainnya.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { ArrowLeft, FileText, Calendar, BookOpen, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

/**
 * Komponen Halaman Detail Informasi Persyaratan.
 * Mengambil satu artikel detail berdasarkan parameter ID dan merender daftarnya dalam bentuk butir poin.
 * 
 * @returns {React.ReactElement} Komponen Halaman Detail Informasi.
 */
export default function InformasiPersyaratanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memuat data artikel detail beserta daftar artikel terkait berdasarkan perubahan ID
  useEffect(() => {
    /**
     * Mengambil detail artikel informasi persyaratan dari API berdasarkan ID rute yang aktif.
     *
     * @returns {Promise<void>}
     */
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get('/informasi-persyaratan');
        const data = res.data.data || [];
        setAllItems(data);
        const found = data.find(d => String(d.id) === String(id));
        if (found) setItem(found);
        else setError('Informasi tidak ditemukan.');
      } catch {
        setError('Gagal memuat data. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-12 text-center">
        <AlertCircle className="mb-4 text-red-400" size={48} />
        <h3 className="text-lg font-bold text-red-800">{error}</h3>
        <button onClick={() => navigate('/informasi-persyaratan')} className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  const otherItems = allItems.filter(d => String(d.id) !== String(id)).slice(0, 4);

  // Parse deskripsi into lines for bullet display
  const lines = item.deskripsi?.split('\n').filter(l => l.trim()) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/informasi-persyaratan')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Semua Informasi
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── MAIN CONTENT ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-lg shadow-blue-200">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <BookOpen size={22} className="text-white" />
                </div>
                <span className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Informasi Persyaratan</span>
              </div>
              <h1 className="text-2xl font-black leading-tight mb-4">{item.judul}</h1>
              <div className="flex items-center gap-2 text-blue-200 text-xs">
                <Calendar size={13} />
                <span>Diperbarui: {new Date(item.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Detail Content Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <h2 className="font-bold text-slate-800 text-sm">Rincian Persyaratan</h2>
            </div>
            <div className="p-6">
              {lines.length > 0 ? (
                <ul className="space-y-3">
                  {lines.map((line, idx) => {
                    const isHeader = line.endsWith(':') || (!line.startsWith('-') && line.length < 80 && idx === 0);
                    if (isHeader) {
                      return (
                        <li key={idx} className="font-bold text-slate-800 text-sm pt-2 first:pt-0 border-t border-slate-100 first:border-0">
                          {line}
                        </li>
                      );
                    }
                    const cleanLine = line.replace(/^[-•*]\s*/, '');
                    return (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                        <span className="leading-relaxed">{cleanLine}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">Tidak ada rincian tersedia.</p>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 flex gap-4">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-800 mb-1">Informasi Penting</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Pastikan semua dokumen yang diperlukan sudah lengkap dan valid sebelum mengajukan permohonan. Hubungi bagian administrasi jika ada pertanyaan lebih lanjut.
              </p>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-5">
          {/* Other Articles */}
          {otherItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Informasi Lainnya</h3>
              <div className="flex flex-col gap-3">
                {otherItems.map((other) => (
                  <button
                    key={other.id}
                    onClick={() => navigate(`/informasi-persyaratan/${other.id}`)}
                    className="flex items-start gap-3 text-left p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
                      <FileText size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2">{other.judul}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(other.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0 mt-1 group-hover:text-blue-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
