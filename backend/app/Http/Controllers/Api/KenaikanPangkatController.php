<?php
/**
 * @file KenaikanPangkatController.php
 * @description Controller untuk mengelola usulan kenaikan pangkat (UKP) pegawai,
 * verifikasi kelengkapan berkas oleh admin, serta persetujuan akhir oleh Kepala Sekolah.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UsulanKenaikanPangkat;
use App\Models\DokumenUsulanKenaikanPangkat;
use App\Http\Resources\UsulanKenaikanPangkatResource;
use App\Http\Requests\StoreUsulanKenaikanPangkatRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Class KenaikanPangkatController
 * Mengelola usulan promosi jabatan/status kepegawaian beserta berkas lampirannya.
 */
class KenaikanPangkatController extends Controller
{
    /**
     * Menampilkan daftar usulan kenaikan pangkat.
     * Pegawai hanya dapat melihat usulan miliknya sendiri, sedangkan Admin dan Kepsek dapat melihat semua.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = Auth::user();
        if ($user->role->role_name === 'pegawai') {
            if (!$user->pegawai) return response()->json(['message' => 'Data pegawai tidak ditemukan'], 404);
            $ukps = UsulanKenaikanPangkat::with('pegawai', 'dokumen')->where('pegawai_id', $user->pegawai->id)->get();
        } else {
            $ukps = UsulanKenaikanPangkat::with('pegawai', 'dokumen')->get();
        }

        return UsulanKenaikanPangkatResource::collection($ukps);
    }

    /**
     * Menyimpan usulan kenaikan pangkat baru beserta mengunggah seluruh berkas kelengkapan wajib.
     * Memeriksa kesesuaian target pangkat baru secara otomatis.
     *
     * @param StoreUsulanKenaikanPangkatRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreUsulanKenaikanPangkatRequest $request)
    {
        $user = Auth::user();
        if ($user->role->role_name !== 'pegawai' || !$user->pegawai) {
            return response()->json(['message' => 'Hanya pegawai yang bisa mengajukan kenaikan pangkat'], 403);
        }

        $pegawai = $user->pegawai;
        $currentStatus = $pegawai->status_kepegawaian;
        $jenisPegawai = $pegawai->status;

        // Fallback untuk mendeteksi jenis pegawai (guru atau pegawai staf) secara otomatis
        if (empty($jenisPegawai)) {
            if ($user->role->role_name === 'guru' || str_contains(strtolower($pegawai->jabatan), 'guru')) {
                $jenisPegawai = 'guru';
            } else {
                $jenisPegawai = 'pegawai(staf)';
            }
        }

        $statusBaru = null;

        if ($currentStatus === 'Kontrak') {
            if ($jenisPegawai === 'guru') {
                $statusBaru = 'Guru Tidak Tetap Persyarikatan (GTTP)';
            } else {
                $statusBaru = 'Pegawai Tidak Tetap Persyarikatan (PTTP)';
            }
        } elseif ($currentStatus === 'Guru Tidak Tetap Persyarikatan (GTTP)') {
            $statusBaru = 'Guru Tetap Persyarikatan (GTP)';
        } elseif ($currentStatus === 'Pegawai Tidak Tetap Persyarikatan (PTTP)') {
            $statusBaru = 'Pegawai Tetap Persyarikatan (PTP)';
        } elseif (in_array($currentStatus, ['Guru Tetap Persyarikatan (GTP)', 'Pegawai Tetap Persyarikatan (PTP)'])) {
            return response()->json(['message' => 'Anda sudah memiliki status kepegawaian tertinggi (Tetap) dan tidak dapat mengajukan kenaikan pangkat lagi.'], 422);
        } else {
            return response()->json(['message' => 'Status kepegawaian Anda saat ini tidak valid untuk pengajuan kenaikan pangkat.'], 422);
        }

        if (in_array($statusBaru, ['Guru Tetap Persyarikatan (GTP)', 'Pegawai Tetap Persyarikatan (PTP)']) && empty($pegawai->nbm)) {
            return response()->json(['message' => 'Untuk mengajukan kenaikan pangkat ke PTP atau GTP, Anda harus memiliki NBM (Nomor Baku Muhammadiyah) di profil pegawai. Silakan lengkapi NBM Anda terlebih dahulu di menu Profil.'], 422);
        }

        $data = $request->validated();
        
        // Membuat baris usulan kenaikan pangkat
        $ukp = UsulanKenaikanPangkat::create([
            'pegawai_id' => $user->pegawai->id,
            'nomor_usulan' => 'UKP-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
            'masa_kerja_tahun' => $data['masa_kerja_tahun'],
            'masa_kerja_bulan' => $data['masa_kerja_bulan'],
            'status' => 'diajukan',
            'status_baru' => $statusBaru,
            'tanggal_diajukan' => now(),
        ]);

        // Menyimpan seluruh file dokumen persyaratan usulan
        foreach ($data['dokumen'] as $index => $doc) {
            $file = $request->file("dokumen.{$index}.file");
            $nama_dokumen = $doc['nama_dokumen'];
            
            $path = $file->store('dokumen_ukp', 'public');

            DokumenUsulanKenaikanPangkat::create([
                'ukp_id' => $ukp->id,
                'nama_dokumen' => $nama_dokumen,
                'file_dokumen' => $path,
                'tipe_file' => $file->getClientMimeType(),
                'ukuran_file' => $file->getSize(),
                'status_validasi' => 'pending',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Usulan kenaikan pangkat berhasil diajukan',
            'data' => new UsulanKenaikanPangkatResource($ukp->load('dokumen'))
        ], 201);
    }

    /**
     * Menampilkan informasi detail dari satu usulan kenaikan pangkat.
     *
     * @param UsulanKenaikanPangkat $ukp
     * @return UsulanKenaikanPangkatResource
     */
    public function show(UsulanKenaikanPangkat $ukp)
    {
        return new UsulanKenaikanPangkatResource($ukp->load('pegawai', 'dokumen'));
    }

    /**
     * Memproses tindakan validasi usulan UKP oleh Administrator.
     *
     * @param Request $request
     * @param UsulanKenaikanPangkat $ukp
     * @return \Illuminate\Http\JsonResponse
     */
    public function validasi(Request $request, UsulanKenaikanPangkat $ukp)
    {
        $request->validate(['status' => 'required|in:ditinjau_admin,revisi,diteruskan', 'catatan_admin' => 'nullable|string']);
        
        $ukp->update([
            'status' => $request->status,
            'catatan_admin' => $request->catatan_admin,
            'status_pengajuan' => 'diproses',
        ]);

        return response()->json(['status' => 'success', 'message' => 'Usulan divalidasi', 'data' => new UsulanKenaikanPangkatResource($ukp)]);
    }

    /**
     * Memproses verifikasi akhir usulan UKP oleh Kepala Sekolah (Disetujui / Ditolak).
     *
     * @param Request $request
     * @param UsulanKenaikanPangkat $ukp
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifikasi(Request $request, UsulanKenaikanPangkat $ukp)
    {
        $request->validate(['status' => 'required|in:disetujui,ditolak', 'catatan_kepsek' => 'nullable|string']);
        
        $ukp->update([
            'status' => $request->status,
            'catatan_kepsek' => $request->catatan_kepsek,
            'tanggal_diverifikasi' => now(),
            'status_pengajuan' => 'selesai',
        ]);

        return response()->json(['status' => 'success', 'message' => 'Usulan diverifikasi', 'data' => new UsulanKenaikanPangkatResource($ukp)]);
    }

    /**
     * Mengirimkan data perbaikan (revisi) usulan UKP beserta dokumen yang diperbarui oleh pegawai.
     * Hanya diizinkan jika status usulan sedang dalam kondisi 'revisi'.
     *
     * @param Request $request
     * @param UsulanKenaikanPangkat $ukp
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateRevisi(Request $request, UsulanKenaikanPangkat $ukp)
    {
        $user = Auth::user();

        // Memastikan pegawai hanya dapat menyunting usulan miliknya sendiri
        if (!$user->pegawai || $ukp->pegawai_id !== $user->pegawai->id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        if ($ukp->status !== 'revisi') {
            return response()->json(['message' => 'Usulan hanya dapat direvisi jika berstatus revisi'], 422);
        }

        if (in_array($ukp->status_baru, ['Guru Tetap Persyarikatan (GTP)', 'Pegawai Tetap Persyarikatan (PTP)']) && empty($user->pegawai->nbm)) {
            return response()->json(['message' => 'Untuk mengajukan/merevisi usulan kenaikan pangkat ke PTP atau GTP, Anda harus memiliki NBM (Nomor Baku Muhammadiyah) terlebih dahulu di profil Anda.'], 422);
        }

        $data = $request->validate([
            'masa_kerja_tahun' => 'required|integer|min:0',
            'masa_kerja_bulan' => 'required|integer|min:0|max:11',
        ]);

        $ukp->update([
            'masa_kerja_tahun' => $data['masa_kerja_tahun'],
            'masa_kerja_bulan' => $data['masa_kerja_bulan'],
            'status'           => 'diajukan',  // Mengembalikan status ke diajukan setelah direvisi
            'status_pengajuan' => 'belum diproses',
            'catatan_admin'    => null,
        ]);

        // Menyimpan/memperbarui file dokumen yang diunggah ulang
        if ($request->has('dokumen')) {
            foreach ($request->dokumen as $index => $doc) {
                $fileKey = "dokumen.{$index}.file";
                if ($request->hasFile($fileKey)) {
                    $file = $request->file($fileKey);
                    $path = $file->store('dokumen_ukp', 'public');

                    DokumenUsulanKenaikanPangkat::updateOrCreate(
                        ['ukp_id' => $ukp->id, 'nama_dokumen' => $doc['nama_dokumen']],
                        [
                            'file_dokumen'    => $path,
                            'tipe_file'       => $file->getClientMimeType(),
                            'ukuran_file'     => $file->getSize(),
                            'status_validasi' => 'pending',
                        ]
                    );
                }
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Revisi usulan kenaikan pangkat berhasil diajukan ulang',
            'data'    => new UsulanKenaikanPangkatResource($ukp->load('dokumen')),
        ]);
    }
}
