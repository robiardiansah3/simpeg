<div class="min-h-screen flex flex-col lg:flex-row font-sans simpeg-login-page" style="font-family: 'Poppins', sans-serif;">
    <!-- Panel Kiri (Branding) -->
    <div class="hidden lg:flex flex-1 flex-col items-center justify-center p-12 text-white" style="background: linear-gradient(135deg, #1B2559 0%, #2E3182 50%, #3B4DB8 100%);">
        <img src="{{ asset('images/logo.png') }}" alt="Logo SMA Muhammadiyah 2 Metro" class="w-28 h-28 object-contain mb-6" />
        <h1 class="text-3xl font-bold mb-2 text-center tracking-wide">SMA MUHAMMADIYAH 2 METRO</h1>
        <p class="text-sm text-white/75 mb-10 text-center font-light">Sistem Informasi Kepegawaian</p>
        
        <!-- Fitur List -->
        <div class="flex flex-col gap-4 w-full max-w-xs">
            <div class="flex items-center gap-3 bg-white/10 rounded-xl p-4 transition duration-200 hover:bg-white/15">
                <span class="text-2xl">📋</span>
                <span class="text-sm text-white/90 font-medium">Kelola Absensi Harian</span>
            </div>
            <div class="flex items-center gap-3 bg-white/10 rounded-xl p-4 transition duration-200 hover:bg-white/15">
                <span class="text-2xl">📅</span>
                <span class="text-sm text-white/90 font-medium">Pengajuan Cuti Online</span>
            </div>
            <div class="flex items-center gap-3 bg-white/10 rounded-xl p-4 transition duration-200 hover:bg-white/15">
                <span class="text-2xl">🏆</span>
                <span class="text-sm text-white/90 font-medium">Usulan Kenaikan Pangkat</span>
            </div>
        </div>
    </div>

    <!-- Panel Kanan (Form Login) -->
    <div class="flex-1 lg:w-[480px] lg:min-w-[440px] lg:flex-none bg-white flex flex-col items-center justify-center p-8 lg:p-12">
        <div class="w-full max-w-sm">
            <!-- Mobile Header -->
            <div class="flex lg:hidden flex-col items-center mb-8">
                <img src="{{ asset('images/logo.png') }}" alt="Logo SMA Muhammadiyah 2 Metro" class="w-16 h-16 object-contain mb-3" />
                <h1 class="text-xl font-bold text-[#1E293B] text-center">SMA MUHAMMADIYAH 2 METRO</h1>
                <p class="text-xs text-[#64748B] text-center font-light">Sistem Informasi Kepegawaian</p>
            </div>

            <!-- Desktop Heading -->
            <div class="hidden lg:block mb-8">
                <h2 class="text-2xl font-bold text-[#1E293B] mb-2">Selamat Datang 👋</h2>
                <p class="text-sm text-[#64748B]">Masuk ke akun SIMPEG Anda untuk melanjutkan.</p>
            </div>

            <!-- Livewire Form Rendered by Filament's Content System -->
            <div class="simpeg-login-form-container">
                {{ $this->content }}
            </div>

            <p class="mt-8 text-xs text-[#94A3B8] text-center">
                &copy; {{ date('Y') }} SIMPEG &mdash; SMA Muhammadiyah 2 Metro
            </p>
        </div>
    </div>
</div>
