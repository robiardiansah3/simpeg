/**
 * @file VerifikasiCutiPage.jsx
 * @description Komponen halaman persetujuan permohonan cuti pegawai oleh Kepala Sekolah.
 * Menyediakan tinjauan detail alasan, unduhan berkas lampiran, pengisian catatan, serta persetujuan/penolakan.
 */

import { useState, useEffect, useMemo } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import PageHeader from '../../components/ui/page-header';
import PageTable from '../../components/ui/page-table';
import FormModal from '../../components/ui/form-modal';
import Modal from '../../components/ui/modal';
import { Calendar, CheckCircle, XCircle, FileText, User, Paperclip, ExternalLink, HelpCircle } from 'lucide-react';
import api from '../../lib/api';

/**
 * Menghitung selisih durasi hari antara tanggal mulai dan selesai.
 *
 * @param {string} mulai
 * @param {string} selesai
 * @returns {string} Durasi dalam teks hari.
 */
function hitungDurasi(mulai, selesai) {
  if (!mulai || !selesai) return '-';
  const diff = Math.round((new Date(selesai) - new Date(mulai)) / (1000*60*60*24)) + 1;
  return `${diff} hari`;
}

/**
 * VerifikasiCutiPage Component
 * Render daftar usulan cuti masuk dengan tindakan review interaktif serta modal keputusan.
 *
 * @returns {JSX.Element} Halaman verifikasi cuti.
 */
export default function VerifikasiCutiPage() {
  const [data, setData]               = useState([]);
  const [isLoading, setLoading]       = useState(true);
  const [isProcessing, setProcessing] = useState(false);

  // State untuk Detail/Tinjau Cuti Modal
  const [detailModal, setDetailModal] = useState({ open: false, item: null });

  // State untuk Modal konfirmasi final
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, action: null });

  // Catatan Kepsek
  const [catatan, setCatatan] = useState('');

  useEffect(() => { fetchCuti(); }, []);

  /**
   * Mengambil daftar usulan cuti yang berstatus 'diteruskan' untuk diverifikasi.
   *
   * @returns {Promise<void>}
   */
  const fetchCuti = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cuti');
      setData((res.data.data || []).filter(d => d.status === 'diteruskan'));
    } catch { /* silent */ } finally { setLoading(false); }
  };

  /**
   * Membuka modal detail usulan cuti tertentu.
   *
   * @param {object} item Objek usulan cuti.
   */
  const openDetail = (item) => {
    setDetailModal({ open: true, item });
    setCatatan('');
  };

  /**
   * Membuka modal dialog konfirmasi verifikasi cuti.
   *
   * @param {number} id ID usulan cuti.
   * @param {string} action Aksi verifikasi ('disetujui' atau 'ditolak').
   */
  const konfirmasi = (id, action) => {
    setConfirmModal({ open: true, id, action });
  };

  /**
   * Mengirimkan data verifikasi keputusan cuti (setuju/tolak) beserta catatan Kepala Sekolah ke backend.
   *
   * @returns {Promise<void>}
   */
  const handleVerifikasi = async () => {
    const { id, action } = confirmModal;
    setConfirmModal({ open: false, id: null, action: null });
    setDetailModal({ open: false, item: null });
    setProcessing(true);
    try {
      await api.put(`/cuti/${id}/verifikasi`, { 
        status: action,
        catatan: catatan
      });
      await fetchCuti();
    } catch {
      alert('Gagal memverifikasi permohonan. Silakan coba lagi.');
    } finally {
      setProcessing(false);
      setCatatan('');
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'pegawai.nama_lengkap',
      header: 'Nama Pegawai',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-850">
            {row.original.pegawai?.nama_lengkap ?? `ID: ${row.original.pegawai_id}`}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
            NBM: {row.original.pegawai?.nbm || '-'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'jenis_cuti',
      header: 'Jenis Cuti',
      cell: ({ getValue }) => <span className="font-bold text-slate-800">{getValue()}</span>,
    },
    {
      accessorKey: 'tanggal_mulai',
      header: 'Tgl Pelaksanaan',
      meta: { className: 'hidden sm:table-cell' },
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-600">
          {new Date(row.original.tanggal_mulai).toLocaleDateString('id-ID')} s/d {new Date(row.original.tanggal_selesai).toLocaleDateString('id-ID')}
        </span>
      ),
    },
    {
      id: 'durasi',
      header: 'Durasi',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ row }) => (
        <Badge variant="info" className="font-bold text-[10px] px-2 py-0.5 rounded-full">
          {hitungDurasi(row.original.tanggal_mulai, row.original.tanggal_selesai)}
        </Badge>
      ),
    },
    {
      accessorKey: 'alasan',
      header: 'Alasan',
      meta: { className: 'hidden lg:table-cell' },
      cell: ({ getValue }) => (
        <span className="block max-w-[180px] overflow-hidden text-ellipsis white-space-nowrap text-xs font-semibold text-slate-500">
          {getValue() || '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Tindakan',
      cell: ({ row }) => (
        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDetail(row.original)}
            className="flex items-center gap-1.5 cursor-pointer rounded-xl font-bold text-xs"
            disabled={isProcessing}
          >
            <ExternalLink size={12} /> Tinjau
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => konfirmasi(row.original.id, 'disetujui')}
            className="flex items-center gap-1.5 cursor-pointer rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isProcessing}
          >
            <CheckCircle size={12} /> Setujui
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => konfirmasi(row.original.id, 'ditolak')}
            className="flex items-center gap-1.5 cursor-pointer rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white border-transparent"
            disabled={isProcessing}
          >
            <XCircle size={12} /> Tolak
          </Button>
        </div>
      ),
    },
  ], [isProcessing]);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  const pendingCount = data.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={24} />
            Verifikasi Usulan Cuti
            {pendingCount > 0 && (
              <Badge variant="warning" className="text-xs font-black px-2 py-0.5 rounded-full">{pendingCount} Menunggu</Badge>
            )}
          </span>
        }
        subtitle="Daftar permohonan cuti pegawai yang memerlukan persetujuan Kepala Sekolah."
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <PageTable
          table={table}
          isLoading={isLoading}
          emptyIcon={<CheckCircle size={36} className="text-emerald-500" />}
          emptyTitle="Semua permohonan telah diverifikasi"
          emptyDesc="Tidak ada permohonan cuti baru yang menunggu persetujuan Anda."
        />
      </div>

      {/* Modal Detail & Review Permohonan Cuti */}
      <FormModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, item: null })}
        title="Tinjau Permohonan Cuti"
        size="lg"
      >
        {detailModal.item && (
          <div className="space-y-6">
            
            {/* Profil Singkat Pegawai */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-750 font-black shrink-0">
                {detailModal.item.pegawai?.nama_lengkap?.substring(0, 2).toUpperCase() || 'PG'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{detailModal.item.pegawai?.nama_lengkap}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">NBM: {detailModal.item.pegawai?.nbm || '-'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                  Jabatan: {detailModal.item.pegawai?.jabatan || '-'} • Status: {detailModal.item.pegawai?.status_kepegawaian || '-'}
                </p>
              </div>
            </div>

            {/* Rincian Permohonan */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Jenis Cuti</span>
                <span className="text-xs font-bold text-slate-800 block mt-1.5">{detailModal.item.jenis_cuti}</span>
              </div>
              <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Durasi</span>
                <span className="text-xs font-bold text-slate-850 block mt-1.5 text-blue-600">
                  {hitungDurasi(detailModal.item.tanggal_mulai, detailModal.item.tanggal_selesai)}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl col-span-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Cuti</span>
                <span className="text-xs font-bold text-slate-800 block mt-1.5">
                  {new Date(detailModal.item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} s/d {new Date(detailModal.item.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Alasan Cuti */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alasan Pengajuan Cuti</span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-1.5">{detailModal.item.alasan || '-'}</p>
            </div>

            {/* Lampiran Dokumen */}
            {detailModal.item.lampiran && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Lampiran Dokumen Pendukung</span>
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Paperclip size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[320px]">
                      {detailModal.item.lampiran.split('/').pop()}
                    </span>
                  </div>
                  <a href={detailModal.item.lampiran} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline shrink-0 flex items-center gap-1">
                    Unduh Lampiran <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            )}

            {/* Input Catatan */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Catatan / Alasan Keputusan (Opsional)
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tuliskan catatan verifikasi atau alasan penolakan..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            {/* Footer Modal dengan Tombol Keputusan */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDetailModal({ open: false, item: null })}
                className="flex-1 rounded-xl cursor-pointer"
              >
                Kembali
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={() => konfirmasi(detailModal.item.id, 'disetujui')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
              >
                Setujui Permohonan
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => konfirmasi(detailModal.item.id, 'ditolak')}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white border-transparent rounded-xl cursor-pointer"
              >
                Tolak Permohonan
              </Button>
            </div>

          </div>
        )}
      </FormModal>

      {/* Modal Konfirmasi Tindakan */}
      <Modal
        isOpen={confirmModal.open}
        title={confirmModal.action === 'disetujui' ? 'Setujui Permohonan Cuti?' : 'Tolak Permohonan Cuti?'}
        message={
          confirmModal.action === 'disetujui'
            ? 'Permohonan cuti ini akan disetujui. Pegawai akan diberitahu secara real-time.'
            : 'Permohonan cuti ini akan ditolak. Pastikan alasan penolakan sudah ditulis dengan jelas.'
        }
        confirmText={confirmModal.action === 'disetujui' ? 'Ya, Setujui' : 'Ya, Tolak'}
        cancelText="Batal"
        variant={confirmModal.action === 'disetujui' ? 'success' : 'danger'}
        onConfirm={handleVerifikasi}
        onCancel={() => setConfirmModal({ open: false, id: null, action: null })}
      />
    </div>
  );
}
