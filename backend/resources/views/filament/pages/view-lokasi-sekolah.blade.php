<x-filament-panels::page>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>

    <div class="space-y-6">

        {{-- ============================================================ --}}
        {{-- SECTION 1: Informasi Lokasi Utama --}}
        {{-- ============================================================ --}}
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 class="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <x-heroicon-o-information-circle class="w-5 h-5 text-primary-600" style="width: 20px; height: 20px;" />
                    Informasi Lokasi Utama
                </h2>
            </div>
            <div class="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {{-- Nama Lokasi --}}
                <div>
                    <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Nama Lokasi</span>
                    <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ $record->nama_lokasi }}</span>
                </div>

                {{-- Status --}}
                <div>
                    <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Status</span>
                    @if($record->status === 'aktif')
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg>
                            Aktif (Digunakan untuk Absensi)
                        </span>
                    @else
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg>
                            Nonaktif
                        </span>
                    @endif
                </div>

                {{-- Alamat --}}
                <div class="md:col-span-2">
                    <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Alamat Lengkap</span>
                    <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ $record->alamat ?? '—' }}</p>
                </div>
            </div>
        </div>

        {{-- ============================================================ --}}
        {{-- SECTION 2: Peta & Koordinat --}}
        {{-- ============================================================ --}}
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 class="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <x-heroicon-o-map class="w-5 h-5 text-primary-600" style="width: 20px; height: 20px;" />
                    Peta Lokasi &amp; Koordinat
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Lingkaran biru menunjukkan radius absensi yang diizinkan.</p>
            </div>

            {{-- Map --}}
            <div class="px-6 pt-5">
                <div id="view-lokasi-map" class="w-full rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner" style="height: 380px; z-index: 0;"></div>
                <script>
                    (function initViewMap() {
                        if (typeof L === 'undefined') { setTimeout(initViewMap, 200); return; }
                        const el = document.getElementById('view-lokasi-map');
                        if (!el || el._leaflet_id) return;

                        const lat    = {{ $record->latitude }};
                        const lng    = {{ $record->longitude }};
                        const radius = {{ $record->radius_meter }};

                        const map = L.map('view-lokasi-map', { scrollWheelZoom: false }).setView([lat, lng], 16);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '\u00a9 OpenStreetMap contributors'
                        }).addTo(map);

                        const pinIcon = L.divIcon({
                            className: '',
                            html: '<div style="background-color:#2E3182;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(0,0,0,.35)"></div>',
                            iconSize: [18, 18], iconAnchor: [9, 9]
                        });
                        L.marker([lat, lng], { icon: pinIcon })
                            .addTo(map)
                            .bindPopup('<b>{{ addslashes($record->nama_lokasi) }}</b>')
                            .openPopup();
                        L.circle([lat, lng], {
                            radius: radius, color: '#2E3182',
                            fillColor: '#2E3182', fillOpacity: 0.12, weight: 2
                        }).addTo(map);
                    })();
                </script>
            </div>

            {{-- Koordinat & Radius detail --}}
            <div class="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                    <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Latitude</span>
                    <code class="text-sm font-mono font-bold text-primary-600 dark:text-primary-400">{{ $record->latitude }}</code>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                    <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Longitude</span>
                    <code class="text-sm font-mono font-bold text-primary-600 dark:text-primary-400">{{ $record->longitude }}</code>
                </div>
                <div class="bg-primary-50 dark:bg-primary-950 rounded-xl px-4 py-3 border border-primary-100 dark:border-primary-900">
                    <span class="text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider block mb-1">Radius Absensi</span>
                    <span class="text-sm font-bold text-primary-700 dark:text-primary-300">{{ $record->radius_meter }} Meter</span>
                </div>
            </div>
        </div>

        {{-- ============================================================ --}}
        {{-- SECTION 3: Info Waktu --}}
        {{-- ============================================================ --}}
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 grid grid-cols-2 gap-4">
                <div>
                    <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Dibuat Pada</span>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ $record->created_at?->format('d M Y, H:i') ?? '—' }}</span>
                </div>
                <div>
                    <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Terakhir Diubah</span>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ $record->updated_at?->format('d M Y, H:i') ?? '—' }}</span>
                </div>
            </div>
        </div>

    </div>
</x-filament-panels::page>
