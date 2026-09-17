/**
 * @file RiwayatPengajuanPage.jsx
 * @description Halaman Riwayat Pengajuan Terpadu untuk Pegawai. Menggabungkan data 
 * pengajuan Cuti dan Usulan Kenaikan Pangkat (UKP) ke dalam satu kronologi riwayat terpadu.
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import {
  FileText, Calendar, ClipboardList, Loader2, AlertCircle,
  Clock, CheckCircle2, XCircle, ChevronRight, TrendingUp, Filter, Eye, Download
} from 'lucide-react';
import FormModal from '../../components/ui/form-modal';

const STATUS_MAP = {
  diajukan:        { label: 'Menunggu',      color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  ditinjau_admin:  { label: 'Ditinjau',      color: 'bg-blue-100 text-blue-700 border-blue-200' },
  diteruskan:      { label: 'Diteruskan',    color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  disetujui:       { label: 'Disetujui',     color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ditolak:         { label: 'Ditolak',       color: 'bg-red-100 text-red-700 border-red-200' },
};

const STATUS_ICON = {
  diajukan:        <Clock size={13} />,
  ditinjau_admin:  <ClipboardList size={13} />,
  diteruskan:      <TrendingUp size={13} />,
  disetujui:       <CheckCircle2 size={13} />,
  ditolak:         <XCircle size={13} />,
};

/**
 * Komponen lencana status (status badge) berwarna-warni sesuai dengan kondisi persetujuan usulan.
 * 
 * @param {Object} props - Properti komponen.
 * @param {string} props.status - Status usulan (diajukan, ditinjau_admin, disetujui, ditolak, dll).
 */
function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, color: 'bg-slate-100 text-slate-600 border-slate-200' };
  const icon = STATUS_ICON[status] || null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      {icon} {cfg.label}
    </span>
  );
}

/**
 * Komponen Halaman utama Riwayat Pengajuan Pegawai.
 * Menampilkan linimasa terpadu berisi riwayat cuti dan UKP dengan fitur filter serta modal detail cepat.
 * 
 * @returns {React.ReactElement} Komponen Halaman Riwayat Pengajuan.
 */
export default function RiwayatPengajuanPage() {
  const navigate = useNavigate();
  const [cuti, setCuti] = useState([]);
  const [ukp, setUkp] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('semua'); // Opsi filter: 'semua' | 'cuti' | 'ukp'
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  /**
   * Menampilkan modal detail usulan yang dipilih (baik cuti maupun UKP).
   * 
   * @param {Object} item - Objek data usulan terpilih.
   */
  const handleViewDetail = (item) => {
    setSelectedDetail(item);
    setIsDetailOpen(true);
  };

  // Memuat riwayat cuti dan UKP secara paralel menggunakan Promise.all
  useEffect(() => {
    Promise.all([
      api.get('/cuti').catch(() => ({ data: { data: [] } })),
      api.get('/usulan-pangkat').catch(() => ({ data: { data: [] } }))
    ]).then(([resCuti, resUkp]) => {
      setCuti(resCuti.data?.data || []);
      setUkp(resUkp.data?.data || []);
    }).finally(() => setIsLoading(false));
  }, []);

  // Menggabungkan dan mengurutkan seluruh pengajuan berdasarkan tanggal terbaru
  const allPengajuan = [
    ...cuti.map(c => ({
      id: `cuti-${c.id}`,
      type: 'cuti',
      label: 'Usulan Cuti Tahunan',
      icon: <Calendar size={16} className="text-blue-500" />,
      tanggal: c.tanggal_mulai,
      tanggal_akhir: c.tanggal_selesai,
      diajukan: c.created_at,
      status: c.status,
      keterangan: c.keterangan || c.alasan || '-',
      detail: c,
      path: '/cuti',
    })),
    ...ukp.map(u => ({
      id: `ukp-${u.id}`,
      type: 'ukp',
      label: 'Usulan Kenaikan Pangkat',
      icon: <TrendingUp size={16} className="text-purple-500" />,
      tanggal: u.tanggal_diajukan,
      diajukan: u.tanggal_diajukan || u.created_at,
      status: u.status,
      status_pengajuan: u.status_pengajuan,
      keterangan: u.catatan_admin || '-',
      detail: u,
      path: '/ukp',
    }))
  ].sort((a, b) => new Date(b.diajukan) - new Date(a.diajukan));

  const filtered = filter === 'semua' ? allPengajuan
    : filter === 'cuti' ? allPengajuan.filter(p => p.type === 'cuti')
    : allPengajuan.filter(p => p.type === 'ukp');

  // Stats
  const totalCuti = cuti.length;
  const totalUkp = ukp.length;
  const totalDisetujui = allPengajuan.filter(p => p.status === 'disetujui').length;
  const totalDitolak = allPengajuan.filter(p => p.status === 'ditolak').length;
  const totalAktif = allPengajuan.filter(p => ['diajukan', 'ditinjau_admin', 'diteruskan'].includes(p.status)).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Riwayat Pengajuan</h1>
          <p className="text-sm text-slate-500 mt-1">Semua riwayat usulan cuti dan kenaikan pangkat Anda</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Cuti', value: totalCuti, color: 'text-blue-600', bg: 'bg-blue-50', icon: <Calendar size={18} /> },
          { label: 'Total UKP', value: totalUkp, color: 'text-purple-600', bg: 'bg-purple-50', icon: <TrendingUp size={18} /> },
          { label: 'Disetujui', value: totalDisetujui, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={18} /> },
          { label: 'Sedang Proses', value: totalAktif, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={18} /> },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-4 border-b border-slate-100 overflow-x-auto">
          <Filter size={14} className="text-slate-400 mr-2 shrink-0" />
          {[
            { key: 'semua', label: `Semua (${allPengajuan.length})` },
            { key: 'cuti', label: `Cuti (${cuti.length})` },
            { key: 'ukp', label: `UKP (${ukp.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                filter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <FileText size={28} className="text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700 text-base mb-1">Belum Ada Pengajuan</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              {filter === 'cuti' ? 'Anda belum pernah mengajukan cuti.'
               : filter === 'ukp' ? 'Anda belum pernah mengajukan kenaikan pangkat.'
               : 'Anda belum memiliki riwayat pengajuan apapun.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.type === 'cuti' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800 text-sm leading-snug">{item.label}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock size={11} />
                          Diajukan: {item.diajukan ? new Date(item.diajukan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </span>
                        {item.tanggal && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Calendar size={11} />
                            {item.type === 'cuti'
                              ? `${new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}${item.tanggal_akhir ? ` – ${new Date(item.tanggal_akhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}`
                              : new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {item.keterangan && item.keterangan !== '-' && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">"{item.keterangan}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.type === 'ukp' && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          item.status_pengajuan === 'selesai' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          item.status_pengajuan === 'diproses' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {item.status_pengajuan === 'selesai' ? 'Selesai' :
                           item.status_pengajuan === 'diproses' ? 'Diproses' : 'Belum Diproses'}
                        </span>
                      )}
                      <StatusBadge status={item.status} />
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold transition-all border border-slate-200 hover:border-blue-200"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400 font-medium">
              Menampilkan {filtered.length} dari {allPengajuan.length} pengajuan
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <FormModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedDetail(null);
        }}
        title={selectedDetail?.type === 'cuti' ? 'Detail Usulan Cuti Tahunan' : 'Detail Usulan Kenaikan Pangkat'}
        size="lg"
      >
        {selectedDetail && (
          <div className="flex flex-col gap-5">
            {/* Header info */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">{selectedDetail.label}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Diajukan pada: {selectedDetail.diajukan ? new Date(selectedDetail.diajukan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} WIB
                </p>
              </div>
              <StatusBadge status={selectedDetail.status} />
            </div>

            {/* Profil Singkat Pegawai */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-750 font-black shrink-0">
                {selectedDetail.detail.pegawai?.nama_lengkap?.substring(0, 2).toUpperCase() || 'PG'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{selectedDetail.detail.pegawai?.nama_lengkap || '-'}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">NBM: {selectedDetail.detail.pegawai?.nbm || '-'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                  Jabatan: {selectedDetail.detail.pegawai?.jabatan || '-'} • Status: {selectedDetail.detail.pegawai?.status_kepegawaian || '-'}
                </p>
              </div>
            </div>

            {/* Fields */}
            {selectedDetail.type === 'cuti' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Jenis Cuti</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">{selectedDetail.detail.jenis_cuti}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Lama Cuti</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">{selectedDetail.detail.jumlah_hari} hari</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Tanggal Mulai</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">
                    {selectedDetail.detail.tanggal_mulai ? new Date(selectedDetail.detail.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Tanggal Selesai</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">
                    {selectedDetail.detail.tanggal_selesai ? new Date(selectedDetail.detail.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </span>
                </div>
                <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Alasan Pengajuan</span>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-1 whitespace-pre-wrap">{selectedDetail.detail.alasan}</p>
                </div>
                {selectedDetail.detail.lampiran && (
                  <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider block mb-1">Lampiran Dokumen</span>
                    <a
                      href={selectedDetail.detail.lampiran}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-800 px-3 py-1.5 bg-white border border-blue-200 hover:border-blue-300 rounded-lg shadow-sm transition-colors"
                    >
                      <Download size={13} /> Unduh Lampiran
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Nomor Usulan</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">{selectedDetail.detail.nomor_usulan || '-'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Status Kepegawaian</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">{selectedDetail.detail.pegawai?.status_kepegawaian || '-'}</span>
                </div>
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Target Pangkat Baru</span>
                  <span className="text-xs font-bold text-emerald-800 block mt-1">{selectedDetail.detail.status_baru || '-'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Masa Kerja</span>
                  <span className="text-xs font-bold text-slate-700 block mt-1">
                    {selectedDetail.detail.masa_kerja_tahun} Tahun {selectedDetail.detail.masa_kerja_bulan} Bulan
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Status Pengajuan</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold border ${
                    selectedDetail.status_pengajuan === 'selesai' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    selectedDetail.status_pengajuan === 'diproses' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-slate-100 text-slate-650 border-slate-200'
                  }`}>
                    {selectedDetail.status_pengajuan === 'selesai' ? 'Selesai' :
                     selectedDetail.status_pengajuan === 'diproses' ? 'Diproses' : 'Belum Diproses'}
                  </span>
                </div>

                {/* Dokumen UKP */}
                <div className="md:col-span-2">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Dokumen Persyaratan</h4>
                  {selectedDetail.detail.dokumen && selectedDetail.detail.dokumen.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedDetail.detail.dokumen.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                          <div>
                            <span className="text-xs font-bold text-slate-700 block capitalize">{doc.nama_dokumen?.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Status: <span className="font-semibold text-slate-600">{doc.status_validasi}</span></span>
                            {doc.catatan_validasi && (
                              <p className="text-[10px] text-red-500 mt-1 italic">"{doc.catatan_validasi}"</p>
                            )}
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 rounded-lg shadow-sm transition-colors"
                          >
                            <Download size={12} /> Unduh
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Tidak ada dokumen terlampir.</p>
                  )}
                </div>
              </div>
            )}

            {/* Catatan Validasi / Verifikasi */}
            {(selectedDetail.detail.catatan_admin || selectedDetail.detail.catatan_kepsek) && (
              <div className="mt-2 p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Catatan Evaluasi</h4>
                {selectedDetail.detail.catatan_admin && (
                  <div>
                    <span className="text-[9px] font-bold text-amber-700 uppercase">Catatan Admin</span>
                    <p className="text-xs text-amber-900 mt-0.5">"{selectedDetail.detail.catatan_admin}"</p>
                  </div>
                )}
                {selectedDetail.detail.catatan_kepsek && (
                  <div>
                    <span className="text-[9px] font-bold text-amber-700 uppercase">Catatan Kepala Sekolah</span>
                    <p className="text-xs text-amber-900 mt-0.5">"{selectedDetail.detail.catatan_kepsek}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedDetail(null);
                }}
                className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
