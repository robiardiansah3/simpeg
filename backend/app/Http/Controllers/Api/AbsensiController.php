<?php
/**
 * @file AbsensiController.php
 * @description Controller untuk menangani aksi pencatatan presensi (check-in) pegawai 
 * serta penarikan data riwayat kehadiran pegawai berdasarkan koordinat GPS dan radius sekolah.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\LokasiSekolah;
use App\Http\Resources\AbsensiResource;
use App\Http\Requests\StoreAbsensiRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Class AbsensiController
 * Mengelola riwayat kehadiran dan proses check-in berbasis geolokasi untuk pegawai.
 */
class AbsensiController extends Controller
{
    /**
     * Menampilkan daftar riwayat absensi.
     * Kepala Sekolah dapat memantau seluruh absensi pegawai, sedangkan pegawai biasa hanya dapat melihat data miliknya.
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $roleName = $user->role->role_name;

        // Jalankan pengecekan absensi otomatis untuk hari ini dan 2 hari ke belakang
        for ($i = 0; $i < 3; $i++) {
            Absensi::autoMarkTidakHadir(date('Y-m-d', strtotime("-{$i} days")));
        }

        // Kepala sekolah bisa melihat semua absensi pegawai
        if ($roleName === 'kepala_sekolah') {
            // Jika scope=own, tampilkan hanya milik sendiri (untuk halaman absensi pribadi)
            if ($request->query('scope') === 'own') {
                if (!$user->pegawai) return response()->json(['message' => 'Pegawai tidak ditemukan'], 404);
                $absensis = Absensi::with('pegawai')->where('pegawai_id', $user->pegawai->id)->orderBy('tanggal', 'desc')->get();
            } else {
                $query = Absensi::with('pegawai')->orderBy('tanggal', 'desc');

                // Filter opsional berdasarkan id pegawai
                if ($request->filled('pegawai_id')) {
                    $query->where('pegawai_id', $request->pegawai_id);
                }

                // Filter opsional berdasarkan tanggal
                if ($request->filled('tanggal')) {
                    $query->where('tanggal', $request->tanggal);
                }

                // Filter opsional berdasarkan status_kehadiran
                if ($request->filled('status')) {
                    $query->where('status_kehadiran', $request->status);
                }

                $absensis = $query->get();
            }

        } elseif (in_array($roleName, ['pegawai', 'guru', 'tata_usaha'])) {
            // Pegawai biasa hanya melihat absensi milik sendiri
            if (!$user->pegawai) return response()->json(['message' => 'Pegawai tidak ditemukan'], 404);
            $absensis = Absensi::with('pegawai')->where('pegawai_id', $user->pegawai->id)->orderBy('tanggal', 'desc')->get();
        } else {
            // Admin melihat semua data absensi
            $absensis = Absensi::with('pegawai')->orderBy('tanggal', 'desc')->get();
        }

        return AbsensiResource::collection($absensis);
    }

    /**
     * Melakukan proses check-in kehadiran pegawai.
     * Memvalidasi koordinat GPS terhadap koordinat aktif sekolah dan membatasi berdasarkan jadwal waktu absensi.
     *
     * @param StoreAbsensiRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkin(StoreAbsensiRequest $request)
    {
        $user = Auth::user();
        $roleName = $user->role->role_name;

        // Hanya pegawai dan kepala_sekolah yang bisa check-in
        if (!in_array($roleName, ['pegawai', 'kepala_sekolah', 'guru', 'tata_usaha']) || !$user->pegawai) {
            return response()->json(['message' => 'Hanya pegawai dan kepala sekolah yang bisa check-in'], 403);
        }

        // Memeriksa apakah pegawai sudah absen hari ini
        $hariIni = date('Y-m-d');
        $sudahAbsen = Absensi::where('pegawai_id', $user->pegawai->id)->where('tanggal', $hariIni)->exists();
        if ($sudahAbsen) {
            return response()->json(['message' => 'Anda sudah melakukan check-in hari ini'], 400);
        }

        // Cek jadwal absensi hari ini
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

        if ($jadwal) {
            if (!$jadwal->is_active) {
                return response()->json(['message' => 'Absensi hari ini dinonaktifkan oleh administrator.'], 400);
            }

            $now = date('H:i:s');
            if ($now < $jadwal->jam_mulai || $now > $jadwal->jam_selesai) {
                $mulai = date('H:i', strtotime($jadwal->jam_mulai));
                $selesai = date('H:i', strtotime($jadwal->jam_selesai));
                return response()->json(['message' => "Waktu absensi di luar batas waktu yang ditentukan ({$mulai} - {$selesai} WIB)."], 400);
            }
        }

        $data = $request->validated();
        
        // Ambil data lokasi sekolah yang aktif
        $sekolah = LokasiSekolah::where('status', 'aktif')->first();
        if (!$sekolah) {
            return response()->json(['message' => 'Koordinat sekolah belum disetting atau sedang dinonaktifkan oleh admin'], 400);
        }

        $statusKehadiran = $data['status_kehadiran'] ?? 'hadir';

        // Kalkulasi jarak menggunakan formula Haversine
        $jarak = $this->hitungJarak($sekolah->latitude, $sekolah->longitude, $data['latitude'], $data['longitude']);

        $statusLokasi = ($jarak <= $sekolah->radius_meter) ? 'valid' : 'tidak_valid';

        // Hanya validasi radius jika status_kehadiran adalah 'hadir'
        if ($statusLokasi === 'tidak_valid' && $statusKehadiran === 'hadir') {
            return response()->json([
                'message' => 'Lokasi Anda berada di luar radius sekolah yang diizinkan.',
                'jarak_meter' => $jarak
            ], 400);
        }

        $absensi = Absensi::create([
            'pegawai_id' => $user->pegawai->id,
            'tanggal' => $hariIni,
            'waktu_masuk' => date('H:i:s'),
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'lokasi_masuk' => substr($data['lokasi_masuk'] ?? 'Koordinat GPS', 0, 250),
            'jarak_meter' => $jarak,
            'status_lokasi' => $statusLokasi,
            'status_kehadiran' => $statusKehadiran,
            'device_info' => substr($request->header('User-Agent'), 0, 250),
            'ip_address' => substr($request->ip(), 0, 45),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Check-in berhasil',
            'data' => new AbsensiResource($absensi)
        ], 201);
    }

    /**
     * Menghitung jarak bumi geospasial antara dua titik koordinat lintang/bujur (Haversine Formula).
     *
     * @param double $lat1 - Lintang asal (Sekolah)
     * @param double $lon1 - Bujur asal (Sekolah)
     * @param double $lat2 - Lintang tujuan (Pegawai)
     * @param double $lon2 - Bujur tujuan (Pegawai)
     * @return double - Jarak dalam satuan meter
     */
    private function hitungJarak($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // Radius bumi dalam satuan meter
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return round($distance, 2);
    }
}
