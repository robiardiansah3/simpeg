<?php
/**
 * @file api.php
 * @description Pendaftaran seluruh rute (endpoints) API untuk aplikasi SIMPEG.
 * Rute dibagi menjadi rute publik (autentikasi) dan rute privat yang terproteksi token Sanctum.
 */

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PegawaiController;
use App\Http\Controllers\Api\CutiController;
use App\Http\Controllers\Api\AbsensiController;
use App\Http\Controllers\Api\KenaikanPangkatController;
use App\Http\Controllers\Api\ProfileController;

// --- 1. RUTE PUBLIK ---
// Rute untuk melakukan login ke dalam aplikasi.
Route::post('/login', [AuthController::class, 'login']);

// --- 2. RUTE PRIVAT (Wajib Token Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Profil Pengguna
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'profile']);
    Route::get('/dashboard/summary', [\App\Http\Controllers\Api\DashboardController::class, 'getSummary']);

    // Profil Pegawai Mandiri (Milik User Terkait)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile/pegawai', [ProfileController::class, 'updatePegawai']);

    // Manajemen Pegawai (CRUD oleh Admin)
    Route::apiResource('pegawai', PegawaiController::class);

    // Pengajuan dan Siklus Hidup Cuti Pegawai
    Route::get('/cuti', [CutiController::class, 'index']);
    Route::post('/cuti', [CutiController::class, 'store']);
    Route::get('/cuti/{cuti}', [CutiController::class, 'show']);
    Route::put('/cuti/{cuti}', [CutiController::class, 'update']);
    Route::post('/cuti/{cuti}/revisi', [CutiController::class, 'update']); // POST alias khusus untuk dukungan pengunggahan berkas revisi
    Route::put('/cuti/{cuti}/validasi', [CutiController::class, 'validasi']);
    Route::put('/cuti/{cuti}/verifikasi', [CutiController::class, 'verifikasi']);

    // Pencatatan dan Riwayat Kehadiran (Absensi)
    Route::get('/absensi/riwayat', [AbsensiController::class, 'index']);
    Route::post('/absensi/checkin', [AbsensiController::class, 'checkin']);

    // Usulan Kenaikan Pangkat (UKP) beserta Dokumen Lampirannya
    Route::get('/usulan-pangkat', [KenaikanPangkatController::class, 'index']);
    Route::post('/usulan-pangkat', [KenaikanPangkatController::class, 'store']);
    Route::get('/usulan-pangkat/{ukp}', [KenaikanPangkatController::class, 'show']);
    Route::post('/usulan-pangkat/{ukp}', [KenaikanPangkatController::class, 'updateRevisi']);
    Route::put('/usulan-pangkat/{ukp}/validasi', [KenaikanPangkatController::class, 'validasi']);
    Route::put('/usulan-pangkat/{ukp}/verifikasi', [KenaikanPangkatController::class, 'verifikasi']);

    // Artikel Informasi Prasyarat Administrasi
    Route::get('/informasi-persyaratan', [\App\Http\Controllers\Api\InformasiPersyaratanController::class, 'index']);
    Route::get('/informasi-persyaratan/{informasi_persyaratan}', [\App\Http\Controllers\Api\InformasiPersyaratanController::class, 'show']);

    // Mengambil konfigurasi lokasi sekolah aktif untuk validasi GPS presensi
    Route::get('/lokasi-sekolah', function () {
        $lokasi = \App\Models\LokasiSekolah::where('status', 'aktif')->first();
        if (!$lokasi) {
            return response()->json(['message' => 'Lokasi sekolah aktif belum dikonfigurasi atau sedang dinonaktifkan'], 404);
        }
        return response()->json(['data' => $lokasi]);
    });

    // Mengambil jadwal jam kerja absensi harian yang disesuaikan dengan hari berjalan
    Route::get('/jadwal-absensi/hari-ini', function () {
        $hariMap = [
            'Sunday' => 'minggu',
            'Monday' => 'senin',
            'Tuesday' => 'selasa',
            'Wednesday' => 'rabu',
            'Thursday' => 'kamis',
            'Friday' => 'jumat',
            'Saturday' => 'sabtu',
        ];
        
        $currentDayName = $hariMap[date('l')];
        $jadwal = \App\Models\JadwalAbsensi::where('hari', $currentDayName)->first();
        
        if (!$jadwal) {
            return response()->json([
                'data' => [
                    'hari' => $currentDayName,
                    'is_active' => false,
                    'jam_mulai' => '07:00:00',
                    'jam_selesai' => '09:00:00',
                ]
            ]);
        }
        
        return response()->json(['data' => $jadwal]);
    });
});
