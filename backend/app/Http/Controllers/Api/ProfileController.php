<?php
/**
 * @file ProfileController.php
 * @description Controller untuk mengelola data profil mandiri pegawai (menampilkan detail
 * dan memperbarui data pribadi seperti kontak, pendidikan, NBM, serta foto profil).
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * Class ProfileController
 * Mengelola informasi profil pribadi bagi user yang sedang login.
 */
class ProfileController extends Controller
{
    /**
     * Mengambil profil lengkap user yang sedang aktif beserta biodata kepegawaiannya.
     * Mengembalikan URL absolut jika foto profil disimpan secara lokal.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show()
    {
        $user = Auth::user()->load('role', 'pegawai');
        if ($user->pegawai && $user->pegawai->foto) {
            if (!filter_var($user->pegawai->foto, FILTER_VALIDATE_URL)) {
                $user->pegawai->foto = url('storage/' . $user->pegawai->foto);
            }
        }
        return response()->json(['data' => $user]);
    }

    /**
     * Memperbarui informasi biodata pegawai milik user yang sedang aktif.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePegawai(Request $request)
    {
        $user = Auth::user()->load('pegawai');

        if (!$user->pegawai) {
            return response()->json(['message' => 'Data pegawai tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nbm'                  => 'nullable|string|max:20',
            'nama_lengkap'         => 'required|string|max:100',
            'jenis_kelamin'        => 'nullable|in:Laki-laki,Perempuan',
            'tempat_lahir'         => 'nullable|string|max:100',
            'tanggal_lahir'        => 'nullable|date',
            'agama'                => 'nullable|in:Islam,Kristen,Katolik,Hindu,Buddha,Konghucu',
            'pendidikan_terakhir'  => 'nullable|string|max:20',
            'jurusan'              => 'nullable|string|max:100',
            'jabatan'              => 'nullable|string|max:100',
            'status_kepegawaian'   => 'nullable|string|max:50',
            'status'               => 'nullable|in:guru,pegawai(staf)',
            'alamat'               => 'nullable|string|max:500',
            'nomor_telepon'        => 'nullable|string|max:20',
            'foto'                 => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Data tidak valid',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('foto_pegawai', 'public');
        }

        $user->pegawai->update($data);

        // Memetakan foto profil ke URL absolut
        if ($user->pegawai->foto && !filter_var($user->pegawai->foto, FILTER_VALIDATE_URL)) {
            $user->pegawai->foto = url('storage/' . $user->pegawai->foto);
        }

        return response()->json([
            'message' => 'Data profil berhasil diperbarui',
            'data'    => $user->load('role', 'pegawai'),
        ]);
    }
}
