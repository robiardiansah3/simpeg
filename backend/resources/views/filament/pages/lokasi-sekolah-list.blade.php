<x-filament-panels::page>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

    <div
        x-data="{
            showModal: false,
            showConfirm: false,
            selectedId: null,
            selectedNama: '',
            selectLokasi(id, nama) {
                this.selectedId = id;
                this.selectedNama = nama;
            },
            confirm() {
                if (!this.selectedId) return;
                this.showConfirm = true;
            },
            batalConfirm() {
                this.showConfirm = false;
            },
            tutupModal() {
                this.showModal = false;
                this.showConfirm = false;
                this.selectedId = null;
                this.selectedNama = '';
            },
        }"
    >
    {{-- ============================================================ --}}
    {{-- SECTION 1: Peta Lokasi Aktif --}}
    {{-- ============================================================ --}}
    @if($lokasi)
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {{-- Info Card --}}
            <div class="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
                        <x-heroicon-o-map-pin class="w-5 h-5 text-emerald-500" style="width: 20px; height: 20px;" />
                        Lokasi Aktif Saat Ini
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Nama Lokasi</span>
                            <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ $lokasi->nama_lokasi }}</span>
                        </div>
                        <div>
                            <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Alamat</span>
                            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ $lokasi->alamat }}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Latitude</span>
                                <code class="text-xs font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded text-primary-600 font-semibold">{{ $lokasi->latitude }}</code>
                            </div>
                            <div>
                                <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Longitude</span>
                                <code class="text-xs font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded text-primary-600 font-semibold">{{ $lokasi->longitude }}</code>
                            </div>
                        </div>
                        <div>
                            <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Radius Absensi</span>
                            <span class="text-sm font-bold text-primary-600 bg-primary-50 dark:bg-primary-950 px-2.5 py-1 rounded-full inline-block">{{ $lokasi->radius_meter }} Meter</span>
                        </div>
                        <div>
                            <span class="text-xs text-gray-500 dark:text-gray-400 block uppercase tracking-wider font-semibold">Status</span>
                            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg>
                                Aktif (Digunakan)
                            </span>
                        </div>
                    </div>
                </div>
                <div class="mt-6 flex flex-col gap-2">
                    <a
                        href="{{ \App\Filament\Resources\LokasiSekolahs\LokasiSekolahResource::getUrl('create') }}"
                        class="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow transition-colors duration-150 flex items-center justify-center gap-2"
                    >
                        <x-heroicon-o-plus class="w-4 h-4" style="width: 16px; height: 16px;" />
                        Tambah Lokasi
                    </a>
                    <a
                        href="{{ \App\Filament\Resources\LokasiSekolahs\LokasiSekolahResource::getUrl('pilih-aktif') }}"
                        class="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow transition-colors duration-150 flex items-center justify-center gap-2"
                    >
                        <x-heroicon-o-arrow-path class="w-4 h-4" style="width: 16px; height: 16px;" />
                        Ganti Lokasi Aktif
                    </a>
                </div>
            </div>


            {{-- Map Card --}}
            <div class="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col">
                <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
                    <x-heroicon-o-map class="w-5 h-5 text-primary-600" style="width: 20px; height: 20px;" />
                    Peta Lokasi &amp; Radius Presensi
                </h2>
                <div class="relative flex-1">
                    <div id="school-readonly-map" class="w-full z-0 rounded-lg overflow-hidden shadow-inner border border-gray-200 dark:border-gray-800" style="height: 380px;"></div>
                    <script>
                        (function initReadonlyMap() {
                            if (typeof L === 'undefined') {
                                setTimeout(initReadonlyMap, 200);
                                return;
                            }
                            const el = document.getElementById('school-readonly-map');
                            if (!el || el._leaflet_id) return;
                            const lat    = {{ $lokasi->latitude }};
                            const lng    = {{ $lokasi->longitude }};
                            const radius = {{ $lokasi->radius_meter }};
                            const map = L.map('school-readonly-map', { scrollWheelZoom: false }).setView([lat, lng], 16);
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                attribution: '\u00a9 OpenStreetMap contributors'
                            }).addTo(map);
                            const schoolIcon = L.divIcon({
                                className: 'custom-div-icon',
                                html: '<div style="background-color:#2E3182;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(0,0,0,.35)"></div>',
                                iconSize: [18, 18], iconAnchor: [9, 9]
                            });
                            L.marker([lat, lng], { icon: schoolIcon }).addTo(map);
                            L.circle([lat, lng], {
                                radius: radius, color: '#2E3182',
                                fillColor: '#2E3182', fillOpacity: 0.12, weight: 2
                            }).addTo(map);
                        })();
                    </script>
                </div>
            </div>
        </div>
    @else
        <div class="text-center py-12 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl shadow-sm mb-6 flex flex-col items-center">
            <x-heroicon-o-exclamation-triangle class="mx-auto h-10 w-10 text-amber-500 mb-3" style="width: 40px; height: 40px;" />
            <h3 class="text-sm font-bold text-amber-800 dark:text-amber-300">Tidak Ada Lokasi Aktif</h3>
            <p class="mt-1 text-sm text-amber-700 dark:text-amber-400">Aktifkan salah satu lokasi di bawah agar fitur absensi berfungsi.</p>
            <div class="mt-4 flex gap-3">
                <a
                    href="{{ \App\Filament\Resources\LokasiSekolahs\LokasiSekolahResource::getUrl('create') }}"
                    class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-150 flex items-center justify-center gap-2"
                >
                    <x-heroicon-o-plus class="w-4 h-4" style="width: 16px; height: 16px;" />
                    Tambah Lokasi
                </a>
                @if(!$semuaLokasi->isEmpty())
                    <a
                        href="{{ \App\Filament\Resources\LokasiSekolahs\LokasiSekolahResource::getUrl('pilih-aktif') }}"
                        class="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-150 flex items-center justify-center gap-2"
                    >
                        <x-heroicon-o-arrow-path class="w-4 h-4" style="width: 16px; height: 16px;" />
                        Pilih Lokasi Aktif
                    </a>
                @endif
            </div>
        </div>
    @endif

    {{-- ============================================================ --}}
    {{-- SECTION 2: Tabel Semua Lokasi --}}
    {{-- ============================================================ --}}
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 class="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <x-heroicon-o-list-bullet class="w-5 h-5 text-primary-600" style="width: 20px; height: 20px;" />
                Daftar Semua Lokasi
                <span class="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {{ $semuaLokasi->count() }}
                </span>
            </h2>
        </div>

        @if($semuaLokasi->isEmpty())
            <div class="flex flex-col items-center justify-center py-16">
                <x-heroicon-o-map-pin class="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" style="width: 48px; height: 48px;" />
                <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">Belum ada lokasi yang ditambahkan.</p>
            </div>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            <th class="px-6 py-3">Nama Lokasi</th>
                            <th class="px-6 py-3">Alamat</th>
                            <th class="px-6 py-3">Koordinat</th>
                            <th class="px-6 py-3">Radius</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        @foreach($semuaLokasi as $loc)
                            <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors group">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        @if($loc->status === 'aktif')
                                            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                        @else
                                            <span class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0"></span>
                                        @endif
                                        <span class="font-semibold text-gray-800 dark:text-gray-200">{{ $loc->nama_lokasi }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[220px]">
                                    <p class="truncate">{{ $loc->alamat ?? '—' }}</p>
                                </td>
                                <td class="px-6 py-4">
                                    <code class="text-xs text-primary-600 dark:text-primary-400 font-mono">
                                        {{ $loc->latitude }}, {{ $loc->longitude }}
                                    </code>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-full">
                                        {{ $loc->radius_meter }} m
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    @if($loc->status === 'aktif')
                                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                                            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg>
                                            Aktif
                                        </span>
                                    @else
                                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg>
                                            Nonaktif
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <a href="{{ route('filament.admin.resources.lokasi-sekolahs.view', $loc->id) }}"
                                           class="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950 dark:hover:bg-primary-900 px-3 py-1.5 rounded-lg transition-colors border border-primary-100 dark:border-primary-800"
                                           title="View lokasi {{ $loc->nama_lokasi }}">
                                            <x-heroicon-o-eye class="w-3.5 h-3.5" style="width: 14px; height: 14px;" />
                                            View
                                        </a>
                                        <button wire:click="hapusLokasi({{ $loc->id }})"
                                                wire:confirm="Yakin ingin menghapus lokasi '{{ $loc->nama_lokasi }}'?"
                                                class="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 px-3 py-1.5 rounded-lg transition-colors border border-red-100 dark:border-red-800"
                                                title="Delete lokasi {{ $loc->nama_lokasi }}">
                                            <x-heroicon-o-trash class="w-3.5 h-3.5" style="width: 14px; height: 14px;" />
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>

    </div>
</x-filament-panels::page>
