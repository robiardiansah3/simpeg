/**
 * @file DaftarPegawaiPage.jsx
 * @description Komponen halaman daftar seluruh guru dan staf sekolah untuk peran Kepala Sekolah.
 * Menyediakan pencarian berdasarkan nama, NBM, atau jabatan, serta modal detail profil.
 */

import { useState, useEffect, useMemo } from 'react';
import { getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import PageHeader from '../../components/ui/page-header';
import PageTable from '../../components/ui/page-table';
import FormModal from '../../components/ui/form-modal';
import {
  Users, Eye, Mail, Phone, Calendar, MapPin, Briefcase,
  GraduationCap, BookOpen, User, Hash, Heart, Search
} from 'lucide-react';
import api from '../../lib/api';

/**
 * DaftarPegawaiPage Component
 * Render tabel data master pegawai dengan pencarian instan dan modal detail data diri.
 *
 * @returns {JSX.Element} Halaman daftar pegawai.
 */
export default function DaftarPegawaiPage() {
  const [pegawais, setPegawais] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail Modal State
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPegawais();
  }, []);

  /**
   * Mengambil daftar pegawai dari backend.
   *
   * @returns {Promise<void>}
   */
  const fetchPegawais = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pegawai');
      setPegawais(res.data?.data || []);
    } catch {
      /* silent error */
    } finally {
      setLoading(false);
    }
  };

  /**
   * Membuka modal detail pegawai tertentu.
   *
   * @param {object} pegawai Objek data pegawai.
   */
  const openDetail = (pegawai) => {
    setSelectedPegawai(pegawai);
    setIsModalOpen(true);
  };

  // Filtered pegawais based on search query
  const filteredPegawais = useMemo(() => {
    return pegawais.filter(p =>
      p.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nbm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jabatan?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pegawais, searchQuery]);

  const columns = useMemo(() => [
    {
      id: 'foto',
      header: 'Foto',
      cell: ({ row }) => {
        const foto = row.original.foto;
        const initial = row.original.nama_lengkap?.substring(0, 2).toUpperCase() || 'PG';
        return (
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-slate-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden shrink-0 shadow-sm">
            {foto ? (
              <img src={foto} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'nama_lengkap',
      header: 'Nama Pegawai',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">
            {row.original.nama_lengkap}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
            NBM: {row.original.nbm || '-'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'jabatan',
      header: 'Jabatan',
      meta: { className: 'hidden sm:table-cell' },
      cell: ({ getValue }) => <span className="font-semibold text-slate-650">{getValue()}</span>,
    },
    {
      accessorKey: 'status_kepegawaian',
      header: 'Status Kepegawaian',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ getValue }) => {
        const val = getValue();
        let variant = 'info';
        if (val?.includes('Tetap')) variant = 'success';
        if (val?.includes('Kontrak')) variant = 'warning';
        return <Badge variant={variant} className="uppercase font-bold text-[9px] tracking-wider">{val}</Badge>;
      }
    },
    {
      accessorKey: 'status',
      header: 'Jenis Pegawai',
      meta: { className: 'hidden sm:table-cell' },
      cell: ({ getValue }) => {
        const val = getValue();
        const display = val === 'guru' ? 'Guru' : val === 'pegawai(staf)' ? 'Pegawai (Staf)' : '-';
        return <span className="font-semibold text-xs text-slate-700">{display}</span>;
      }
    },
    {
      accessorKey: 'nomor_telepon',
      header: 'Nomor Telepon',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ getValue }) => <span className="text-xs font-semibold text-slate-500">{getValue() || '-'}</span>
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => openDetail(row.original)} className="flex items-center gap-1.5 cursor-pointer rounded-xl font-bold text-xs">
          <Eye size={12} /> Detail
        </Button>
      )
    }
  ], []);

  const table = useReactTable({
    data: filteredPegawais,
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
            <Users className="text-blue-600" size={24} />
            Daftar Pegawai
          </span>
        }
        subtitle="Lihat daftar seluruh tenaga pendidik dan kependidikan terdaftar di sekolah."
      />

      {/* SEARCH AND FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NBM, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 shrink-0 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
          Menampilkan {filteredPegawais.length} dari {pegawais.length} Pegawai
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <PageTable
          table={table}
          isLoading={isLoading}
          emptyIcon={<Users size={36} className="text-slate-350" />}
          emptyTitle="Tidak Ada Pegawai"
          emptyDesc={searchQuery ? "Pencarian tidak menemukan kecocokan." : "Belum ada pegawai terdaftar."}
        />
      </div>

      {/* PROFILE DETAIL MODAL */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detail Informasi Pegawai"
        size="xl"
      >
        {selectedPegawai && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="w-24 h-24 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-750 text-3xl font-black overflow-hidden shrink-0 shadow-sm">
                {selectedPegawai.foto ? (
                  <img src={selectedPegawai.foto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  selectedPegawai.nama_lengkap?.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="text-center md:text-left min-w-0 flex-1">
                <h3 className="text-lg font-black text-slate-800 truncate">{selectedPegawai.nama_lengkap}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">NBM: {selectedPegawai.nbm || '-'}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
                  <Badge variant="info" className="uppercase font-bold text-[9px] tracking-wider">{selectedPegawai.jabatan}</Badge>
                  <Badge variant="success" className="uppercase font-bold text-[9px] tracking-wider">{selectedPegawai.status_kepegawaian}</Badge>
                </div>
              </div>
            </div>

            {/* Profile Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <DetailRow icon={Hash} label="Nomor Baku Muhammadiyah (NBM)" value={selectedPegawai.nbm} />
              <DetailRow icon={User} label="Jenis Kelamin" value={selectedPegawai.jenis_kelamin} />
              <DetailRow icon={User} label="Jenis Pegawai" value={selectedPegawai.status === 'guru' ? 'Guru' : selectedPegawai.status === 'pegawai(staf)' ? 'Pegawai (Staf)' : '-'} />
              <DetailRow icon={MapPin} label="Tempat & Tanggal Lahir" value={`${selectedPegawai.tempat_lahir || '-'}, ${selectedPegawai.tanggal_lahir ? new Date(selectedPegawai.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}`} />
              <DetailRow icon={Heart} label="Agama" value={selectedPegawai.agama} />
              <DetailRow icon={GraduationCap} label="Pendidikan Terakhir" value={selectedPegawai.pendidikan_terakhir} />
              <DetailRow icon={BookOpen} label="Program Studi / Jurusan" value={selectedPegawai.jurusan} />
              <DetailRow icon={Briefcase} label="Jabatan Kepegawaian" value={selectedPegawai.jabatan} />
              <DetailRow icon={Phone} label="Nomor Telepon / WA" value={selectedPegawai.nomor_telepon} />
              <DetailRow icon={Mail} label="Alamat Email Akun" value={selectedPegawai.user?.email} />
              <DetailRow icon={Calendar} label="Bergabung Sejak" value={selectedPegawai.bergabung_sejak ? new Date(selectedPegawai.bergabung_sejak).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
            </div>

            {/* Alamat Full Width */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alamat Lengkap</span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-1.5">{selectedPegawai.alamat || '-'}</p>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}

/**
 * Komponen pembantu untuk menampilkan satu baris detail informasi pada modal.
 *
 * @param {object} props Properti komponen.
 * @param {React.ComponentType} props.icon Ikon Lucide.
 * @param {string} props.label Label informasi.
 * @param {string} props.value Nilai/Data informasi.
 * @returns {JSX.Element}
 */
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-slate-400" />
      </div>
      <div className="min-w-0">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
        <span className="text-xs font-bold text-slate-700 block mt-0.5 truncate">{value || '-'}</span>
      </div>
    </div>
  );
}
