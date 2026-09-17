<?php
/**
 * @file DashboardController.php
 * @description Controller untuk menyajikan data ringkasan (summary) dashboard SIMPEG,
 * dibedakan berdasarkan peran pengguna (Kepala Sekolah atau Pegawai).
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\UsulanCuti;
use App\Models\UsulanKenaikanPangkat;
use App\Models\Absensi;
use App\Models\InformasiPersyaratan;
use App\Http\Resources\CutiResource;
use App\Http\Resources\UsulanKenaikanPangkatResource;
use App\Http\Resources\AbsensiResource;
use App\Http\Resources\InformasiPersyaratanResource;
use App\Http\Resources\PegawaiResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Class DashboardController
 * Mengelola data agregat dan ringkasan informasi untuk tampilan halaman utama Dashboard.
 */
class DashboardController extends Controller
{
    /**
     * Mengambil ringkasan data statistik dan daftar data untuk halaman utama Dashboard.
     * Membedakan respons berdasarkan peran pengguna (Kepala Sekolah melihat seluruh data pegawai,
     * sedangkan Pegawai melihat data pribadinya sendiri).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSummary()
    {
        $user = Auth::user();
        $roleName = $user->role->role_name ?? 'pegawai';

        // Jalankan pengecekan absensi otomatis untuk hari ini dan 2 hari ke belakang
        for ($i = 0; $i < 3; $i++) {
            Absensi::autoMarkTidakHadir(date('Y-m-d', strtotime("-{$i} days")));
        }

        if ($roleName === 'kepala_sekolah') {
            // Mengambil ringkasan data untuk dashboard Kepala Sekolah
            $pegawais = Pegawai::all();
            
            // Mengambil seluruh pengajuan cuti dan kenaikan pangkat untuk diverifikasi
            $cutis = UsulanCuti::with('pegawai')->get();
            $ukps = UsulanKenaikanPangkat::with('pegawai', 'dokumen')->get();

            // Membatasi pengambilan data absensi hanya untuk hari ini untuk optimalisasi payload
            $today = date('Y-m-d');
            $absensis = Absensi::with('pegawai')->where('tanggal', $today)->orderBy('waktu_masuk', 'desc')->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'pegawais' => PegawaiResource::collection($pegawais),
                    'cutis' => CutiResource::collection($cutis),
                    'ukps' => UsulanKenaikanPangkatResource::collection($ukps),
                    'absensis' => AbsensiResource::collection($absensis),
                ]
            ]);
        } else {
            // Mengambil ringkasan data untuk dashboard Pegawai
            $user->load('role', 'pegawai');
            if ($user->pegawai && $user->pegawai->foto) {
                if (!filter_var($user->pegawai->foto, FILTER_VALIDATE_URL)) {
                    $user->pegawai->foto = url('storage/' . $user->pegawai->foto);
                }
            }

            $pegawaiId = $user->pegawai->id ?? null;
            if (!$pegawaiId) {
                return response()->json(['message' => 'Data pegawai tidak ditemukan'], 404);
            }

            $cutis = UsulanCuti::with('pegawai')->where('pegawai_id', $pegawaiId)->get();
            $ukps = UsulanKenaikanPangkat::with('pegawai', 'dokumen')->where('pegawai_id', $pegawaiId)->get();

            // Membatasi data absensi pada tahun aktif saat ini untuk mempercepat kecepatan pemuatan
            $currentYear = date('Y');
            $absensis = Absensi::with('pegawai')
                ->where('pegawai_id', $pegawaiId)
                ->whereYear('tanggal', $currentYear)
                ->orderBy('tanggal', 'desc')
                ->get();

            $informasi = InformasiPersyaratan::orderBy('created_at', 'desc')->take(6)->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'profile' => $user,
                    'cutis' => CutiResource::collection($cutis),
                    'ukps' => UsulanKenaikanPangkatResource::collection($ukps),
                    'absensis' => AbsensiResource::collection($absensis),
                    'informasi' => InformasiPersyaratanResource::collection($informasi),
                ]
            ]);
        }
    }
}
