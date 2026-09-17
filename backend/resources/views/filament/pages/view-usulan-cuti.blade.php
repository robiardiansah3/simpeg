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
                    Informasi Pengajuan Cuti
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">No. Pengajuan</span>
                        <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 font-mono">{{ $record->nomor_usulan }}</span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Jenis Cuti</span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 mt-1">
                            {{ $record->jenis_cuti }}
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
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Jabatan</span>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $record->pegawai->jabatan }}</span>
                    </div>
                    <div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 my-2"></div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Rentang Tanggal</span>
                        <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {{ $record->tanggal_mulai ? $record->tanggal_mulai->format('d M Y') : '—' }} s/d {{ $record->tanggal_selesai ? $record->tanggal_selesai->format('d M Y') : '—' }}
                        </span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Durasi Cuti</span>
                        <span class="text-sm font-bold text-primary-600 bg-primary-50 dark:bg-primary-950 px-2.5 py-0.5 rounded mt-1 inline-block">
                            {{ $record->jumlah_hari }} Hari Kerja
                        </span>
                    </div>
                    <div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 my-2"></div>
                    <div class="md:col-span-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Alasan Pengajuan</span>
                        <p class="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-850">
                            {{ $record->alasan ?? 'Tidak ada alasan khusus yang dicantumkan.' }}
                        </p>
                    </div>
                    @if($record->catatan_admin)
                        <div class="md:col-span-2 mt-2">
                            <span class="text-xs text-red-500 block uppercase tracking-wider font-semibold">Catatan Verifikasi / Penolakan</span>
                            <p class="text-sm text-red-800 bg-red-50 dark:bg-red-950 dark:text-red-300 mt-1 leading-relaxed p-3 rounded-lg border border-red-100 dark:border-red-900">
                                {{ $record->catatan_admin }}
                            </p>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Right Column: Lampiran & Riwayat Persetujuan -->
        <div class="lg:col-span-1 space-y-6">
            <!-- Lampiran Card -->
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
                    <x-heroicon-o-paper-clip class="w-5 h-5 text-primary-600" style="width: 20px; height: 20px;" />
                    Lampiran Pendukung
                </h2>
                
                <div class="space-y-3">
                    @if($record->lampiran)
                        @php
                            $filename = basename($record->lampiran);
                            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                            $iconColor = match($ext) {
                                'pdf'  => 'text-red-500',
                                'png', 'jpg', 'jpeg' => 'text-blue-500',
                                default => 'text-gray-500',
                            };
                            $fileUrl = asset('storage/' . $record->lampiran);
                        @endphp
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-lg">
                            <div class="flex items-center gap-3">
                                <x-heroicon-o-document-arrow-down class="w-6 h-6 {{ $iconColor }}" style="width: 24px; height: 24px;" />
                                <div>
                                    <span class="text-sm font-semibold text-gray-800 dark:text-gray-200 block">{{ $filename }}</span>
                                    <span class="text-xs text-gray-500">Lampiran Pegawai</span>
                                </div>
                            </div>
                            <a href="{{ $fileUrl }}" target="_blank" rel="noopener noreferrer"
                               class="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-xs font-semibold" title="Unduh / Buka File">
                                <x-heroicon-o-arrow-down-tray class="w-5 h-5" style="width: 20px; height: 20px;" />
                            </a>
                        </div>
                    @else
                        <div class="flex flex-col items-center justify-center py-6 text-center">
                            <x-heroicon-o-paper-clip class="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" style="width: 32px; height: 32px;" />
                            <p class="text-sm text-gray-400 dark:text-gray-600">Tidak ada lampiran yang diunggah.</p>
                        </div>
                    @endif
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
                            <p class="text-xs text-gray-500 mt-1">Usulan berhasil dikirimkan ke dalam sistem.</p>
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
                                <p class="text-xs text-gray-500 mt-1">Menunggu peninjauan berkas persyaratan oleh administrator.</p>
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
                                <p class="text-xs text-gray-500 mt-1">Berkas dan berkas usulan telah diverifikasi.</p>
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
                                <p class="text-xs text-gray-500 mt-1">Usulan cuti disetujui sepenuhnya.</p>
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
                                <p class="text-xs text-gray-500 mt-1">Pengajuan ditolak. Silakan ajukan ulang atau hubungi admin.</p>
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
                                <span class="text-sm font-bold text-amber-600 block mt-0.5">Perlu Revisi</span>
                                <p class="text-xs text-gray-500 mt-1">Usulan cuti dikembalikan untuk dilakukan revisi mandiri.</p>
                            </div>
                        </div>
                    @else
                        <div class="relative">
                            <span class="absolute -left-[31px] top-0 bg-gray-300 text-white rounded-full p-1.5 flex items-center justify-center w-6 h-6 border-4 border-white dark:border-gray-900">
                                <x-heroicon-s-minus class="w-3 h-3" style="width: 12px; height: 12px;" />
                            </span>
                            <div>
                                <span class="text-xs text-gray-400 block font-medium">Antrian</span>
                                <span class="text-sm font-semibold text-gray-405 block mt-0.5">Keputusan Kepala Sekolah</span>
                                <p class="text-xs text-gray-450 mt-1">Menunggu keputusan akhir persetujuan.</p>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-filament-panels::page>
