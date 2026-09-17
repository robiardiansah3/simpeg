<x-filament-panels::page>
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <x-heroicon-o-map-pin class="w-5 h-5 text-amber-500" style="width: 20px; height: 20px;" />
                Pilih Lokasi Aktif
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pilihlah salah satu dari lokasi berikut untuk dijadikan sebagai lokasi presensi aktif. Lokasi aktif sebelumnya akan dinonaktifkan otomatis.
            </p>
        </div>

        @if(count($semuaLokasi) === 0)
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
                            <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors group {{ $loc->status === 'aktif' ? 'bg-emerald-50/10 dark:bg-emerald-950/10' : '' }}">
                                <td class="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">
                                    {{ $loc->nama_lokasi }}
                                </td>
                                <td class="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[220px]">
                                    <p class="truncate">{{ $loc->alamat ?? '—' }}</p>
                                </td>
                                <td class="px-6 py-4 font-mono text-xs text-primary-600 dark:text-primary-400">
                                    {{ $loc->latitude }}, {{ $loc->longitude }}
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-full">
                                        {{ $loc->radius_meter }} m
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    @if($loc->status === 'aktif')
                                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                                            Aktif
                                        </span>
                                    @else
                                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                            Nonaktif
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 text-right">
                                    @if($loc->status === 'aktif')
                                        <button disabled
                                                class="inline-flex items-center text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg cursor-not-allowed">
                                            Sudah Aktif
                                        </button>
                                    @else
                                        <button wire:click="aktivasiLokasi({{ $loc->id }})"
                                                wire:confirm="Apakah Anda yakin ingin menjadikan '{{ $loc->nama_lokasi }}' sebagai lokasi aktif saat ini?"
                                                class="inline-flex items-center text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                                            Jadikan Lokasi Aktif
                                        </button>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>
</x-filament-panels::page>
