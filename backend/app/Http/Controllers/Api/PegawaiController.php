<?php
/**
 * @file PegawaiController.php
 * @description Controller untuk mengelola data master pegawai (CRUD) oleh Administrator,
 * serta melihat detail informasi pegawai.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Http\Resources\PegawaiResource;
use App\Http\Requests\StorePegawaiRequest;
use Illuminate\Http\Request;

/**
 * Class PegawaiController
 * Mengelola data kepegawaian dan profil biodata seluruh staf sekolah.
 */
class PegawaiController extends Controller
{
    /**
     * Menampilkan daftar semua pegawai beserta akun user terkait.
     * Dapat diakses oleh Admin atau Kepala Sekolah.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        $pegawais = Pegawai::with('user')->get();
        return PegawaiResource::collection($pegawais);
    }

    /**
     * Menambahkan data pegawai baru ke dalam sistem.
     *
     * @param StorePegawaiRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StorePegawaiRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('foto_pegawai', 'public');
        }

        $pegawai = Pegawai::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Pegawai berhasil ditambahkan',
            'data' => new PegawaiResource($pegawai)
        ], 201);
    }

    /**
     * Menampilkan informasi detail dari satu pegawai.
     *
     * @param Pegawai $pegawai
     * @return PegawaiResource
     */
    public function show(Pegawai $pegawai)
    {
        return new PegawaiResource($pegawai->load('user'));
    }

    /**
     * Memperbarui data informasi pegawai yang sudah ada.
     *
     * @param Request $request
     * @param Pegawai $pegawai
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Pegawai $pegawai)
    {
        $data = $request->validate([
            'nama_lengkap' => 'sometimes|required|string|max:200',
            'jabatan' => 'sometimes|required|string|max:150',
            'alamat' => 'sometimes|required|string',
            'nomor_telepon' => 'sometimes|required|string|max:20',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('foto_pegawai', 'public');
        }

        $pegawai->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Pegawai berhasil diupdate',
            'data' => new PegawaiResource($pegawai)
        ]);
    }

    /**
     * Menghapus data pegawai dari database.
     *
     * @param Pegawai $pegawai
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Pegawai $pegawai)
    {
        $pegawai->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pegawai berhasil dihapus'
        ]);
    }
}
