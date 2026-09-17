<?php
/**
 * @file StoreUsulanKenaikanPangkatRequest.php
 * @description Request Validation class untuk pengajuan usulan kenaikan pangkat (UKP) pegawai.
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreUsulanKenaikanPangkatRequest
 * Memvalidasi data masukan dari klien untuk pengajuan usulan kenaikan pangkat dan dokumen lampirannya.
 */
class StoreUsulanKenaikanPangkatRequest extends FormRequest
{
    /**
     * Menentukan apakah pengguna diizinkan untuk membuat request ini.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Menetapkan aturan validasi yang berlaku untuk request ini.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'masa_kerja_tahun' => 'required|integer|min:0',
            'masa_kerja_bulan' => 'required|integer|min:0|max:11',
            // Validasi array dokumen lampiran
            'dokumen' => 'required|array|min:1',
            'dokumen.*.nama_dokumen' => 'required|in:ktp,kartu_keluarga,ijazah,sk_pengangkatan,sk_pembagian_tugas',
            'dokumen.*.file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ];
    }
}
