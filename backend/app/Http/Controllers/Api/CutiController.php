<?php
/**
 * @file CutiController.php
 * @description Controller untuk menangani pengajuan cuti oleh pegawai, validasi usulan oleh Admin,
 * serta verifikasi akhir persetujuan cuti oleh Kepala Sekolah.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UsulanCuti;
use App\Http\Resources\CutiResource;
use App\Http\Requests\StoreCutiRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Class CutiController
 * Mengelola siklus pengajuan, peninjauan, revisi, dan keputusan cuti pegawai.
 */
class CutiController extends Controller
{
    /**
     * Menampilkan daftar usulan cuti.
     * Pegawai hanya dapat melihat daftar cutinya sendiri, sedangkan Admin dan Kepsek dapat melihat semua.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = Auth::user();
        
        // Pegawai hanya melihat data cuti miliknya sendiri
        if ($user->role->role_name === 'pegawai') {
            if (!$user->pegawai) return response()->json(['message' => 'Data pegawai tidak ditemukan'], 404);
            $cuti = UsulanCuti::with('pegawai')->where('pegawai_id', $user->pegawai->id)->get();
        } else {
            // Admin dan Kepala Sekolah berhak melihat semua usulan cuti
            $cuti = UsulanCuti::with('pegawai')->get();
        }

        return CutiResource::collection($cuti);
    }

    /**
     * Menyimpan usulan pengajuan cuti baru dari pegawai.
     *
     * @param StoreCutiRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreCutiRequest $request)
    {
        $user = Auth::user();
        if ($user->role->role_name !== 'pegawai' || !$user->pegawai) {
            return response()->json(['message' => 'Hanya pegawai yang bisa mengajukan cuti'], 403);
        }

        $data = $request->validated();
        $data['pegawai_id'] = $user->pegawai->id;
        $data['nomor_usulan'] = 'UCT-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        // Menghitung selisih hari usulan cuti
        $mulai = new \DateTime($data['tanggal_mulai']);
        $selesai = new \DateTime($data['tanggal_selesai']);
        $data['jumlah_hari'] = $mulai->diff($selesai)->days + 1;
        
        $data['status'] = 'diajukan';

        if ($request->hasFile('lampiran')) {
            $path = $request->file('lampiran')->store('lampiran_cuti', 'public');
            $data['lampiran'] = $path;
        }

        $cuti = UsulanCuti::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Usulan cuti berhasil diajukan',
            'data' => new CutiResource($cuti)
        ], 201);
    }

    /**
     * Menampilkan informasi detail dari satu usulan cuti.
     *
     * @param UsulanCuti $cuti
     * @return CutiResource
     */
    public function show(UsulanCuti $cuti)
    {
        return new CutiResource($cuti->load('pegawai'));
    }

    /**
     * Memproses pengajuan perbaikan/revisi berkas cuti oleh pegawai.
     * Hanya diizinkan jika status usulan sedang dalam kondisi 'revisi'.
     *
     * @param Request $request
     * @param UsulanCuti $cuti
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, UsulanCuti $cuti)
    {
        $user = Auth::user();

        // Memastikan pegawai hanya dapat menyunting usulan miliknya sendiri
        if (!$user->pegawai || $cuti->pegawai_id !== $user->pegawai->id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        if ($cuti->status !== 'revisi') {
            return response()->json(['message' => 'Usulan hanya dapat direvisi jika berstatus revisi'], 422);
        }

        $data = $request->validate([
            'jenis_cuti'      => 'required|in:Cuti Tahunan,Cuti Sakit,Cuti Melahirkan,Cuti Alasan Penting,Cuti lainnya',
            'tanggal_mulai'   => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan'          => 'required|string|min:10',
            'lampiran'        => 'nullable|file|mimes:pdf,png,jpg,jpeg|max:5120',
        ]);

        $mulai   = new \DateTime($data['tanggal_mulai']);
        $selesai = new \DateTime($data['tanggal_selesai']);

        $updateData = [
            'jenis_cuti'      => $data['jenis_cuti'],
            'tanggal_mulai'   => $data['tanggal_mulai'],
            'tanggal_selesai' => $data['tanggal_selesai'],
            'alasan'          => $data['alasan'],
            'jumlah_hari'     => $mulai->diff($selesai)->days + 1,
            'status'          => 'diajukan',  // Mengembalikan status ke diajukan setelah direvisi
            'catatan_admin'   => null,
        ];

        if ($request->hasFile('lampiran')) {
            if ($cuti->lampiran) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($cuti->lampiran);
            }
            $path = $request->file('lampiran')->store('lampiran_cuti', 'public');
            $updateData['lampiran'] = $path;
        }

        $cuti->update($updateData);

        return response()->json([
            'status'  => 'success',
            'message' => 'Revisi cuti berhasil diajukan ulang',
            'data'    => new CutiResource($cuti),
        ]);
    }

    /**
     * Melakukan tindakan validasi usulan cuti oleh Administrator.
     * Mengubah status menjadi ditinjau_admin, revisi, atau diteruskan.
     *
     * @param Request $request
     * @param UsulanCuti $cuti
     * @return \Illuminate\Http\JsonResponse
     */
    public function validasi(Request $request, UsulanCuti $cuti)
    {
        $request->validate(['status' => 'required|in:ditinjau_admin,revisi,diteruskan', 'catatan_admin' => 'nullable|string']);
        
        $cuti->update([
            'status' => $request->status,
            'catatan_admin' => $request->catatan_admin
        ]);

        return response()->json(['status' => 'success', 'message' => 'Cuti divalidasi', 'data' => new CutiResource($cuti)]);
    }

    /**
     * Melakukan verifikasi akhir keputusan usulan cuti oleh Kepala Sekolah (Disetujui / Ditolak).
     *
     * @param Request $request
     * @param UsulanCuti $cuti
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifikasi(Request $request, UsulanCuti $cuti)
    {
        $request->validate(['status' => 'required|in:disetujui,ditolak', 'catatan_kepsek' => 'nullable|string']);
        
        $cuti->update([
            'status' => $request->status,
            'catatan_kepsek' => $request->catatan_kepsek,
            'tanggal_diverifikasi' => now()
        ]);

        return response()->json(['status' => 'success', 'message' => 'Cuti diverifikasi', 'data' => new CutiResource($cuti)]);
    }
}
