<x-filament-widgets::widget class="fi-account-widget">
    @php
        $user = filament()->auth()->user();
    @endphp
    <div style="background: linear-gradient(135deg, #2E3192 0%, #1F2167 100%) !important; border: 1px solid rgba(30, 58, 138, 0.3) !important; border-radius: 1rem !important; padding: 2rem !important; position: relative; overflow: hidden; color: #ffffff !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;">
        <!-- Abstract background shapes -->
        <div style="position: absolute; top: 0; right: 0; width: 24rem; height: 24rem; background: rgba(255, 255, 255, 0.05) !important; border-radius: 9999px !important; filter: blur(64px) !important; margin-top: -5rem !important; margin-right: -5rem !important; pointer-events: none;"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 24rem; height: 24rem; background: rgba(255, 255, 255, 0.05) !important; border-radius: 9999px !important; filter: blur(64px) !important; margin-left: -5rem !important; margin-bottom: -5rem !important; pointer-events: none;"></div>

        <div style="position: relative; z-index: 10; display: flex; flex-direction: column; text-align: left; max-width: 42rem;">
            <!-- Badge -->
            <div style="display: inline-block; align-self: flex-start; padding: 0.25rem 0.75rem; background: rgba(255, 255, 255, 0.1) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; color: #bfdbfe !important; font-size: 10px !important; border-radius: 9999px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; margin-bottom: 1rem !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; line-height: 1.5 !important;">
                Halaman Administrator
            </div>

            <!-- Heading -->
            <h2 style="color: #ffffff !important; font-size: 1.875rem !important; font-weight: 800 !important; letter-spacing: -0.025em !important; margin: 0 !important; margin-bottom: 0.5rem !important; line-height: 1.25 !important;">
                Selamat Datang, {{ filament()->getUserName($user) }}
            </h2>

            <!-- Description -->
            <p style="color: rgba(255, 255, 255, 0.9) !important; font-size: 1rem !important; font-weight: 300 !important; line-height: 1.625 !important; margin: 0 !important;">
                Kelola data kepegawaian, verifikasi absensi harian, kelola pengajuan cuti, serta pantau dan validasi berkas usulan kenaikan pangkat pegawai secara real-time.
            </p>
        </div>
    </div>
</x-filament-widgets::widget>
