<?php
/**
 * @file StorePegawaiRequest.php
 * @description Request Validation class untuk pembuatan profil pegawai baru oleh admin.
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StorePegawaiRequest
 * Memvalidasi data masukan dari admin untuk pembuatan data master pegawai baru.
 */
class StorePegawaiRequest extends FormRequest
{
    /**
     * Menentukan apakah pengguna diizinkan untuk membuat request ini.
     *
     * @return bool
     */
    public function authorize()
    {
        return true; // Hak akses diotorisasi oleh middleware/policy route
    }

    /**
     * Menetapkan aturan validasi yang berlaku untuk request ini.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'user_id' => 'required|exists:users,id',
            'nbm' => 'nullable|string|max:20',
            'nama_lengkap' => 'required|string|max:200',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'required|string|max:100',
            'tanggal_lahir' => 'required|date',
            'agama' => 'required|in:Islam,Kristen,Katolik,Hindu,Buddha,Konghucu',
            'pendidikan_terakhir' => 'required|in:SMA/SMK,D1,D2,D3,S1,S2,S3',
            'jurusan' => 'nullable|string|max:150',
            'jabatan' => 'required|string|max:150',
            'status_kepegawaian' => 'required|in:Kontrak,PTTP,PTP,GTTP,GTP',
            'alamat' => 'required|string',
            'nomor_telepon' => 'required|string|max:20',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ];
    }
}
