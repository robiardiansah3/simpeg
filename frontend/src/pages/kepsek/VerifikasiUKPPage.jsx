/**
 * @file VerifikasiUKPPage.jsx
 * @description Komponen halaman persetujuan usulan kenaikan pangkat (UKP) oleh Kepala Sekolah.
 * Menyediakan verifikasi berkas usulan lampiran, pengisian catatan, serta persetujuan/penolakan final.
 */

import { useState, useEffect, useMemo } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import PageHeader from '../../components/ui/page-header';
import PageTable from '../../components/ui/page-table';
import FormModal from '../../components/ui/form-modal';
import Modal from '../../components/ui/modal';
import { CheckSquare, CheckCircle, XCircle, FileText, User, Calendar, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import api from '../../lib/api';

/**
 * VerifikasiUKPPage Component
 * Render tabel berkas pengajuan UKP masuk untuk peran Kepala Sekolah dengan validasi interaktif.
 *
 * @returns {JSX.Element} Halaman verifikasi UKP.
 */
export default function VerifikasiUKPPage() {
  const [data, setData]             = useState([]);
  const [isLoading, setLoading]     = useState(true);
  const [isProcessing, setProcessing] = useState(false);

  // State untuk Detail/Tinjau Berkas Modal
  const [detailModal, setDetailModal] = useState({ open: false, item: null });

  // State untuk Modal konfirmasi final
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, action: null });

  // Catatan Verifikasi Kepsek
  const [catatan, setCatatan] = useState('');

  useEffect(() => { fetchUKP(); }, []);

  /**
   * Mengambil daftar usulan kenaikan pangkat (UKP) yang berstatus 'diteruskan' untuk diverifikasi.
   *
   * @returns {Promise<void>}
   */
  const fetchUKP = async () => {
    setLoading(true);
    try {
      const res = await api.get('/usulan-pangkat');
      setData((res.data.data || []).filter(d => d.status === 'diteruskan'));
    } catch { /* silent */ } finally { setLoading(false); }
  };

  /**
   * Membuka modal detail usulan kenaikan pangkat tertentu.
   *
   * @param {object} item Objek usulan kenaikan pangkat.
   */
  const openDetail = (item) => {
    setDetailModal({ open: true, item });
    setCatatan('');
  };

  /**
   * Membuka modal dialog konfirmasi verifikasi kenaikan pangkat.
   *
   * @param {number} id ID usulan pangkat.
   * @param {string} action Aksi verifikasi ('disetujui' atau 'ditolak').
   */
  const konfirmasi = (id, action) => {
    setConfirmModal({ open: true, id, action });
  };

  /**
   * Mengirimkan data verifikasi keputusan UKP (setuju/tolak) beserta catatan Kepala Sekolah ke backend.
   *
   * @returns {Promise<void>}
   */
  const handleVerifikasi = async () => {
    const { id, action } = confirmModal;
    setConfirmModal({ open: false, id: null, action: null });
    setDetailModal({ open: false, item: null });
    setProcessing(true);
    try {
      await api.put(`/usulan-pangkat/${id}/verifikasi`, { 
        status: action,
        catatan: catatan 
      });
      await fetchUKP();
    } catch {
      alert('Gagal memverifikasi usulan. Silakan coba lagi.');
    } finally {
      setProcessing(false);
      setCatatan('');
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'nomor_usulan',
      header: 'No. Usulan',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ getValue }) => (
        <span className="font-bold text-slate-800">
          {getValue() || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'pegawai.nama_lengkap',
      header: 'Nama Pegawai',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-850">
            {row.original.pegawai?.nama_lengkap ?? 'Pegawai'}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
            NBM: {row.original.pegawai?.nbm || '-'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'masa_kerja_tahun',
      header: 'Masa Kerja',
      meta: { className: 'hidden sm:table-cell' },
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-650">
          {row.original.masa_kerja_tahun} Thn {row.original.masa_kerja_bulan} Bln
        </span>
      ),
    },
    {
      accessorKey: 'tanggal_diajukan',
      header: 'Tgl Diajukan',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ getValue }) => (
        <span className="text-xs font-semibold text-slate-500">
          {getValue() ? new Date(getValue()).toLocaleDateString('id-ID') : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status_baru',
      header: 'Target Pangkat',
      cell: ({ getValue }) => (
        <span className="text-xs font-bold text-slate-700">
          {getValue() || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: () => <Badge variant="warning" className="uppercase text-[9px] font-black tracking-wider">Menunggu</Badge>,
    },
    {
      accessorKey: 'status_pengajuan',
      header: 'Status Pengajuan',
      meta: { className: 'hidden sm:table-cell' },
      cell: ({ getValue }) => {
        const s = getValue();
        const cfg = {
          'belum diproses': { label: 'Belum Diproses', variant: 'default' },
          'diproses': { label: 'Diproses', variant: 'warning' },
          'selesai': { label: 'Selesai', variant: 'success' },
        }[s] || { label: s, variant: 'default' };
        return <Badge variant={cfg.variant} className="uppercase text-[9px] font-black tracking-wider">{cfg.label}</Badge>;
      }
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
            <ShieldCheck className="text-blue-600" size={24} />
            Verifikasi Usulan Kenaikan Pangkat
            {pendingCount > 0 && (
              <Badge variant="warning" className="text-xs font-black px-2 py-0.5 rounded-full">{pendingCount} Menunggu</Badge>
            )}
          </span>
        }
        subtitle="Daftar usulan kenaikan pangkat pegawai yang memerlukan persetujuan Kepala Sekolah."
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <PageTable
          table={table}
          isLoading={isLoading}
          emptyIcon={<CheckCircle size={36} className="text-emerald-500" />}
          emptyTitle="Semua usulan telah diverifikasi"
          emptyDesc="Tidak ada usulan kenaikan pangkat baru yang menunggu persetujuan Anda."
        />
      </div>

      {/* Modal Detail & Review Dokumen */}
      <FormModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, item: null })}
        title="Tinjau Berkas Kenaikan Pangkat"
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

            {/* Rincian Usulan */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">No. Usulan</span>
                <span className="text-xs font-bold text-slate-800 block mt-1.5">{detailModal.item.nomor_usulan || '-'}</span>
              </div>
              <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Diajukan</span>
                <span className="text-xs font-bold text-slate-800 block mt-1.5">
                  {new Date(detailModal.item.tanggal_diajukan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Masa Kerja yang Diajukan</span>
                <span className="text-xs font-bold text-slate-800 block mt-1.5 text-blue-650">
                  {detailModal.item.masa_kerja_tahun} Tahun {detailModal.item.masa_kerja_bulan} Bulan
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-150 rounded-xl">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Target Pangkat Baru</span>
                <span className="text-xs font-bold text-emerald-805 block mt-1.5">{detailModal.item.status_baru || '-'}</span>
              </div>
              <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl col-span-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Pengajuan</span>
                <span className="block mt-1.5">
                  <Badge variant={
                    detailModal.item.status_pengajuan === 'selesai' ? 'success' :
                    detailModal.item.status_pengajuan === 'diproses' ? 'warning' : 'default'
                  } className="uppercase text-[9px] font-black tracking-wider px-2 py-0.5">
                    {detailModal.item.status_pengajuan === 'selesai' ? 'Selesai' :
                     detailModal.item.status_pengajuan === 'diproses' ? 'Diproses' : 'Belum Diproses'}
                  </Badge>
                </span>
              </div>
            </div>

            {/* Daftar Berkas */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dokumen Lampiran</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {detailModal.item.dokumen?.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-xs font-bold text-slate-700 capitalize truncate">
                        {doc.nama_dokumen.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {(doc.ukuran_file / 1024).toFixed(1)} KB • {doc.status_validasi}
                      </span>
                    </div>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline shrink-0 flex items-center gap-1">
                        Unduh <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

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
                Setujui Usulan
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => konfirmasi(detailModal.item.id, 'ditolak')}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white border-transparent rounded-xl cursor-pointer"
              >
                Tolak Usulan
              </Button>
            </div>

          </div>
        )}
      </FormModal>

      {/* Modal Konfirmasi Tindakan */}
      <Modal
        isOpen={confirmModal.open}
        title={confirmModal.action === 'disetujui' ? 'Setujui Usulan UKP?' : 'Tolak Usulan UKP?'}
        message={
          confirmModal.action === 'disetujui'
            ? 'Usulan kenaikan pangkat ini akan disetujui dan diteruskan. Tindakan ini tidak dapat dibatalkan.'
            : 'Usulan kenaikan pangkat ini akan ditolak. Pastikan keputusan Anda sudah final.'
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
