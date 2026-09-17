<x-filament-panels::page>
    @php
        $record = $this->record;
    @endphp
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Informasi Pengajuan -->
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
                    <x-heroicon-o-document-text class="w-5 h-5 text-primary-600" style="width: 20px; height: 20px;" />
                    Informasi Usulan Kenaikan Pangkat
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">No. Pengajuan</span>
                        <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 font-mono">{{ $record->nomor_usulan }}</span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Masa Kerja Tambahan</span>
                        <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {{ $record->masa_kerja_tahun }} Tahun {{ $record->masa_kerja_bulan }} Bulan
                        </span>
                    </div>
                    <div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 my-2"></div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Nama Pegawai</span>
                        <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ $record->pegawai->nama_lengkap }}</span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">NIP / NBM</span>
                        <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ $record->pegawai->nbm ?? '—' }}</span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Jabatan Saat Ini</span>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $record->pegawai->jabatan }}</span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Status Saat Ini</span>
                        <span class="text-sm font-semibold text-amber-650 dark:text-amber-400">{{ $record->pegawai->status_kepegawaian ?? '—' }}</span>
                    </div>
                    <div class="md:col-span-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Target Pangkat / Status Baru</span>
                        <span class="text-sm font-bold text-emerald-600 dark:text-emerald-450">{{ $record->status_baru ?? '—' }}</span>
                    </div>
                    <div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 my-2"></div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Tanggal Diajukan</span>
                        <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {{ $record->tanggal_diajukan ? $record->tanggal_diajukan->format('d M Y H:i') : '—' }}
                        </span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Tanggal Peninjauan Akhir</span>
                        <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {{ $record->tanggal_diverifikasi ? $record->tanggal_diverifikasi->format('d M Y H:i') : '—' }}
                        </span>
                    </div>
                    @if($record->catatan_admin)
                        <div class="md:col-span-2 mt-4">
                            <span class="text-xs text-red-500 block uppercase tracking-wider font-semibold">Catatan Verifikasi / Penolakan</span>
                            <p class="text-sm text-red-800 bg-red-50 dark:bg-red-950 dark:text-red-300 mt-1 leading-relaxed p-3 rounded-lg border border-red-100 dark:border-red-900">
                                {{ $record->catatan_admin }}
                            </p>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Right Column: Dokumen Persyaratan & Riwayat Persetujuan -->
        <div class="lg:col-span-1 space-y-6">
            <!-- Lampiran Card -->
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
                    <x-heroicon-o-paper-clip class="w-5 h-5 text-primary-600" style="width: 20px; height: 20px;" />
                    Berkas Persyaratan UKP
                </h2>
                
                <div class="space-y-3">
                    @forelse($record->dokumen as $doc)
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-lg">
                            <div class="flex items-center gap-3">
                                <x-heroicon-o-document-arrow-down class="w-6 h-6 text-primary-500" style="width: 24px; height: 24px;" />
                                <div>
                                    <span class="text-xs font-bold text-gray-400 block uppercase tracking-wider">
                                        {{ str_replace('_', ' ', $doc->nama_dokumen) }}
                                    </span>
                                    <span class="text-xs text-gray-500">
                                        {{ $doc->tipe_file ? strtoupper($doc->tipe_file) : 'PDF' }} • {{ $doc->ukuran_file ? round($doc->ukuran_file / 1024) . ' KB' : '—' }}
                                    </span>
                                </div>
                            </div>
                            @if($doc->file_dokumen)
                                <a href="{{ Storage::url($doc->file_dokumen) }}" target="_blank" class="text-primary-600 hover:text-primary-700" title="Unduh File">
                                    <x-heroicon-o-arrow-down-tray class="w-5 h-5" style="width: 20px; height: 20px;" />
                                </a>
                            @endif
                        </div>
                    @empty
                        <div class="text-center py-6 text-gray-500 dark:text-gray-450 italic">
                            Belum ada dokumen yang diunggah oleh pegawai.
                        </div>
                    @endforelse
                </div>
            </div>

            <!-- Riwayat Persetujuan Card -->
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
                    <x-heroicon-o-clock class="w-5 h-5 text-primary-600" style="width: 20px; height: 20px;" />
                    Riwayat Persetujuan
                </h2>
                
                <div class="relative pl-6 border-l border-gray-200 dark:border-gray-800 space-y-6">
                    <!-- Point 1: Diajukan -->
                    <div class="relative">
                        <span class="absolute -left-[31px] top-0 bg-emerald-500 text-white rounded-full p-1.5 flex items-center justify-center w-6 h-6 border-4 border-white dark:border-gray-900">
                            <x-heroicon-s-check class="w-3 h-3" style="width: 12px; height: 12px;" />
                        </span>
                        <div>
                            <span class="text-xs text-gray-400 block font-medium">
                                {{ $record->tanggal_diajukan ? $record->tanggal_diajukan->format('d M Y H:i') : '—' }}
                            </span>
                            <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 block mt-0.5">Diajukan oleh Pegawai</span>
                            <p class="text-xs text-gray-500 mt-1">Usulan kenaikan pangkat berhasil diajukan.</p>
                        </div>
                    </div>

                    <!-- Point 2: Verifikasi Status -->
                    @if(in_array($record->status, ['diajukan', 'ditinjau_admin']))
                        <div class="relative">
                            <span class="absolute -left-[31px] top-0 bg-amber-500 text-white rounded-full p-1.5 flex items-center justify-center w-6 h-6 border-4 border-white dark:border-gray-900 animate-pulse">
                                <x-heroicon-s-arrow-path class="w-3 h-3" style="width: 12px; height: 12px;" />
                            </span>
                            <div>
                                <span class="text-xs text-gray-400 block font-medium">Proses</span>
                                <span class="text-sm font-semibold text-gray-850 dark:text-gray-300 block mt-0.5">Menunggu Verifikasi Admin</span>
                                <p class="text-xs text-gray-500 mt-1">Berkas persyaratan sedang menunggu verifikasi awal dari tim admin.</p>
                            </div>
                        </div>
                    @else
                        <div class="relative">
                            <span class="absolute -left-[31px] top-0 bg-emerald-500 text-white rounded-full p-1.5 flex items-center justify-center w-6 h-6 border-4 border-white dark:border-gray-900">
                                <x-heroicon-s-check class="w-3 h-3" style="width: 12px; height: 12px;" />
                            </span>
                            <div>
                                <span class="text-xs text-gray-400 block font-medium">
                                    {{ $record->tanggal_diverifikasi ? $record->tanggal_diverifikasi->format('d M Y H:i') : '—' }}
                                </span>
                                <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 block mt-0.5">Telah Ditinjau Admin</span>
                                <p class="text-xs text-gray-500 mt-1">Seluruh berkas administrasi dinyatakan lengkap dan valid.</p>
                            </div>
                        </div>
                    @endif

                    <!-- Point 3: Keputusan Kepala Sekolah -->
                    @if($record->status === 'disetujui')
                        <div class="relative">
                            <span class="absolute -left-[31px] top-0 bg-emerald-500 text-white rounded-full p-1.5 flex items-center justify-center w-6 h-6 border-4 border-white dark:border-gray-900">
                                <x-heroicon-s-check class="w-3 h-3" style="width: 12px; height: 12px;" />
                            </span>
                            <div>
                                <span class="text-xs text-gray-400 block font-medium">
                                    {{ $record->tanggal_diverifikasi ? $record->tanggal_diverifikasi->format('d M Y H:i') : '—' }}
                                </span>
                                <span class="text-sm font-bold text-emerald-600 block mt-0.5">Disetujui Kepala Sekolah</span>
                                <p class="text-xs text-gray-500 mt-1">Usulan kenaikan pangkat disetujui sepenuhnya oleh Kepala Sekolah.</p>
                            </div>
                        </div>
                    @elseif($record->status === 'ditolak')
                        <div class="relative">
                            <span class="absolute -left-[31px] top-0 bg-red-500 text-white rounded-full p-1.5 flex items-center justify-center w-6 h-6 border-4 border-white dark:border-gray-900">
                                <x-heroicon-s-x-mark class="w-3 h-3" style="width: 12px; height: 12px;" />
                            </span>
                            <div>
                                <span class="text-xs text-gray-400 block font-medium">
                                    {{ $record->tanggal_diverifikasi ? $record->tanggal_diverifikasi->format('d M Y H:i') : '—' }}
                                </span>
                                <span class="text-sm font-bold text-red-655 block mt-0.5">Ditolak Kepala Sekolah</span>
                                <p class="text-xs text-gray-500 mt-1">Usulan kenaikan pangkat tidak disetujui. Hubungi admin SIMPEG.</p>
                            </div>
                        </div>
                    @elseif($record->status === 'revisi')
                        <div class="relative">
                            <span class="absolute -left-[31px] top-0 bg-amber-500 text-white rounded-full p-1.5 flex items-center justify-center w-6 h-6 border-4 border-white dark:border-gray-900">
                                <x-heroicon-s-exclamation-triangle class="w-3 h-3" style="width: 12px; height: 12px;" />
                            </span>
                            <div>
                                <span class="text-xs text-gray-400 block font-medium">
                                    {{ $record->tanggal_diverifikasi ? $record->tanggal_diverifikasi->format('d M Y H:i') : '—' }}
                                </span>
                                <span class="text-sm font-bold text-amber-600 block mt-0.5">Perlu Revisi Berkas</span>
                                <p class="text-xs text-gray-500 mt-1">Terdapat berkas yang tidak sesuai/valid dan perlu diunggah ulang.</p>
                            </div>
                        </div>
                    @else
                        <div class="relative">
                            <span class="absolute -left-[31px] top-0 bg-gray-300 text-white rounded-full p-1.5 flex items-center justify-center w-6 h-6 border-4 border-white dark:border-gray-900">
                                <x-heroicon-s-minus class="w-3 h-3" style="width: 12px; height: 12px;" />
                            </span>
                            <div>
                                <span class="text-xs text-gray-400 block font-medium">Antrian</span>
                                <span class="text-sm font-semibold text-gray-405 block mt-0.5">Persetujuan Kepala Sekolah</span>
                                <p class="text-xs text-gray-450 mt-1">Menunggu peninjauan dan keputusan akhir dari Kepala Sekolah.</p>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-filament-panels::page>
