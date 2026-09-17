/**
 * @file UKPPage.jsx
 * @description Halaman Usulan Kenaikan Pangkat (UKP) untuk Pegawai. Memungkinkan pegawai 
 * mengusulkan promosi jabatan/pangkat baru dengan melengkapi data masa kerja, target pangkat otomatis, 
 * mengunggah berkas persyaratan wajib (KTP, KK, Ijazah, dll), serta memantau status persetujuan.
 */

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import PageHeader from '../../components/ui/page-header';
import PageTable from '../../components/ui/page-table';
import FormModal from '../../components/ui/form-modal';
import { Loader2, AlertCircle, FileText, Upload, CheckSquare, Clock, Pencil, Eye, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED     = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

// Aturan dasar untuk berkas yang diunggah wajib diisi, maks 2MB, format PDF/JPG/PNG
const fileRule = z.any()
  .refine(f => f?.length === 1, 'Wajib diunggah.')
  .refine(f => f?.[0]?.size <= MAX_FILE_SIZE, 'Maks. 2MB.')
  .refine(f => ACCEPTED.includes(f?.[0]?.type), 'Hanya PDF, JPG, PNG.');

// Skema validasi pengajuan UKP baru
const schema = z.object({
  masa_kerja_tahun:        z.coerce.number().min(0, 'Minimal 0'),
  masa_kerja_bulan:        z.coerce.number().min(0).max(11, 'Maks 11'),
  dokumen_ktp:             fileRule,
  dokumen_kartu_keluarga:  fileRule,
  dokumen_ijazah:          fileRule,
  dokumen_sk_pengangkatan: fileRule,
  dokumen_sk_pembagian_tugas: fileRule,
});

// Skema validasi revisi pengajuan UKP (unggah dokumen opsional jika tidak diubah)
const editSchema = z.object({
  masa_kerja_tahun: z.coerce.number().min(0, 'Minimal 0'),
  masa_kerja_bulan: z.coerce.number().min(0).max(11, 'Maks 11'),
  dokumen_ktp:             fileRule.optional(),
  dokumen_kartu_keluarga:  fileRule.optional(),
  dokumen_ijazah:          fileRule.optional(),
  dokumen_sk_pengangkatan: fileRule.optional(),
  dokumen_sk_pembagian_tugas: fileRule.optional(),
});

const STATUS_LABEL = { diajukan: 'Menunggu', ditinjau_admin: 'Ditinjau Admin', revisi: 'Perlu Revisi', diteruskan: 'Diteruskan', disetujui: 'Disetujui', ditolak: 'Ditolak' };
const STATUS_VARIANT = { diajukan: 'warning', ditinjau_admin: 'info', revisi: 'warning', diteruskan: 'info', disetujui: 'success', ditolak: 'danger' };
const STATUS_PENGAJUAN_LABEL = { 'belum diproses': 'Belum Diproses', 'diproses': 'Diproses', 'selesai': 'Selesai' };
const STATUS_PENGAJUAN_VARIANT = { 'belum diproses': 'gray', 'diproses': 'warning', 'selesai': 'success' };

/**
 * Komponen pembantu untuk merender bidang input dengan label dan status wajib diisi.
 * 
 * @param {Object} props - Properti komponen.
 * @param {string} props.label - Label untuk kolom formulir.
 * @param {boolean} [props.required] - Tanda bintang merah jika bersifat wajib diisi.
 * @param {string} [props.error] - Pesan error validasi.
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
 * Komponen utama halaman Usulan Kenaikan Pangkat (UKP).
 * Mengelola perolehan data profil pegawai, status kepegawaian bersyarat, formulir pengiriman berkas,
 * tabel riwayat usulan, serta modal detail dan modal revisi.
 * 
 * @returns {React.ReactElement} Komponen Halaman UKP.
 */
export default function UKPPage() {
  // State Riwayat Pengajuan UKP
  const [data, setData] = useState([]);
  const [isLoadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  
  // State Mutasi Formulir Pengajuan
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Data profil pegawai untuk mendeteksi status kepegawaian secara otomatis
  const [profile, setProfile] = useState(null);

  /**
   * Menentukan secara otomatis target status baru (pangkat) berdasarkan status kepegawaian pegawai saat ini.
   */
  const targetStatus = useMemo(() => {
    if (!profile) return null;
    const currentStatus = profile.status_kepegawaian;
    let jenisPegawai = profile.status; // Berisi opsi: 'guru' atau 'pegawai(staf)'
    
    if (!jenisPegawai) {
      const isGuru = profile.jabatan?.toLowerCase().includes('guru') || profile.user?.role?.role_name === 'guru';
      jenisPegawai = isGuru ? 'guru' : 'pegawai(staf)';
    }

    if (currentStatus === 'Kontrak') {
      return jenisPegawai === 'guru' ? 'Guru Tidak Tetap Persyarikatan (GTTP)' : 'Pegawai Tidak Tetap Persyarikatan (PTTP)';
    } else if (currentStatus === 'Guru Tidak Tetap Persyarikatan (GTTP)') {
      return 'Guru Tetap Persyarikatan (GTP)';
    } else if (currentStatus === 'Pegawai Tidak Tetap Persyarikatan (PTTP)') {
      return 'Pegawai Tetap Persyarikatan (PTP)';
    }
    return null;
  }, [profile]);

  // Menentukan apakah pegawai sudah berada di pangkat/status kepegawaian tertinggi
  const isMaxStatus = useMemo(() => {
    if (!profile) return false;
    return ['Guru Tetap Persyarikatan (GTP)', 'Pegawai Tetap Persyarikatan (PTP)'].includes(profile.status_kepegawaian);
  }, [profile]);

  // Menentukan apakah target pangkat baru memerlukan Nomor Baku Muhammadiyah (NBM)
  const requiresNbm = useMemo(() => {
    if (!targetStatus) return false;
    return ['Guru Tetap Persyarikatan (GTP)', 'Pegawai Tetap Persyarikatan (PTP)'].includes(targetStatus);
  }, [targetStatus]);

  // Menentukan apakah pegawai saat ini telah memiliki NBM terdaftar di sistem
  const hasNbm = useMemo(() => {
    return !!profile?.nbm;
  }, [profile]);

  // Status kelayakan submit usulan: memblokir jika memerlukan NBM namun belum memilikinya
  const cannotSubmitDueToNbm = requiresNbm && !hasNbm;

  // State Modal Detail Usulan
  const [detailModal, setDetailModal] = useState({ open: false, item: null });

  // State Modal Revisi Usulan
  const [editModal, setEditModal] = useState({ open: false, item: null });
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState(null);

  // Status kelayakan submit revisi: memblokir jika memerlukan NBM namun belum memilikinya
  const cannotEditDueToNbm = useMemo(() => {
    if (!editModal.item) return false;
    return ['Guru Tetap Persyarikatan (GTP)', 'Pegawai Tetap Persyarikatan (PTP)'].includes(editModal.item.status_baru) && !hasNbm;
  }, [editModal.item, hasNbm]);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({ 
    resolver: zodResolver(schema),
    defaultValues: { masa_kerja_tahun: 0, masa_kerja_bulan: 0 },
    mode: 'onChange'
  });

  const editForm = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: { masa_kerja_tahun: 0, masa_kerja_bulan: 0 },
    mode: 'onChange'
  });

  const watchAllFields = watch();
  const watchEditFields = editForm.watch();

  useEffect(() => { 
    fetchUKP();
    fetchProfile();
  }, []);

  /**
   * Mengambil data profil pegawai yang aktif dari backend.
   */
  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data.data?.pegawai || null);
    } catch {
      // silent
    }
  };

  /**
   * Mengambil daftar riwayat usulan kenaikan pangkat (UKP) dari backend.
   */
  const fetchUKP = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/usulan-pangkat');
      setData(res.data.data || []);
    } catch {
      setHistoryError('Gagal memuat data riwayat.');
    } finally {
      setLoadingHistory(false);
    }
  };

  /**
   * Mengirimkan usulan kenaikan pangkat (UKP) beserta berkas persyaratan baru ke backend.
   * 
   * @param {Object} formData - Data formulir usulan baru dari React Hook Form.
   */
  const onSubmit = async (formData) => {
    setIsSubmitting(true); 
    setFormError(null);
    try {
      const fd = new FormData();
      fd.append('masa_kerja_tahun', formData.masa_kerja_tahun);
      fd.append('masa_kerja_bulan', formData.masa_kerja_bulan);
      [
        { key: 'ktp',                file: formData.dokumen_ktp[0] },
        { key: 'kartu_keluarga',     file: formData.dokumen_kartu_keluarga[0] },
        { key: 'ijazah',             file: formData.dokumen_ijazah[0] },
        { key: 'sk_pengangkatan',    file: formData.dokumen_sk_pengangkatan[0] },
        { key: 'sk_pembagian_tugas', file: formData.dokumen_sk_pembagian_tugas[0] },
      ].forEach((d, i) => {
        fd.append(`dokumen[${i}][nama_dokumen]`, d.key);
        fd.append(`dokumen[${i}][file]`, d.file);
      });
      await api.post('/usulan-pangkat', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      reset();
      await fetchUKP();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal mengirim usulan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Membuka modal detail usulan UKP.
   * 
   * @param {Object} item - Objek data usulan pangkat.
   */
  const openDetail = (item) => {
    setDetailModal({ open: true, item });
  };

  /**
   * Membuka modal revisi UKP dan menetapkan data awal untuk diperbaiki.
   * 
   * @param {Object} item - Objek data usulan pangkat.
   */
  const openEdit = (item) => {
    setEditModal({ open: true, item });
    setEditError(null);
    editForm.reset({
      masa_kerja_tahun: item.masa_kerja_tahun || 0,
      masa_kerja_bulan: item.masa_kerja_bulan || 0,
    });
  };

  /**
   * Mengirimkan data perbaikan (revisi) usulan UKP beserta dokumen yang diperbarui ke backend.
   * 
   * @param {Object} formData - Data perbaikan formulir UKP dari React Hook Form.
   */
  const onEditSubmit = async (formData) => {
    if (!editModal.item) return;
    setIsEditing(true);
    setEditError(null);
    try {
      const fd = new FormData();
      fd.append('masa_kerja_tahun', formData.masa_kerja_tahun);
      fd.append('masa_kerja_bulan', formData.masa_kerja_bulan);

      const docFields = [
        { key: 'ktp',                field: 'dokumen_ktp' },
        { key: 'kartu_keluarga',     field: 'dokumen_kartu_keluarga' },
        { key: 'ijazah',             field: 'dokumen_ijazah' },
        { key: 'sk_pengangkatan',    field: 'dokumen_sk_pengangkatan' },
        { key: 'sk_pembagian_tugas', field: 'dokumen_sk_pembagian_tugas' },
      ];
      let docIndex = 0;
      docFields.forEach(d => {
        const fileList = formData[d.field];
        if (fileList && fileList.length > 0) {
          fd.append(`dokumen[${docIndex}][nama_dokumen]`, d.key);
          fd.append(`dokumen[${docIndex}][file]`, fileList[0]);
          docIndex++;
        }
      });

      fd.append('_method', 'PUT');
      await api.post(`/usulan-pangkat/${editModal.item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditModal({ open: false, item: null });
      await fetchUKP();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Gagal menyimpan revisi. Coba lagi atau hubungi admin.');
    } finally {
      setIsEditing(false);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'nomor_usulan',
      header: 'No. Usulan',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ getValue }) => <span className="font-bold text-slate-800">{getValue() || '-'}</span>,
    },
    {
      accessorKey: 'tanggal_diajukan',
      header: 'Tanggal Diajukan',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ getValue }) => <span className="text-xs font-semibold text-slate-600">{getValue() ? new Date(getValue()).toLocaleDateString('id-ID') : '-'}</span>,
    },
    {
      id: 'masa_kerja',
      header: 'Masa Kerja',
      meta: { className: 'hidden sm:table-cell' },
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-600">{row.original.masa_kerja_tahun} Thn {row.original.masa_kerja_bulan} Bln</span>
      ),
    },
    {
      accessorKey: 'status_baru',
      header: 'Target Pangkat',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ getValue }) => <span className="text-xs font-bold text-slate-700">{getValue() || '-'}</span>,
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
      accessorKey: 'status_pengajuan',
      header: 'Status Pengajuan',
      cell: ({ getValue }) => {
        const s = getValue();
        return <Badge variant={STATUS_PENGAJUAN_VARIANT[s] ?? 'default'} className="uppercase font-bold text-[9px] tracking-wider">{STATUS_PENGAJUAN_LABEL[s] ?? s}</Badge>;
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
  ], []);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  /**
   * Mengembalikan string kelas CSS untuk komponen input berdasarkan status validasi error.
   *
   * @param {boolean} hasError Menunjukkan apakah ada error validasi pada input ini.
   * @returns {string} Gabungan kelas CSS.
   */
  const inputClass = (hasError) => `w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:ring-4 font-sans
    ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'}`;

  /**
   * Memeriksa apakah berkas persyaratan tertentu telah diisi (dipilih) pada formulir pengajuan baru.
   *
   * @param {string} fieldName Nama field berkas formulir.
   * @returns {boolean} True jika berkas terisi, False jika kosong.
   */
  const isFilled = (fieldName) => {
    const fileList = watchAllFields[fieldName];
    return fileList && fileList.length > 0;
  };

  /**
   * Memeriksa apakah berkas persyaratan tertentu telah diisi (dipilih) pada formulir revisi/edit.
   *
   * @param {string} fieldName Nama field berkas formulir revisi.
   * @returns {boolean} True jika berkas terisi, False jika kosong.
   */
  const isEditFilled = (fieldName) => {
    const fileList = watchEditFields[fieldName];
    return fileList && fileList.length > 0;
  };

  const requirements = [
    { label: 'KTP Asli', field: 'dokumen_ktp' },
    { label: 'Kartu Keluarga', field: 'dokumen_kartu_keluarga' },
    { label: 'Ijazah Terakhir', field: 'dokumen_ijazah' },
    { label: 'SK Pengangkatan', field: 'dokumen_sk_pengangkatan' },
    { label: 'SK Pembagian Tugas', field: 'dokumen_sk_pembagian_tugas' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <PageHeader 
        title="Usulan Kenaikan Pangkat" 
        subtitle="Ajukan kenaikan pangkat (UKP) dengan melengkapi berkas dan persyaratan yang diperlukan."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri: Form & Upload */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                <span>Formulir Pengajuan UKP</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isMaxStatus && (
                <div className="mb-6 flex gap-3 p-4 bg-amber-50 border border-amber-250 text-amber-800 text-xs rounded-2xl font-semibold leading-relaxed">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-extrabold text-amber-900 mb-0.5">Status Tetap Tercapai</p>
                    <p>Anda saat ini telah berstatus <strong className="text-amber-950">{profile?.status_kepegawaian}</strong>. Anda sudah berada di status kepegawaian tertinggi dan tidak dapat mengajukan usulan kenaikan pangkat lagi.</p>
                  </div>
                </div>
              )}

              {cannotSubmitDueToNbm && (
                <div className="mb-6 flex gap-3 p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl font-semibold leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <p className="font-extrabold text-red-900 mb-0.5">NBM Diperlukan</p>
                    <p>Anda belum melengkapi <strong>NBM (Nomor Baku Muhammadiyah)</strong> di profil pegawai Anda. Pengajuan kenaikan pangkat ke status Tetap (PTP/GTP) memerlukan NBM yang valid. Silakan lengkapi NBM Anda terlebih dahulu di menu Profil.</p>
                  </div>
                </div>
              )}

              {formError && (
                <div className="mb-6 flex gap-3 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-semibold">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              <form id="ukp-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* Data Masa Kerja */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Masa Kerja (Tahun)" required error={errors.masa_kerja_tahun?.message}>
                    <input type="number" min="0" disabled={isMaxStatus || cannotSubmitDueToNbm} {...register('masa_kerja_tahun')} className={inputClass(errors.masa_kerja_tahun)} />
                  </FormField>
                  <FormField label="Masa Kerja (Bulan)" required error={errors.masa_kerja_bulan?.message}>
                    <input type="number" min="0" max="11" disabled={isMaxStatus || cannotSubmitDueToNbm} {...register('masa_kerja_bulan')} className={inputClass(errors.masa_kerja_bulan)} />
                  </FormField>
                </div>

                {/* Status Kepegawaian Otomatis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Saat Ini</span>
                    <span className="text-xs font-extrabold text-slate-700 block mt-1.5">{profile?.status_kepegawaian || 'Memuat...'}</span>
                  </div>
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-150 rounded-2xl">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Target Pangkat</span>
                    <span className="text-xs font-extrabold text-emerald-800 block mt-1.5">{targetStatus || '—'}</span>
                  </div>
                </div>

                {/* Upload Dokumen */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unggah Berkas Persyaratan</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Format yang diterima: PDF/JPG/PNG. Ukuran maks 2MB per file.</p>
                  </div>

                  {requirements.map((req) => (
                    <FormField key={req.field} label={req.label} required error={errors[req.field]?.message}>
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        disabled={isMaxStatus || cannotSubmitDueToNbm}
                        className={`cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer ${inputClass(errors[req.field])}`} 
                        {...register(req.field)} 
                      />
                    </FormField>
                  ))}
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Checklist & History */}
        <div className="lg:col-span-7 space-y-6">
          
          <Card className="shadow-sm border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800">Checklist Berkas Kelengkapan</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {requirements.map((req) => (
                  <div key={req.field} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {isFilled(req.field) ? (
                        <CheckCircle2 className="text-emerald-500" size={18} />
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-md border-2 border-slate-350 bg-white" />
                      )}
                      <span className={`text-xs font-semibold ${isFilled(req.field) ? 'text-slate-800' : 'text-slate-400'}`}>
                        {req.label}
                      </span>
                    </div>
                    <FileText size={16} className={isFilled(req.field) ? 'text-blue-500' : 'text-slate-300'} />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-xl cursor-pointer" onClick={() => reset()} form="ukp-form">
                  Reset Form
                </Button>
                <Button type="submit" form="ukp-form" disabled={isSubmitting || isMaxStatus || cannotSubmitDueToNbm} className="flex-1 rounded-xl cursor-pointer">
                  {isSubmitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
                  Ajukan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800">Riwayat Pengajuan Pangkat</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <PageTable
                table={table}
                isLoading={isLoadingHistory}
                error={historyError}
                emptyIcon={<Clock size={36} className="text-slate-300" />}
                emptyTitle="Belum ada pengajuan"
                emptyDesc="Ajukan usulan kenaikan pangkat melalui form di sebelah kiri."
              />
              
              <div className="mt-6 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800 text-xs font-semibold leading-relaxed">
                <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <p>Usulan dengan status <strong className="text-amber-900">Perlu Revisi</strong> dapat Anda perbaiki kembali dengan menekan tombol <strong className="text-amber-900">Revisi</strong> di dalam tabel riwayat di atas.</p>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Modal Edit Revisi UKP */}
      <FormModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, item: null })}
        title="Revisi Usulan Kenaikan Pangkat"
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

            {cannotEditDueToNbm && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-2 text-xs text-red-800 font-semibold leading-relaxed">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="font-extrabold text-red-900 mb-0.5">NBM Diperlukan untuk Revisi</p>
                  <p>Anda belum melengkapi <strong>NBM (Nomor Baku Muhammadiyah)</strong> di profil pegawai Anda. Pengajuan/revisi kenaikan pangkat ke status Tetap (PTP/GTP) memerlukan NBM yang valid. Silakan lengkapi NBM Anda terlebih dahulu di menu Profil.</p>
                </div>
              </div>
            )}

            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Masa Kerja (Tahun)" required error={editForm.formState.errors.masa_kerja_tahun?.message}>
                  <input type="number" min="0" disabled={cannotEditDueToNbm} {...editForm.register('masa_kerja_tahun')} className={inputClass(editForm.formState.errors.masa_kerja_tahun)} />
                </FormField>
                <FormField label="Masa Kerja (Bulan)" required error={editForm.formState.errors.masa_kerja_bulan?.message}>
                  <input type="number" min="0" max="11" disabled={cannotEditDueToNbm} {...editForm.register('masa_kerja_bulan')} className={inputClass(editForm.formState.errors.masa_kerja_bulan)} />
                </FormField>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Perbarui Dokumen (Opsional)</p>
                <p className="text-[10px] text-slate-400 font-semibold mb-4">Kosongkan jika dokumen tidak perlu diubah. Dokumen lama akan tetap digunakan.</p>
                <div className="space-y-4">
                  {requirements.map((req) => (
                    <FormField key={req.field} label={req.label} error={editForm.formState.errors[req.field]?.message}>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={cannotEditDueToNbm}
                          className={`cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer flex-1 ${inputClass(editForm.formState.errors[req.field])}`}
                          {...editForm.register(req.field)}
                        />
                        {isEditFilled(req.field) && (
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        )}
                      </div>
                    </FormField>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" className="flex-1 rounded-xl cursor-pointer" onClick={() => setEditModal({ open: false, item: null })}>
                  Batal
                </Button>
                <Button type="submit" disabled={isEditing || cannotEditDueToNbm} className="flex-1 rounded-xl cursor-pointer bg-amber-600 hover:bg-amber-700 text-white border-transparent">
                  {isEditing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
                  Simpan Revisi
                </Button>
              </div>
            </form>
          </div>
        )}
      </FormModal>

      {/* Modal Detail UKP */}
      <FormModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, item: null })}
        title="Detail Usulan Kenaikan Pangkat"
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
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Kepegawaian</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-1.5">{detailModal.item.pegawai?.status_kepegawaian || '-'}</span>
              </div>
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Target Pangkat Baru</span>
                <span className="text-xs font-extrabold text-emerald-800 block mt-1.5">{detailModal.item.status_baru || '-'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Masa Kerja Usulan</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-1.5 text-blue-600">
                  {detailModal.item.masa_kerja_tahun} Tahun {detailModal.item.masa_kerja_bulan} Bulan
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Diajukan</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-1.5">
                  {detailModal.item.tanggal_diajukan ? new Date(detailModal.item.tanggal_diajukan).toLocaleString('id-ID') : '-'}
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
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status Pengajuan</span>
                <div>
                  <Badge variant={STATUS_PENGAJUAN_VARIANT[detailModal.item.status_pengajuan] ?? 'default'} className="uppercase font-bold text-[9px] tracking-wider px-2.5 py-1">
                    {STATUS_PENGAJUAN_LABEL[detailModal.item.status_pengajuan] ?? detailModal.item.status_pengajuan}
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
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dokumen Lampiran Terunggah</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {detailModal.item.dokumen?.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all group">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-xs font-bold text-slate-700 capitalize truncate">
                        {doc.nama_dokumen.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {(doc.ukuran_file / 1024).toFixed(1)} KB • {doc.status_validasi}
                      </span>
                    </div>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline shrink-0">
                        Unduh
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

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
