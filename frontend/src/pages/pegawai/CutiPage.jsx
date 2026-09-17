/**
 * @file CutiPage.jsx
 * @description Halaman Manajemen dan Pengajuan Cuti Pegawai. Memungkinkan pegawai 
 * mengajukan usulan cuti baru dengan kalkulasi durasi, melampirkan berkas, 
 * serta melakukan revisi usulan yang ditolak/diminta perbaikan.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import PageHeader from '../../components/ui/page-header';
import PageTable from '../../components/ui/page-table';
import FormModal from '../../components/ui/form-modal';
import { Loader2, CalendarDays, AlertCircle, FileText, Send, Calendar, Pencil, Paperclip, X, Eye, Download } from 'lucide-react';
import api from '../../lib/api';

// Skema validasi formulir cuti menggunakan Zod
const schema = z.object({
  jenis_cuti:      z.string().min(1, 'Pilih jenis cuti'),
  tanggal_mulai:   z.string().min(1, 'Tanggal mulai wajib diisi'),
  tanggal_selesai: z.string().min(1, 'Tanggal selesai wajib diisi'),
  alasan:          z.string().min(10, 'Alasan minimal 10 karakter'),
}).refine(d => new Date(d.tanggal_selesai) >= new Date(d.tanggal_mulai), {
  message: 'Tanggal selesai tidak valid',
  path: ['tanggal_selesai'],
});

const JENIS_CUTI = ['Cuti Tahunan', 'Cuti Sakit', 'Cuti Melahirkan', 'Cuti Alasan Penting', 'Cuti lainnya'];
const STATUS_LABEL   = { diajukan: 'Menunggu', ditinjau_admin: 'Ditinjau', revisi: 'Perlu Revisi', diteruskan: 'Diteruskan', disetujui: 'Disetujui', ditolak: 'Ditolak' };
const STATUS_VARIANT = { diajukan: 'warning', ditinjau_admin: 'info', revisi: 'warning', diteruskan: 'info', disetujui: 'success', ditolak: 'danger' };

/**
 * Menghitung selisih hari antara dua tanggal pelaksanaan cuti.
 * 
 * @param {string} mulai - Tanggal mulai cuti (format YYYY-MM-DD).
 * @param {string} selesai - Tanggal selesai cuti (format YYYY-MM-DD).
 * @returns {string} Durasi cuti dalam teks hari.
 */
function hitungDurasi(mulai, selesai) {
  if (!mulai || !selesai) return '-';
  const diff = Math.round((new Date(selesai) - new Date(mulai)) / (1000 * 60 * 60 * 24)) + 1;
  return `${diff} hari`;
}

/**
 * Komponen pembantu untuk merender bidang input berserta label dan penanganan error.
 * 
 * @param {Object} props - Properti komponen.
 * @param {string} props.label - Label kolom.
 * @param {boolean} [props.required] - Menampilkan tanda bintang merah jika wajib diisi.
 * @param {string} [props.error] - Pesan kesalahan validasi.
 * @param {React.ReactNode} props.children - Elemen input anak.
 */
function FormField({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

/**
 * Komponen halaman utama Pengajuan Cuti Pegawai.
 * Mengelola formulir pengajuan, daftar riwayat cuti, modul revisi usulan, serta tampilan detail usulan.
 * 
 * @returns {React.ReactElement} Komponen Halaman Cuti.
 */
export default function CutiPage() {
  // State Riwayat Pengajuan
  const [data, setData] = useState([]);
  const [isLoadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  
  // State Formulir Pengajuan Baru
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [durasi, setDurasi] = useState(0);
  const [lampiranFile, setLampiranFile] = useState(null);

  // State Modal Revisi
  const [editModal, setEditModal] = useState({ open: false, item: null });
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editLampiranFile, setEditLampiranFile] = useState(null);

  // State Modal Detail
  const [detailModal, setDetailModal] = useState({ open: false, item: null });

  const lampiranRef = useRef(null);
  const editLampiranRef = useRef(null);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({ resolver: zodResolver(schema) });
  const startDate = useWatch({ control, name: 'tanggal_mulai' });
  const endDate   = useWatch({ control, name: 'tanggal_selesai' });

  // Form untuk melakukan edit revisi
  const editForm = useForm({ resolver: zodResolver(schema) });

  // Memuat data riwayat saat komponen dimuat pertama kali
  useEffect(() => { fetchCuti(); }, []);

  // Menghitung durasi cuti secara dinamis ketika tanggal pelaksanaan berubah
  useEffect(() => {
    if (startDate && endDate) {
      const diff = Math.round((new Date(endDate) - new Date(startDate)) / (1000*60*60*24)) + 1;
      setDurasi(diff >= 1 ? diff : 0);
    } else {
      setDurasi(0);
    }
  }, [startDate, endDate]);

  /**
   * Mengambil data riwayat pengajuan cuti pegawai yang aktif dari backend.
   */
  const fetchCuti = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/cuti');
      setData(res.data.data || []);
    } catch {
      setHistoryError('Gagal memuat data riwayat.');
    } finally {
      setLoadingHistory(false);
    }
  };

  /**
   * Mengirim data usulan cuti baru ke server backend.
   * 
   * @param {Object} formData - Data formulir cuti dari React Hook Form.
   */
  const onSubmit = async (formData) => {
    setIsSubmitting(true); 
    setFormError(null);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      if (lampiranFile) fd.append('lampiran', lampiranFile);
      await api.post('/cuti', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      reset();
      setDurasi(0);
      setLampiranFile(null);
      if (lampiranRef.current) lampiranRef.current.value = '';
      await fetchCuti();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal mengajukan cuti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Membuka modal revisi cuti dan memuat data awal usulan yang akan diperbaiki.
   * 
   * @param {Object} item - Objek data usulan cuti.
   */
  const openEdit = (item) => {
    setEditModal({ open: true, item });
    setEditError(null);
    setEditLampiranFile(null);
    editForm.reset({
      jenis_cuti:      item.jenis_cuti || '',
      tanggal_mulai:   item.tanggal_mulai ? item.tanggal_mulai.substring(0, 10) : '',
      tanggal_selesai: item.tanggal_selesai ? item.tanggal_selesai.substring(0, 10) : '',
      alasan:          item.alasan || '',
    });
  };

  /**
   * Membuka modal detail usulan cuti untuk menampilkan data lengkap usulan.
   * 
   * @param {Object} item - Objek data usulan cuti.
   */
  const openDetail = (item) => {
    setDetailModal({ open: true, item });
  };

  /**
   * Mengirimkan data perbaikan (revisi) usulan cuti yang diminta oleh admin ke backend.
   * 
   * @param {Object} formData - Data perbaikan formulir cuti dari React Hook Form.
   */
  const onEditSubmit = async (formData) => {
    if (!editModal.item) return;
    setIsEditing(true);
    setEditError(null);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      if (editLampiranFile) fd.append('lampiran', editLampiranFile);
      await api.post(`/cuti/${editModal.item.id}/revisi`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditModal({ open: false, item: null });
      setEditLampiranFile(null);
      if (editLampiranRef.current) editLampiranRef.current.value = '';
      await fetchCuti();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Gagal menyimpan revisi. Hubungi admin.');
    } finally {
      setIsEditing(false);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'jenis_cuti',
      header: 'Jenis Cuti',
      cell: ({ getValue }) => <span className="font-bold text-slate-800">{getValue()}</span>,
    },
    {
      accessorKey: 'tanggal_mulai',
      header: 'Tanggal Pelaksanaan',
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-600">
          {new Date(row.original.tanggal_mulai).toLocaleDateString('id-ID')} s/d {new Date(row.original.tanggal_selesai).toLocaleDateString('id-ID')}
        </span>
      ),
    },
    {
      id: 'durasi',
      header: 'Lama Hari',
      meta: { className: 'hidden sm:table-cell' },
      cell: ({ row }) => <span className="font-bold text-slate-700">{hitungDurasi(row.original.tanggal_mulai, row.original.tanggal_selesai)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue();
        return <Badge variant={STATUS_VARIANT[s] ?? 'default'} className="uppercase font-bold text-[9px] tracking-wider">{STATUS_LABEL[s] ?? s}</Badge>;
      },
    },
    {
      id: 'aksi',
      header: 'Aksi',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDetail(row.original)}
              className="flex items-center gap-1 cursor-pointer rounded-xl font-bold text-xs"
            >
              <Eye size={12} /> Detail
            </Button>
            {status === 'revisi' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(row.original)}
                className="flex items-center gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 cursor-pointer rounded-xl font-bold text-xs"
              >
                <Pencil size={12} /> Revisi
              </Button>
            )}
          </div>
        );
      }
    },
  ], [openDetail, openEdit]);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  /**
   * Mengembalikan kelas CSS input form berdasarkan status error validasi.
   *
   * @param {boolean} hasError Menunjukkan apakah field memiliki error.
   * @returns {string} Gabungan kelas CSS.
   */
  const inputClass = (hasError) => `w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:ring-4 font-sans
    ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'}`;

  const editStartDate = editForm.watch('tanggal_mulai');
  const editEndDate   = editForm.watch('tanggal_selesai');
  const editDurasi = editStartDate && editEndDate
    ? Math.max(0, Math.round((new Date(editEndDate) - new Date(editStartDate)) / (1000*60*60*24)) + 1)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <PageHeader 
        title="Pengajuan Cuti" 
        subtitle="Ajukan permohonan cuti baru dan pantau status persetujuannya secara terpusat."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri: Form Usulan */}
        <div className="lg:col-span-5">
          <Card className="shadow-sm border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-300 h-full">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-600" />
                <span>Formulir Pengajuan Cuti</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {formError && (
                <div className="mb-6 flex gap-3 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-semibold">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField label="Jenis Cuti" required error={errors.jenis_cuti?.message}>
                  <select {...register('jenis_cuti')} className={inputClass(errors.jenis_cuti)}>
                    <option value="">-- Pilih Jenis Cuti --</option>
                    {JENIS_CUTI.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Tanggal Mulai" required error={errors.tanggal_mulai?.message}>
                    <input type="date" {...register('tanggal_mulai')} className={inputClass(errors.tanggal_mulai)} />
                  </FormField>
                  <FormField label="Tanggal Selesai" required error={errors.tanggal_selesai?.message}>
                    <input type="date" {...register('tanggal_selesai')} className={inputClass(errors.tanggal_selesai)} />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                  <FormField label="Durasi Libur">
                    <div className="flex items-center gap-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed">
                      <span className="font-extrabold text-slate-800">{durasi}</span> Hari
                    </div>
                  </FormField>
                </div>

                <FormField label="Alasan Pengajuan" required error={errors.alasan?.message}>
                  <textarea
                    {...register('alasan')}
                    rows={3}
                    placeholder="Tuliskan detail alasan pengajuan cuti Anda..."
                    className={`${inputClass(errors.alasan)} resize-none`}
                  />
                </FormField>

                <FormField label="Lampiran Dokumen (Opsional)">
                  <div
                    className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 flex flex-col gap-2 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer group"
                    onClick={() => lampiranRef.current?.click()}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      <Paperclip size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <span className="truncate flex-1 group-hover:text-slate-700 transition-colors">
                        {lampiranFile ? lampiranFile.name : 'Klik untuk unggah berkas PDF/JPG/PNG (maks 5MB)'}
                      </span>
                      {lampiranFile && (
                        <button 
                          type="button" 
                          className="ml-auto text-red-400 hover:text-red-600 cursor-pointer p-1" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setLampiranFile(null); 
                            if (lampiranRef.current) lampiranRef.current.value = ''; 
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      ref={lampiranRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => setLampiranFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </FormField>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl cursor-pointer" onClick={() => reset()}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={isSubmitting || durasi <= 0} className="flex-1 rounded-xl cursor-pointer">
                    {isSubmitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Send size={16} className="mr-2" />}
                    Kirim Usulan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Riwayat Cuti */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-300 h-full">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800">Riwayat Pengajuan Cuti</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <PageTable
                table={table}
                isLoading={isLoadingHistory}
                error={historyError}
                emptyIcon={<Calendar size={36} className="text-slate-300" />}
                emptyTitle="Belum ada riwayat cuti"
                emptyDesc="Ajukan cuti melalui form di sebelah kiri."
              />
              
              <div className="mt-6 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800 text-xs font-semibold">
                <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <p>Usulan dengan status <strong className="text-amber-900">Perlu Revisi</strong> dapat Anda perbaiki kembali dengan menekan tombol <strong className="text-amber-900">Revisi</strong> pada kolom tabel di atas.</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Modal Edit Revisi Cuti */}
      <FormModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, item: null })}
        title="Revisi Usulan Cuti"
        size="lg"
      >
        {editModal.item && (
          <div className="flex flex-col gap-4">
            {/* Catatan admin */}
            {editModal.item.catatan_admin && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-2 text-xs text-amber-800 font-semibold leading-relaxed">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-black text-amber-900 mb-0.5">Catatan Perbaikan:</p>
                  <p>{editModal.item.catatan_admin}</p>
                </div>
              </div>
            )}

            {editError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex gap-2 text-xs text-rose-700 font-bold">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <p>{editError}</p>
              </div>
            )}

            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-5">
              <FormField label="Jenis Cuti" required error={editForm.formState.errors.jenis_cuti?.message}>
                <select {...editForm.register('jenis_cuti')} className={inputClass(editForm.formState.errors.jenis_cuti)}>
                  <option value="">-- Pilih Jenis Cuti --</option>
                  {JENIS_CUTI.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Tanggal Mulai" required error={editForm.formState.errors.tanggal_mulai?.message}>
                  <input type="date" {...editForm.register('tanggal_mulai')} className={inputClass(editForm.formState.errors.tanggal_mulai)} />
                </FormField>
                <FormField label="Tanggal Selesai" required error={editForm.formState.errors.tanggal_selesai?.message}>
                  <input type="date" {...editForm.register('tanggal_selesai')} className={inputClass(editForm.formState.errors.tanggal_selesai)} />
                </FormField>
              </div>

              <div className="flex items-center gap-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">
                Lama Cuti: <span className="font-black text-slate-800 ml-1">{editDurasi} hari</span>
              </div>

              <FormField label="Alasan Pengajuan" required error={editForm.formState.errors.alasan?.message}>
                <textarea
                  {...editForm.register('alasan')}
                  rows={3}
                  placeholder="Tuliskan alasan pengajuan cuti..."
                  className={`${inputClass(editForm.formState.errors.alasan)} resize-none`}
                />
              </FormField>

              <FormField label="Lampiran Dokumen (Opsional)">
                {editModal.item?.lampiran && (
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5 bg-slate-100/50 p-2.5 rounded-xl border border-slate-150">
                    <Paperclip size={12} className="text-slate-400" /> 
                    <span className="font-semibold">Berkas terunggah:</span>
                    <a href={editModal.item.lampiran} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold truncate max-w-[220px]">
                      {editModal.item.lampiran.split('/').pop()}
                    </a>
                  </p>
                )}
                <div
                  className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 flex flex-col gap-2 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer group"
                  onClick={() => editLampiranRef.current?.click()}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                    <Paperclip size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="truncate flex-1 group-hover:text-slate-700 transition-colors">
                      {editLampiranFile ? editLampiranFile.name : 'Ganti berkas lampiran (klik di sini)'}
                    </span>
                    {editLampiranFile && (
                      <button 
                        type="button" 
                        className="ml-auto text-red-400 hover:text-red-600 cursor-pointer p-1" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditLampiranFile(null); 
                          if (editLampiranRef.current) editLampiranRef.current.value = ''; 
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    ref={editLampiranRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => setEditLampiranFile(e.target.files?.[0] || null)}
                  />
                </div>
              </FormField>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" className="flex-1 rounded-xl cursor-pointer" onClick={() => setEditModal({ open: false, item: null })}>
                  Batal
                </Button>
                <Button type="submit" disabled={isEditing} className="flex-1 rounded-xl cursor-pointer bg-amber-600 hover:bg-amber-700 text-white border-transparent">
                  {isEditing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Send size={16} className="mr-2" />}
                  Simpan Revisi
                </Button>
              </div>
            </form>
          </div>
        )}
      </FormModal>

      {/* Modal Detail Usulan Cuti */}
      <FormModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, item: null })}
        title="Detail Usulan Cuti"
        size="lg"
      >
        {detailModal.item && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nomor Usulan</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-1.5">{detailModal.item.nomor_usulan || '-'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Jenis Cuti</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-1.5">{detailModal.item.jenis_cuti || '-'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Lama Cuti</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-1.5 text-blue-600">
                  {detailModal.item.jumlah_hari} Hari
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Diajukan</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-1.5">
                  {detailModal.item.tanggal_diajukan ? new Date(detailModal.item.tanggal_diajukan).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Mulai</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-1.5">
                  {detailModal.item.tanggal_mulai ? new Date(detailModal.item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Selesai</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-1.5">
                  {detailModal.item.tanggal_selesai ? new Date(detailModal.item.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status Usulan Terkini</span>
                <div>
                  <Badge variant={STATUS_VARIANT[detailModal.item.status] ?? 'default'} className="uppercase font-bold text-[9px] tracking-wider px-2.5 py-1">
                    {STATUS_LABEL[detailModal.item.status] ?? detailModal.item.status}
                  </Badge>
                </div>
              </div>
              {detailModal.item.tanggal_diverifikasi && (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Verifikasi</span>
                  <span className="text-xs font-extrabold text-slate-800 block mt-1.5">
                    {new Date(detailModal.item.tanggal_diverifikasi).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              <div className="md:col-span-2 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alasan Pengajuan</span>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-1.5 whitespace-pre-wrap">{detailModal.item.alasan}</p>
              </div>
            </div>

            {/* Catatan Admin / Kepala Sekolah */}
            {detailModal.item.catatan_admin && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-800 font-semibold leading-relaxed">
                <p className="font-black text-amber-900 mb-1">Catatan Admin:</p>
                <p>{detailModal.item.catatan_admin}</p>
              </div>
            )}
            {detailModal.item.catatan_kepsek && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800 font-semibold leading-relaxed">
                <p className="font-black text-blue-900 mb-1">Catatan Kepala Sekolah:</p>
                <p>{detailModal.item.catatan_kepsek}</p>
              </div>
            )}

            {/* List Dokumen */}
            {detailModal.item.lampiran && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dokumen Lampiran Terunggah</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all group">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {detailModal.item.lampiran.split('/').pop()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Berkas Lampiran Cuti
                      </span>
                    </div>
                    <a href={detailModal.item.lampiran} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline shrink-0">
                      Unduh
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="button" onClick={() => setDetailModal({ open: false, item: null })} className="px-6 rounded-xl cursor-pointer">
                Tutup
              </Button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
