/**
 * @file ProfilePage.jsx
 * @description Halaman manajemen Profil Pegawai. Memungkinkan pegawai untuk melihat
 * data diri lengkap mereka dan memperbarui informasi serta foto profil.
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import FormModal from '../components/ui/form-modal';
import PageHeader from '../components/ui/page-header';
import {
  Loader2, User, Mail, Save, CheckCircle2, AlertCircle,
  Phone, MapPin, Briefcase, Calendar, FileText, BookOpen, GraduationCap, Edit
} from 'lucide-react';
import api from '../lib/api';

/**
 * Komponen pembantu untuk merender input formulir yang distandardisasi.
 * 
 * @param {Object} props - Properti komponen.
 * @param {string} props.label - Label untuk input.
 * @param {string} props.name - Nama input untuk React Hook Form.
 * @param {Function} props.register - Fungsi register dari React Hook Form.
 * @param {string} [props.type='text'] - Tipe input HTML (misal: 'text', 'date').
 * @param {Array} [props.options] - Opsi pilihan jika tipe input adalah select.
 * @param {string} [props.placeholder] - Teks placeholder input.
 * @param {boolean} [props.required] - Menentukan apakah kolom input wajib diisi.
 */
const FormField = ({ label, name, register, type = 'text', options, placeholder, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {options ? (
      <select
        {...register(name, { required })}
        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:ring-4 font-sans bg-white"
      >
        <option value="">-- Pilih --</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    ) : (
      <input
        type={type} placeholder={placeholder}
        {...register(name, { required })}
        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:ring-4 font-sans"
      />
    )}
  </div>
);

/**
 * Komponen baris informasi detail profil (read-only).
 * 
 * @param {Object} props - Properti komponen.
 * @param {React.Component} props.icon - Ikon Lucide untuk baris data.
 * @param {string} props.label - Label informasi.
 * @param {string|number} props.value - Nilai informasi.
 */
const DataRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 py-3.5 border-b border-slate-100 last:border-b-0 group">
    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-50/50 transition-colors duration-200">
      <Icon size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800 break-words leading-tight">{value || '-'}</p>
    </div>
  </div>
);

/**
 * Halaman utama Profil Pegawai.
 * Mengambil, merender, dan memperbarui informasi biodata kepegawaian pengguna.
 * 
 * @returns {React.ReactElement} Komponen Halaman Profil Pegawai.
 */
export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  /**
   * Memuat data profil pegawai yang login dari backend dan mereset form state.
   *
   * @returns {Promise<void>}
   */
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/profile');
      const data = res.data.data;
      setPegawai(data.pegawai);
      if (data.pegawai) {
        reset({
          nbm:                 data.pegawai.nbm || '',
          nama_lengkap:        data.pegawai.nama_lengkap || '',
          jenis_kelamin:       data.pegawai.jenis_kelamin || '',
          tempat_lahir:        data.pegawai.tempat_lahir || '',
          tanggal_lahir:       data.pegawai.tanggal_lahir || '',
          agama:               data.pegawai.agama || '',
          pendidikan_terakhir: data.pegawai.pendidikan_terakhir || '',
          jurusan:             data.pegawai.jurusan || '',
          jabatan:             data.pegawai.jabatan || '',
          status_kepegawaian:  data.pegawai.status_kepegawaian || '',
          status:              data.pegawai.status || '',
          alamat:              data.pegawai.alamat || '',
          nomor_telepon:       data.pegawai.nomor_telepon || '',
        });
      }
    } catch (err) {
      console.error('Gagal memuat profil:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /**
   * Mengirimkan perubahan data profil pegawai dan foto profil baru ke backend.
   *
   * @param {object} formData Objek data formulir profil dari React Hook Form.
   * @returns {Promise<void>}
   */
  const onSubmit = async (formData) => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'foto') {
          if (formData[key] && formData[key].length > 0) {
            fd.append('foto', formData[key][0]);
          }
        } else if (formData[key] !== null && formData[key] !== undefined) {
          fd.append(key, formData[key]);
        }
      });
      fd.append('_method', 'PUT');

      await api.post('/profile/pegawai', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSaveStatus('success');
      await loadData();
      setTimeout(() => { setSaveStatus(null); setIsEditOpen(false); }, 1500);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <Loader2 size={32} className="animate-spin text-blue-600" />
    </div>
  );

  const initials = (pegawai?.nama_lengkap || user?.name || 'U')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto animate-in fade-in duration-300">
      <PageHeader title="Profil Saya" subtitle="Informasi pribadi dan data kepegawaian Anda" />

      {/* Warning banner jika profil belum lengkap */}
      {!pegawai?.nama_lengkap && (
        <div className="flex gap-3.5 p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-pulse">
          <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-blue-800 leading-normal">
            Silakan lengkapi profil Anda dengan menekan tombol <strong>Edit Profil</strong>. Data diperlukan untuk pengajuan cuti dan kenaikan pangkat.
          </p>
        </div>
      )}

      {/* ── 3-Column Responsive Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Kolom Kiri — Avatar (Desktop: w-64 equivalent -> col-span-3) */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <Card className="w-full p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-extrabold text-white mb-4 shadow-md overflow-hidden shrink-0 border border-slate-100">
              {pegawai?.foto ? (
                <img src={pegawai.foto} alt="Foto Profil" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <h2 className="text-base font-bold text-slate-800 tracking-tight leading-tight mb-1">
              {pegawai?.nama_lengkap || user?.name || '-'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mb-1">
              NBM. {pegawai?.nbm || '-'}
            </p>
            <p className="text-xs text-slate-400 font-medium mb-4">
              {pegawai?.jabatan || '-'}
            </p>
            
            <Badge variant="success" className="mb-6 uppercase tracking-wider px-3 py-1 font-bold">
              Pegawai Aktif
            </Badge>

            <Button onClick={() => setIsEditOpen(true)} className="w-full rounded-xl py-2.5 font-bold shadow-sm shadow-blue-500/10 cursor-pointer">
              <Edit size={14} className="mr-2" />
              Edit Profil
            </Button>

            {/* Kontak Darurat */}
            {pegawai?.kontak_darurat_nama && (
              <div className="w-full mt-6 border-t border-slate-100 pt-5 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Kontak Darurat
                </p>
                <DataRow icon={User} label="Nama" value={pegawai?.kontak_darurat_nama} />
                <DataRow icon={Phone} label="No. HP" value={pegawai?.kontak_darurat_telepon} />
              </div>
            )}
          </Card>
        </div>

        {/* Kolom Tengah — Data Pribadi */}
        <div className="lg:col-span-5">
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                <span>Data Pribadi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-slate-100">
              <DataRow icon={User}     label="Username"       value={user?.username} />
              <DataRow icon={Mail}     label="Email"          value={user?.email} />
              <DataRow icon={Phone}    label="No. Handphone"  value={pegawai?.nomor_telepon} />
              <DataRow icon={User}     label="Jenis Kelamin"  value={pegawai?.jenis_kelamin} />
              <DataRow icon={BookOpen} label="Agama"          value={pegawai?.agama} />
              <DataRow icon={MapPin}   label="Tempat Lahir"   value={pegawai?.tempat_lahir} />
              <DataRow icon={Calendar} label="Tanggal Lahir"  value={pegawai?.tanggal_lahir ? new Date(pegawai.tanggal_lahir).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : ''} />
              <DataRow icon={MapPin}   label="Alamat"         value={pegawai?.alamat} />
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan — Data Kepegawaian */}
        <div className="lg:col-span-4">
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" />
                <span>Data Kepegawaian</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-slate-100">
              <DataRow icon={Briefcase}     label="Role Akses"          value={user?.role?.display_name || user?.role?.role_name} />
              <DataRow icon={Briefcase}     label="Jabatan"             value={pegawai?.jabatan} />
              <DataRow icon={GraduationCap} label="Pendidikan Terakhir" value={pegawai?.pendidikan_terakhir} />
              <DataRow icon={BookOpen}      label="Jurusan"             value={pegawai?.jurusan} />
              <DataRow icon={FileText}      label="Status Kepegawaian"  value={pegawai?.status_kepegawaian} />
              <DataRow icon={User}          label="Jenis Pegawai"       value={pegawai?.status === 'guru' ? 'Guru' : pegawai?.status === 'pegawai(staf)' ? 'Pegawai (Staf)' : '-'} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Modal Edit Profil ── */}
      <FormModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Profil Saya" size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="NBM"              name="nbm"               register={register} placeholder="Nomor Baku Muhammadiyah" />
            <FormField label="Nama Lengkap"     name="nama_lengkap"      register={register} placeholder="Nama sesuai KTP" required />
            <FormField label="Jenis Kelamin"    name="jenis_kelamin"     register={register}
              options={[{ value: 'Laki-laki', label: 'Laki-laki' }, { value: 'Perempuan', label: 'Perempuan' }]} />
            <FormField label="Agama"            name="agama"             register={register}
              options={['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu'].map(v => ({ value: v, label: v }))} />
            <FormField label="Tempat Lahir"     name="tempat_lahir"      register={register} placeholder="Kota kelahiran" />
            <FormField label="Tanggal Lahir"    name="tanggal_lahir"     register={register} type="date" />
            <FormField label="Nomor Telepon"    name="nomor_telepon"     register={register} placeholder="08xxxxxxxxxx" />
            <FormField label="Jabatan"            name="jabatan"           register={register} placeholder="Jabatan saat ini" />
            <FormField label="Status Kepegawaian" name="status_kepegawaian" register={register}
              options={[
                { value: 'Kontrak', label: 'Kontrak' },
                { value: 'Pegawai Tidak Tetap Persyarikatan (PTTP)', label: 'PTTP' },
                { value: 'Pegawai Tetap Persyarikatan (PTP)', label: 'PTP' },
                { value: 'Guru Tidak Tetap Persyarikatan (GTTP)', label: 'GTTP' },
                { value: 'Guru Tetap Persyarikatan (GTP)', label: 'GTP' },
              ]} />
            <FormField label="Jenis Pegawai" name="status" register={register}
              options={[
                { value: 'guru', label: 'Guru' },
                { value: 'pegawai(staf)', label: 'Pegawai (Staf)' },
              ]} />
            <FormField label="Pendidikan Terakhir" name="pendidikan_terakhir" register={register} placeholder="S1, S2, ..." />
            <FormField label="Jurusan"          name="jurusan"           register={register} placeholder="Jurusan pendidikan" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Foto Profil
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                {...register('foto')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:ring-4 font-sans file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Format JPG/JPEG/PNG. Maks 2MB.</span>
            </div>
          </div>
          
          {/* Alamat full-width */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Lengkap</label>
            <textarea 
              {...register('alamat')} 
              rows={3} 
              placeholder="Alamat lengkap sesuai KTP"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:ring-4 font-sans resize-vertical"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-100">
            <div>
              {saveStatus === 'success' && <span className="text-emerald-600 text-xs font-bold flex items-center gap-1.5"><CheckCircle2 size={16} /> Tersimpan!</span>}
              {saveStatus === 'error'   && <span className="text-red-600 text-xs font-bold flex items-center gap-1.5"><AlertCircle size={16} /> Gagal menyimpan.</span>}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl cursor-pointer">Batal</Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl cursor-pointer flex items-center gap-2">
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Data'}</span>
              </Button>
            </div>
          </div>
        </form>
      </FormModal>

    </div>
  );
}
